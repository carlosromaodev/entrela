import type { Pool, PoolClient } from 'pg'

import type {
  ContextoAutenticado,
  NovaSessao,
  RepositorioDeAutenticacao,
} from './contratos.js'

type Dependencias = Readonly<{
  gerarId: () => string
  pool: Pool
  schema?: string
}>

export class RepositorioDeAutenticacaoPostgresql
  implements RepositorioDeAutenticacao
{
  private readonly schema: string

  constructor(private readonly dependencias: Dependencias) {
    const schema = dependencias.schema ?? 'public'
    if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
      throw new Error('Schema PostgreSQL inválido.')
    }
    this.schema = `"${schema}"`
  }

  async guardarDesafio(entrada: {
    emailNormalizado: string
    expiraEm: Date
    hmacToken: string
    id: string
  }): Promise<void> {
    await this.dependencias.pool.query(
      `INSERT INTO ${this.schema}.desafios_de_autenticacao
         (id, email_normalizado, hmac_token, expira_em)
       VALUES ($1, $2, $3, $4)`,
      [entrada.id, entrada.emailNormalizado, entrada.hmacToken, entrada.expiraEm],
    )
  }

  async consumirDesafioEProvisionar(entrada: {
    agora: Date
    hmacDoDesafio: string
    novaSessao: NovaSessao
  }): Promise<ContextoAutenticado | null> {
    return this.emTransacao(async (cliente) => {
      const desafio = await cliente.query<{ email_normalizado: string }>(
        `UPDATE ${this.schema}.desafios_de_autenticacao
            SET consumido_em = $1
          WHERE hmac_token = $2
            AND consumido_em IS NULL
            AND expira_em > $1
        RETURNING email_normalizado`,
        [entrada.agora, entrada.hmacDoDesafio],
      )
      const email = desafio.rows[0]?.email_normalizado
      if (email === undefined) return null

      const utilizadorId = await this.obterOuCriarUtilizador(cliente, email)
      const negocioId = await this.obterOuCriarNegocioPessoal(
        cliente,
        utilizadorId,
        email,
      )
      await this.inserirSessao(
        cliente,
        entrada.novaSessao,
        utilizadorId,
        negocioId,
      )
      return {
        negocioId,
        sessaoId: entrada.novaSessao.id,
        utilizadorId,
      }
    })
  }

  async obterSessaoAtiva(
    hmacToken: string,
    agora: Date,
    hmacCsrf?: string,
  ): Promise<ContextoAutenticado | null> {
    const parametros: unknown[] = [hmacToken, agora]
    const filtroCsrf = hmacCsrf === undefined ? '' : 'AND hmac_csrf = $3'
    if (hmacCsrf !== undefined) parametros.push(hmacCsrf)
    const resultado = await this.dependencias.pool.query<{
      id: string
      negocio_id: string
      utilizador_id: string
    }>(
      `SELECT id, negocio_id, utilizador_id
         FROM ${this.schema}.sessoes_do_criador
        WHERE hmac_token = $1
          AND revogada_em IS NULL
          AND expira_em > $2
          ${filtroCsrf}
        LIMIT 1`,
      parametros,
    )
    return this.mapearContexto(resultado.rows[0])
  }

  async revogarSessao(
    hmacToken: string,
    hmacCsrf: string,
    agora: Date,
  ): Promise<boolean> {
    const resultado = await this.dependencias.pool.query(
      `UPDATE ${this.schema}.sessoes_do_criador
          SET revogada_em = $3
        WHERE hmac_token = $1
          AND hmac_csrf = $2
          AND revogada_em IS NULL
          AND expira_em > $3`,
      [hmacToken, hmacCsrf, agora],
    )
    return resultado.rowCount === 1
  }

  async rotacionarSessao(entrada: {
    agora: Date
    hmacAtual: string
    hmacCsrfAtual: string
    novaSessao: NovaSessao
  }): Promise<ContextoAutenticado | null> {
    return this.emTransacao(async (cliente) => {
      const atual = await cliente.query<{
        id: string
        negocio_id: string
        utilizador_id: string
      }>(
        `SELECT id, negocio_id, utilizador_id
           FROM ${this.schema}.sessoes_do_criador
          WHERE hmac_token = $1
            AND hmac_csrf = $2
            AND revogada_em IS NULL
            AND expira_em > $3
          FOR UPDATE`,
        [entrada.hmacAtual, entrada.hmacCsrfAtual, entrada.agora],
      )
      const anterior = atual.rows[0]
      if (anterior === undefined) return null

      await this.inserirSessao(
        cliente,
        entrada.novaSessao,
        anterior.utilizador_id,
        anterior.negocio_id,
      )
      await cliente.query(
        `UPDATE ${this.schema}.sessoes_do_criador
            SET revogada_em = $1, substituida_por_id = $2
          WHERE id = $3`,
        [entrada.agora, entrada.novaSessao.id, anterior.id],
      )
      return {
        negocioId: anterior.negocio_id,
        sessaoId: entrada.novaSessao.id,
        utilizadorId: anterior.utilizador_id,
      }
    })
  }

  private async obterOuCriarUtilizador(
    cliente: PoolClient,
    email: string,
  ): Promise<string> {
    const id = this.dependencias.gerarId()
    const resultado = await cliente.query<{ id: string }>(
      `INSERT INTO ${this.schema}.utilizadores
         (id, email, nome_de_apresentacao)
       VALUES ($1, $2, $2)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [id, email],
    )
    return resultado.rows[0]!.id
  }

  private async obterOuCriarNegocioPessoal(
    cliente: PoolClient,
    utilizadorId: string,
    email: string,
  ): Promise<string> {
    await cliente.query(
      `SELECT id FROM ${this.schema}.utilizadores WHERE id = $1 FOR UPDATE`,
      [utilizadorId],
    )
    const existente = await cliente.query<{ negocio_id: string }>(
      `SELECT negocio_id FROM ${this.schema}.contas_pessoais
        WHERE utilizador_id = $1`,
      [utilizadorId],
    )
    if (existente.rows[0] !== undefined) return existente.rows[0].negocio_id

    const negocioId = this.dependencias.gerarId()
    await cliente.query(
      `INSERT INTO ${this.schema}.negocios
         (id, identificador_publico, nome_de_apresentacao, tipo, codigo_do_pais)
       VALUES ($1, $2, $3, 'PESSOAL', 'AO')`,
      [negocioId, `pessoal-${negocioId}`, email],
    )
    await cliente.query(
      `INSERT INTO ${this.schema}.membros_do_negocio
         (id, negocio_id, utilizador_id, papel, estado)
       VALUES ($1, $2, $3, 'PROPRIETARIO', 'ATIVO')`,
      [this.dependencias.gerarId(), negocioId, utilizadorId],
    )
    await cliente.query(
      `INSERT INTO ${this.schema}.contas_pessoais (utilizador_id, negocio_id)
       VALUES ($1, $2)`,
      [utilizadorId, negocioId],
    )
    return negocioId
  }

  private async inserirSessao(
    cliente: PoolClient,
    sessao: NovaSessao,
    utilizadorId: string,
    negocioId: string,
  ): Promise<void> {
    await cliente.query(
      `INSERT INTO ${this.schema}.sessoes_do_criador
         (id, utilizador_id, negocio_id, hmac_token, hmac_csrf, expira_em)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessao.id,
        utilizadorId,
        negocioId,
        sessao.hmacToken,
        sessao.hmacCsrf,
        sessao.expiraEm,
      ],
    )
  }

  private async emTransacao<T>(operacao: (cliente: PoolClient) => Promise<T>): Promise<T> {
    const cliente = await this.dependencias.pool.connect()
    try {
      await cliente.query('BEGIN')
      const resultado = await operacao(cliente)
      await cliente.query('COMMIT')
      return resultado
    } catch (erro) {
      await cliente.query('ROLLBACK')
      throw erro
    } finally {
      cliente.release()
    }
  }

  private mapearContexto(
    linha: { id: string; negocio_id: string; utilizador_id: string } | undefined,
  ): ContextoAutenticado | null {
    return linha === undefined
      ? null
      : {
          negocioId: linha.negocio_id,
          sessaoId: linha.id,
          utilizadorId: linha.utilizador_id,
        }
  }
}
