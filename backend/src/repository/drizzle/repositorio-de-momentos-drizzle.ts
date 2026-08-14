import { and, eq, sql } from 'drizzle-orm'

import {
  experiencias,
  membrosDoNegocio,
  traducoesDaExperiencia,
  versoesDaExperiencia,
} from '../../../drizzle/schema.js'
import type { BaseDeDados } from '../../lib/base-de-dados/criar-base-de-dados.js'
import type {
  RascunhoDoMomento,
  RepositorioDeMomentos,
} from '../contratos/repositorio-de-momentos.js'
import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'

export class RepositorioDeMomentosDrizzle implements RepositorioDeMomentos {
  constructor(private readonly baseDeDados: BaseDeDados) {}

  async obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null> {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )
      const [membro] = await transacao
        .select({ papel: membrosDoNegocio.papel })
        .from(membrosDoNegocio)
        .where(
          and(
            eq(membrosDoNegocio.negocioId, negocioId),
            eq(membrosDoNegocio.utilizadorId, utilizadorId),
            eq(membrosDoNegocio.estado, 'ATIVO'),
          ),
        )
        .limit(1)

      return membro?.papel ?? null
    })
  }

  async criarRascunho(rascunho: RascunhoDoMomento): Promise<void> {
    await this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${rascunho.experiencia.negocioId}, true)`,
      )
      await transacao.insert(experiencias).values({
        categoria: rascunho.experiencia.categoria,
        criadoPorUtilizadorId: rascunho.experiencia.criadoPorUtilizadorId,
        estado: rascunho.experiencia.estado,
        fusoHorario: rascunho.experiencia.fusoHorario,
        id: rascunho.experiencia.id,
        idiomaPredefinido: rascunho.experiencia.idiomaPredefinido,
        negocioId: rascunho.experiencia.negocioId,
      })

      await transacao.insert(versoesDaExperiencia).values({
        criadoPorUtilizadorId: rascunho.versao.criadoPorUtilizadorId,
        estado: rascunho.versao.estado,
        experienciaId: rascunho.versao.experienciaId,
        id: rascunho.versao.id,
        numero: rascunho.versao.numero,
      })

      await transacao
        .update(experiencias)
        .set({ versaoDeRascunhoAtualId: rascunho.versao.id })
        .where(eq(experiencias.id, rascunho.experiencia.id))

      await transacao.insert(traducoesDaExperiencia).values({
        experienciaId: rascunho.experiencia.id,
        idioma: rascunho.conteudo.idioma,
        resumo: rascunho.conteudo.nomeDoDestinatario ?? null,
        titulo: rascunho.conteudo.titulo,
      })
    })
  }
}
