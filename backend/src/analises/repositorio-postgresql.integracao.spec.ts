import { randomUUID } from 'node:crypto'

import { describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'

import { membrosDoNegocio, negocios, utilizadores } from '../../drizzle/schema.js'
import { criarBaseDeDados } from '../lib/base-de-dados/criar-base-de-dados.js'
import { RepositorioDeMomentosDrizzle } from '../repository/drizzle/repositorio-de-momentos-drizzle.js'
import { RepositorioDeAnalisesDeMomentosPostgresql } from './repositorio-postgresql.js'

const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO

describe.skipIf(!url)('análises sob RLS num PostgreSQL real', () => {
  it('devolve agregado vazio no próprio negócio e nada noutro tenant', async () => {
    const ligacao = criarBaseDeDados(url as string)
    try {
      const utilizadorId = randomUUID()
      const negocioId = randomUUID()
      const outroNegocioId = randomUUID()
      await ligacao.baseDeDados.insert(utilizadores).values({
        email: `${utilizadorId}@analises.invalid`, id: utilizadorId,
        nomeDeApresentacao: 'Analista',
      })
      for (const id of [negocioId, outroNegocioId]) {
        await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(sql`SELECT set_config('app.negocio_id', ${id}, true)`)
          await transacao.insert(negocios).values({
            codigoDoPais: 'AO', id, identificadorPublico: `analises-${id}`,
            nomeDeApresentacao: 'Negócio', tipo: 'PESSOAL',
          })
          await transacao.insert(membrosDoNegocio).values({
            estado: 'ATIVO', id: randomUUID(), negocioId: id,
            papel: 'PROPRIETARIO', utilizadorId,
          })
        })
      }
      const versaoId = randomUUID()
      const segundoMomentoId = randomUUID()
      await new RepositorioDeMomentosDrizzle(ligacao.baseDeDados).criarRascunho({
        conteudo: { idioma: 'pt-AO', titulo: 'Métricas isoladas' },
        experiencia: {
          categoria: 'MOMENTOS', criadoPorUtilizadorId: utilizadorId,
          estado: 'RASCUNHO', fusoHorario: 'Africa/Luanda', id: segundoMomentoId,
          idiomaPredefinido: 'pt-AO', negocioId,
          versaoDeRascunhoAtualId: versaoId, versaoPublicadaId: null,
        },
        versao: {
          criadoPorUtilizadorId: utilizadorId, estado: 'RASCUNHO',
          experienciaId: segundoMomentoId, id: versaoId, numero: 1,
        },
      })
      const repositorio = new RepositorioDeAnalisesDeMomentosPostgresql(
        ligacao.baseDeDados,
      )
      await expect(
        repositorio.obterEstadoAgregado(negocioId, segundoMomentoId),
      ).resolves.toMatchObject({ sessoesAbertas: 0, conclusoes: 0 })
      await expect(
        repositorio.obterEstadoAgregado(outroNegocioId, segundoMomentoId),
      ).resolves.toBeNull()
    } finally {
      await ligacao.encerrar()
    }
  })
})
