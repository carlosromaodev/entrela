import { randomUUID } from 'node:crypto'

import { sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  experiencias,
  membrosDoNegocio,
  negocios,
  utilizadores,
} from '../../../drizzle/schema.js'
import {
  criarBaseDeDados,
  type LigacaoComBaseDeDados,
} from '../../lib/base-de-dados/criar-base-de-dados.js'
import { RepositorioDeMomentosDrizzle } from './repositorio-de-momentos-drizzle.js'

// Este ficheiro só corre contra um PostgreSQL 18 real, nunca contra mocks.
// Definir URL_DE_BASE_DE_DADOS_DE_INTEGRACAO para o activar localmente ou em CI.
// A ligação TEM de usar um papel que não seja superutilizador: um superutilizador
// ignora RLS mesmo com FORCE ROW LEVEL SECURITY, o que esconderia falhas reais.
const urlDeIntegracao = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO

describe.skipIf(!urlDeIntegracao)(
  'isolamento por negócio num PostgreSQL 18 real',
  () => {
    let ligacao: LigacaoComBaseDeDados

    beforeAll(() => {
      ligacao = criarBaseDeDados(urlDeIntegracao as string)
    })

    afterAll(async () => {
      await ligacao.encerrar()
    })

    async function criarUtilizador(): Promise<string> {
      const id = randomUUID()
      await ligacao.baseDeDados.insert(utilizadores).values({
        email: `${id}@teste.entrela.invalid`,
        id,
        nomeDeApresentacao: 'Utilizador de teste',
      })
      return id
    }

    async function criarNegocioComMembro(
      utilizadorId: string,
    ): Promise<string> {
      const negocioId = randomUUID()
      await ligacao.baseDeDados.transaction(async (transacao) => {
        await transacao.execute(
          sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
        )
        await transacao.insert(negocios).values({
          codigoDoPais: 'AO',
          id: negocioId,
          identificadorPublico: `negocio-${negocioId}`,
          nomeDeApresentacao: 'Negócio de teste',
          tipo: 'PESSOAL',
        })
        await transacao.insert(membrosDoNegocio).values({
          estado: 'ATIVO',
          id: randomUUID(),
          negocioId,
          papel: 'PROPRIETARIO',
          utilizadorId,
        })
      })
      return negocioId
    }

    it('permite ao repositório de produção ler e escrever dentro do próprio negócio', async () => {
      const utilizadorId = await criarUtilizador()
      const negocioId = await criarNegocioComMembro(utilizadorId)
      const repositorio = new RepositorioDeMomentosDrizzle(
        ligacao.baseDeDados,
      )

      const papel = await repositorio.obterPapelDoUtilizador(
        negocioId,
        utilizadorId,
      )
      expect(papel).toBe('PROPRIETARIO')

      const experienciaId = randomUUID()
      const versaoId = randomUUID()
      await repositorio.criarRascunho({
        conteudo: {
          idioma: 'pt-AO',
          nomeDoDestinatario: 'Ana',
          titulo: 'Uma surpresa real em PostgreSQL',
        },
        experiencia: {
          categoria: 'MOMENTOS',
          criadoPorUtilizadorId: utilizadorId,
          estado: 'RASCUNHO',
          fusoHorario: 'Africa/Luanda',
          id: experienciaId,
          idiomaPredefinido: 'pt-AO',
          negocioId,
          versaoDeRascunhoAtualId: versaoId,
          versaoPublicadaId: null,
        },
        versao: {
          criadoPorUtilizadorId: utilizadorId,
          estado: 'RASCUNHO',
          experienciaId,
          id: versaoId,
          numero: 1,
        },
      })

      const linhaVisivelDoProprioNegocio = await ligacao.baseDeDados.transaction(
        async (transacao) => {
          await transacao.execute(
            sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
          )
          return transacao
            .select({ titulo: experiencias.id })
            .from(experiencias)
            .where(sql`${experiencias.id} = ${experienciaId}`)
        },
      )

      expect(linhaVisivelDoProprioNegocio).toHaveLength(1)
    })

    it('nega leitura e escrita cruzada entre negócios com RLS forçado', async () => {
      const utilizadorA = await criarUtilizador()
      const negocioAId = await criarNegocioComMembro(utilizadorA)
      const utilizadorB = await criarUtilizador()
      const negocioBId = await criarNegocioComMembro(utilizadorB)

      const experienciaDoNegocioAId = randomUUID()
      await ligacao.baseDeDados.transaction(async (transacao) => {
        await transacao.execute(
          sql`SELECT set_config('app.negocio_id', ${negocioAId}, true)`,
        )
        await transacao.insert(experiencias).values({
          categoria: 'MOMENTOS',
          criadoPorUtilizadorId: utilizadorA,
          id: experienciaDoNegocioAId,
          negocioId: negocioAId,
        })
      })

      const linhaVistaPeloNegocioB = await ligacao.baseDeDados.transaction(
        async (transacao) => {
          await transacao.execute(
            sql`SELECT set_config('app.negocio_id', ${negocioBId}, true)`,
          )
          return transacao
            .select({ id: experiencias.id })
            .from(experiencias)
            .where(sql`${experiencias.id} = ${experienciaDoNegocioAId}`)
        },
      )

      expect(linhaVistaPeloNegocioB).toHaveLength(0)

      let erroDaEscritaCruzada: unknown
      try {
        await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(
            sql`SELECT set_config('app.negocio_id', ${negocioBId}, true)`,
          )
          await transacao.insert(experiencias).values({
            categoria: 'MOMENTOS',
            criadoPorUtilizadorId: utilizadorB,
            id: randomUUID(),
            // tenta gravar um dado do negócio A fingindo ser o negócio B
            negocioId: negocioAId,
          })
        })
      } catch (erro) {
        erroDaEscritaCruzada = erro
      }

      expect(erroDaEscritaCruzada).toBeDefined()
      const causaOriginal =
        erroDaEscritaCruzada instanceof Error &&
        'cause' in erroDaEscritaCruzada
          ? erroDaEscritaCruzada.cause
          : erroDaEscritaCruzada
      expect(causaOriginal).toMatchObject({
        code: '42501',
        message: expect.stringMatching(/row-level security policy/i),
      })

      const papelCruzado = await new RepositorioDeMomentosDrizzle(
        ligacao.baseDeDados,
      ).obterPapelDoUtilizador(negocioBId, utilizadorA)
      expect(papelCruzado).toBeNull()
    })
  },
)
