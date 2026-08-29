import { and, eq, inArray, sql } from 'drizzle-orm'

import {
  blocos,
  eventosDeInteracao,
  experiencias,
  politicasDeDisponibilidade,
  pontosDeAcesso,
  sessoesDeInteracao,
  traducoesDaExperiencia,
  traducoesDoBloco,
} from '../../../drizzle/schema.js'
import type { BaseDeDados } from '../../lib/base-de-dados/criar-base-de-dados.js'
import type {
  PortaPublicaDoMomento,
  RepositorioDeAcessoPublicoAMomentos,
} from '../contratos/repositorio-de-acesso-publico-a-momentos.js'

export class RepositorioDeAcessoPublicoAMomentosDrizzle
  implements RepositorioDeAcessoPublicoAMomentos
{
  constructor(private readonly baseDeDados: BaseDeDados) {}

  async resolver(hmacDoToken: string): Promise<PortaPublicaDoMomento | null> {
    const resolucao = await this.baseDeDados.execute<{
      negocio_id: string
      ponto_de_acesso_id: string
    }>(sql`SELECT * FROM public.resolver_ponto_de_acesso_publico(${hmacDoToken}::char(64))`)
    const identidade = resolucao.rows[0]
    if (identidade === undefined) return null

    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${identidade.negocio_id}, true)`,
      )
      const [linha] = await transacao
        .select({
          abreEm: politicasDeDisponibilidade.abreEm,
          configuracao: experiencias.configuracao,
          estadoDaExperiencia: experiencias.estado,
          estadoDaPorta: pontosDeAcesso.estado,
          expiraEm: politicasDeDisponibilidade.expiraEm,
          fusoDaExperiencia: experiencias.fusoHorario,
          fusoDaPolitica: politicasDeDisponibilidade.fusoHorario,
          iniciaEm: pontosDeAcesso.iniciaEm,
          maximoDeUsos: pontosDeAcesso.maximoDeUsos,
          negocioId: experiencias.negocioId,
          pontoDeAcessoId: pontosDeAcesso.id,
          quantidadeDeUsos: pontosDeAcesso.quantidadeDeUsos,
          tipo: pontosDeAcesso.tipo,
          terminaEm: pontosDeAcesso.terminaEm,
          titulo: traducoesDaExperiencia.titulo,
          versaoId: pontosDeAcesso.versaoDaExperienciaId,
        })
        .from(pontosDeAcesso)
        .innerJoin(experiencias, eq(experiencias.id, pontosDeAcesso.experienciaId))
        .innerJoin(
          traducoesDaExperiencia,
          and(
            eq(traducoesDaExperiencia.experienciaId, experiencias.id),
            eq(traducoesDaExperiencia.idioma, experiencias.idiomaPredefinido),
          ),
        )
        .leftJoin(
          politicasDeDisponibilidade,
          eq(
            politicasDeDisponibilidade.versaoDaExperienciaId,
            pontosDeAcesso.versaoDaExperienciaId,
          ),
        )
        .where(
          and(
            eq(pontosDeAcesso.id, identidade.ponto_de_acesso_id),
            eq(experiencias.categoria, 'MOMENTOS'),
            inArray(pontosDeAcesso.tipo, ['URL', 'QR']),
          ),
        )
        .limit(1)
      if (linha === undefined) return null
      const configuracao = linha.configuracao as Record<string, unknown>
      return {
        abreEm: linha.abreEm?.toISOString() ?? null,
        capa: configuracao.capa ?? null,
        estadoDaExperiencia: linha.estadoDaExperiencia,
        estadoDaPorta: linha.estadoDaPorta,
        expiraEm: linha.expiraEm?.toISOString() ?? null,
        fusoHorario: linha.fusoDaPolitica ?? linha.fusoDaExperiencia,
        iniciaEm: linha.iniciaEm?.toISOString() ?? null,
        maximoDeUsos: linha.maximoDeUsos,
        modeloEditorial:
          typeof configuracao.modeloEditorial === 'string'
            ? configuracao.modeloEditorial
            : 'CARTA_INTIMA',
        negocioId: linha.negocioId,
        pontoDeAcessoId: linha.pontoDeAcessoId,
        quantidadeDeUsos: linha.quantidadeDeUsos,
        tipo: linha.tipo as 'URL' | 'QR',
        terminaEm: linha.terminaEm?.toISOString() ?? null,
        titulo: linha.titulo,
        versaoId: linha.versaoId,
      }
    })
  }

  async abrir(entrada: Readonly<{
    estado: 'ATIVA' | 'EM_ESPERA'
    hmacAnonimo: string
    idDoEvento: string
    idDaSessao: string
    ocorreuEm: string
    porta: PortaPublicaDoMomento
  }>) {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${entrada.porta.negocioId}, true)`,
      )
      const pontoBloqueado = await transacao.execute(
        sql`SELECT id FROM pontos_de_acesso WHERE id = ${entrada.porta.pontoDeAcessoId} AND estado = 'ATIVO' FOR UPDATE`,
      )
      if (pontoBloqueado.rows.length === 0) throw new Error('PONTO_INDISPONIVEL')
      const inseridas = await transacao
        .insert(sessoesDeInteracao)
        .values({
          estado: entrada.estado,
          experienciaId: sql`(SELECT experiencia_id FROM pontos_de_acesso WHERE id = ${entrada.porta.pontoDeAcessoId})`,
          hmacDoIdentificadorAnonimo: entrada.hmacAnonimo,
          id: entrada.idDaSessao,
          pontoDeAcessoId: entrada.porta.pontoDeAcessoId,
          versaoDaExperienciaId: entrada.porta.versaoId,
        })
        .onConflictDoNothing()
        .returning({ id: sessoesDeInteracao.id })
      const [sessao] = await transacao
              .select({
                id: sessoesDeInteracao.id,
                estado: sessoesDeInteracao.estado,
                versaoId: sessoesDeInteracao.versaoDaExperienciaId,
              })
              .from(sessoesDeInteracao)
              .where(
                and(
                  eq(sessoesDeInteracao.pontoDeAcessoId, entrada.porta.pontoDeAcessoId),
                  eq(sessoesDeInteracao.hmacDoIdentificadorAnonimo, entrada.hmacAnonimo),
                ),
              )
              .limit(1)
      if (sessao === undefined) throw new Error('SESSAO_NAO_RECUPERADA')
      if (sessao.versaoId !== entrada.porta.versaoId) {
        throw new Error('SESSAO_INCOMPATIVEL')
      }
      if (entrada.estado === 'EM_ESPERA') return { sessaoId: sessao.id }

      const ativadaAgora = inseridas.length > 0 || sessao.estado === 'EM_ESPERA'
      if (sessao.estado === 'EM_ESPERA') {
        await transacao.update(sessoesDeInteracao)
          .set({ estado: 'ATIVA' })
          .where(eq(sessoesDeInteracao.id, sessao.id))
      }
      if (ativadaAgora) {
        const consumida = await transacao.update(pontosDeAcesso)
          .set({ quantidadeDeUsos: sql`${pontosDeAcesso.quantidadeDeUsos} + 1` })
          .where(and(
            eq(pontosDeAcesso.id, entrada.porta.pontoDeAcessoId),
            eq(pontosDeAcesso.estado, 'ATIVO'),
            sql`${pontosDeAcesso.maximoDeUsos} IS NULL OR ${pontosDeAcesso.quantidadeDeUsos} < ${pontosDeAcesso.maximoDeUsos}`,
          ))
          .returning({ id: pontosDeAcesso.id })
        if (consumida.length === 0) throw new Error('LIMITE_DE_USOS_ATINGIDO')
        await transacao.insert(eventosDeInteracao).values({
          chaveDeIdempotencia: `ABERTURA:${sessao.id}`,
          dados: {},
          experienciaId: sql`(SELECT experiencia_id FROM pontos_de_acesso WHERE id = ${entrada.porta.pontoDeAcessoId})`,
          id: entrada.idDoEvento,
          negocioId: entrada.porta.negocioId,
          ocorreuEm: new Date(entrada.ocorreuEm),
          origem: entrada.porta.tipo,
          pontoDeAcessoId: entrada.porta.pontoDeAcessoId,
          sessaoDeInteracaoId: sessao.id,
          tipo: 'EXPERIENCIA_ABERTA',
          versaoDaExperienciaId: entrada.porta.versaoId,
        })
      }

      const [bloco] = await transacao
        .select({
          chave: blocos.chaveDoBloco,
          configuracao: blocos.configuracao,
          conteudo: traducoesDoBloco.conteudo,
          ordem: blocos.posicao,
        })
        .from(blocos)
        .leftJoin(traducoesDoBloco, eq(traducoesDoBloco.blocoId, blocos.id))
        .where(eq(blocos.versaoDaExperienciaId, entrada.porta.versaoId))
        .orderBy(blocos.posicao)
        .limit(1)
      if (bloco === undefined) return { sessaoId: sessao.id }
      await transacao.execute(sql`
        INSERT INTO progressos_da_sessao
          (sessao_id, versao_da_experiencia_id, posicao_atual, atualizado_em)
        VALUES (${sessao.id}, ${entrada.porta.versaoId}, ${bloco.ordem}, ${new Date(entrada.ocorreuEm)})
        ON CONFLICT (sessao_id) DO NOTHING
      `)
      const cfg = bloco.configuracao as Record<string, unknown>
      const conteudo = bloco.conteudo as Record<string, unknown> | null
      return {
        etapa: {
          chave: bloco.chave,
          final: cfg.final === true,
          ordem: bloco.ordem,
          ...(typeof conteudo?.texto === 'string' ? { texto: conteudo.texto } : {}),
          ...(cfg.media === undefined ? {} : { media: cfg.media as never }),
        },
        sessaoId: sessao.id,
      }
    })
  }

  async continuar(entrada: Readonly<{
    chaveDaEtapaAtual: string
    chaveDeIdempotencia: string
    hmacAnonimo: string
    idDoEvento: string
    ocorreuEm: string
    porta: PortaPublicaDoMomento
  }>) {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${entrada.porta.negocioId}, true)`,
      )
      const sessaoResult = await transacao.execute<{
        estado: string
        experiencia_id: string
        id: string
        versao_da_experiencia_id: string
      }>(sql`
        SELECT id, estado, experiencia_id, versao_da_experiencia_id
        FROM sessoes_de_interacao
        WHERE ponto_de_acesso_id = ${entrada.porta.pontoDeAcessoId}
          AND hmac_do_identificador_anonimo = ${entrada.hmacAnonimo}
        FOR UPDATE
      `)
      const sessao = sessaoResult.rows[0]
      if (
        sessao === undefined ||
        !['ATIVA', 'CONCLUIDA'].includes(sessao.estado) ||
        sessao.versao_da_experiencia_id !== entrada.porta.versaoId
      ) {
        throw new Error('CONTINUACAO_SESSAO_INVALIDA')
      }
      const chaveCompleta = `${sessao.id}:CONT:${entrada.chaveDeIdempotencia}`
      const anterior = await transacao.execute<{
        dados: { chaveDaEtapaAtual?: string; proximaPosicao?: number }
      }>(sql`
        SELECT dados FROM eventos_de_interacao
        WHERE experiencia_id = ${sessao.experiencia_id}
          AND chave_de_idempotencia = ${chaveCompleta}
        LIMIT 1
      `)
      if (
        anterior.rows[0] !== undefined &&
        anterior.rows[0].dados.chaveDaEtapaAtual !== entrada.chaveDaEtapaAtual
      ) {
        throw new Error('CONTINUACAO_IDEMPOTENCIA_DIVERGENTE')
      }
      if (anterior.rows[0] !== undefined) {
        const posicaoEntregue = anterior.rows[0].dados.proximaPosicao
        if (posicaoEntregue === undefined) {
          return { estado: 'CONCLUIDA' as const, repetida: true }
        }
        const entregue = await transacao.execute<{
          chave_do_bloco: string
          configuracao: Record<string, unknown>
          conteudo: Record<string, unknown> | null
          posicao: number
        }>(sql`
          SELECT b.chave_do_bloco, b.configuracao, b.posicao, tb.conteudo
          FROM blocos b LEFT JOIN traducoes_do_bloco tb ON tb.bloco_id = b.id
          WHERE b.versao_da_experiencia_id = ${entrada.porta.versaoId}
            AND b.posicao = ${posicaoEntregue} LIMIT 1
        `)
        const blocoEntregue = entregue.rows[0]
        if (blocoEntregue === undefined) throw new Error('CONTINUACAO_PROJECAO_INVALIDA')
        return {
          estado: 'ATIVA' as const,
          etapa: {
            chave: blocoEntregue.chave_do_bloco,
            final: blocoEntregue.configuracao.final === true,
            ordem: blocoEntregue.posicao,
            ...(typeof blocoEntregue.conteudo?.texto === 'string'
              ? { texto: blocoEntregue.conteudo.texto }
              : {}),
          },
          repetida: true,
        }
      }
      if (sessao.estado !== 'ATIVA') {
        throw new Error('CONTINUACAO_SESSAO_INVALIDA')
      }

      const progressoResult = await transacao.execute<{ posicao_atual: number }>(sql`
        SELECT posicao_atual FROM progressos_da_sessao
        WHERE sessao_id = ${sessao.id} FOR UPDATE
      `)
      const progresso = progressoResult.rows[0]
      if (progresso === undefined) throw new Error('CONTINUACAO_SEM_PROGRESSO')
      const atualResult = await transacao.execute<{ chave_do_bloco: string }>(sql`
        SELECT chave_do_bloco FROM blocos
        WHERE versao_da_experiencia_id = ${entrada.porta.versaoId}
          AND posicao = ${progresso.posicao_atual}
      `)
      if (atualResult.rows[0]?.chave_do_bloco !== entrada.chaveDaEtapaAtual) {
        throw new Error('CONTINUACAO_SALTO_NEGADO')
      }

      const proximaResult = await transacao.execute<{
        chave_do_bloco: string
        configuracao: Record<string, unknown>
        conteudo: Record<string, unknown> | null
        posicao: number
      }>(sql`
        SELECT b.chave_do_bloco, b.configuracao, b.posicao, tb.conteudo
        FROM blocos b
        LEFT JOIN traducoes_do_bloco tb ON tb.bloco_id = b.id
        WHERE b.versao_da_experiencia_id = ${entrada.porta.versaoId}
          AND b.posicao = ${progresso.posicao_atual + 1}
        LIMIT 1
      `)
      const proxima = proximaResult.rows[0]
      const repetida = false
      {
        if (proxima === undefined) {
          await transacao.update(sessoesDeInteracao)
            .set({ estado: 'CONCLUIDA', terminadaEm: new Date(entrada.ocorreuEm) })
            .where(eq(sessoesDeInteracao.id, sessao.id))
        } else {
          await transacao.execute(sql`
            UPDATE progressos_da_sessao
            SET posicao_atual = ${proxima.posicao}, atualizado_em = ${new Date(entrada.ocorreuEm)}
            WHERE sessao_id = ${sessao.id}
          `)
        }
        await transacao.insert(eventosDeInteracao).values({
          chaveDeIdempotencia: chaveCompleta,
          chaveDoBloco: entrada.chaveDaEtapaAtual,
          dados: {
            chaveDaEtapaAtual: entrada.chaveDaEtapaAtual,
            ...(proxima === undefined ? {} : { proximaPosicao: proxima.posicao }),
          },
          experienciaId: sessao.experiencia_id,
          id: entrada.idDoEvento,
          negocioId: entrada.porta.negocioId,
          ocorreuEm: new Date(entrada.ocorreuEm),
          origem: 'PUBLICO',
          pontoDeAcessoId: entrada.porta.pontoDeAcessoId,
          sessaoDeInteracaoId: sessao.id,
          tipo: proxima === undefined ? 'EXPERIENCIA_CONCLUIDA' : 'BLOCO_CONTINUADO',
          versaoDaExperienciaId: entrada.porta.versaoId,
        })
      }
      if (proxima === undefined) {
        return { estado: 'CONCLUIDA' as const, repetida }
      }
      return {
        estado: 'ATIVA' as const,
        etapa: {
          chave: proxima.chave_do_bloco,
          final: proxima.configuracao.final === true,
          ordem: proxima.posicao,
          ...(typeof proxima.conteudo?.texto === 'string'
            ? { texto: proxima.conteudo.texto }
            : {}),
          ...(proxima.configuracao.media === undefined
            ? {}
            : { media: proxima.configuracao.media as never }),
        },
        repetida,
      }
    })
  }
}
