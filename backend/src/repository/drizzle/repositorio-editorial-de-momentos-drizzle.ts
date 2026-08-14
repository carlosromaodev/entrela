import { and, eq, gt, inArray, isNull, lte, or, sql } from 'drizzle-orm'

import {
  blocos,
  direitos,
  experiencias,
  membrosDoNegocio,
  politicasDeDisponibilidade,
  pontosDeAcesso,
  traducoesDaExperiencia,
  traducoesDoBloco,
  versoesDaExperiencia,
} from '../../../drizzle/schema.js'
import type { BaseDeDados } from '../../lib/base-de-dados/criar-base-de-dados.js'
import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type {
  CamposEditaveisDoMomento,
  RepositorioDeEdicaoDeMomentos,
} from '../contratos/repositorio-de-edicao-de-momentos.js'
import type {
  EtapaDoMomento,
  MediaDoMomento,
  PontoDeAcessoPublicado,
  PublicacaoDoMomento,
  RascunhoEditorialDoMomento,
  RepositorioDePublicacaoDeMomentos,
} from '../contratos/repositorio-de-publicacao-de-momentos.js'
import type {
  ExperienciaPublicavel,
  RepositorioDeRevogacaoDeMomentos,
} from '../contratos/repositorio-de-revogacao-de-momentos.js'

type ConfiguracaoDaExperiencia = Readonly<{
  capa?: RascunhoEditorialDoMomento['capa']
  modeloEditorial?: RascunhoEditorialDoMomento['modeloEditorial']
}>

type ConfiguracaoDoBloco = Readonly<{
  final?: boolean
  media?: MediaDoMomento
}>

type ConteudoDoBloco = Readonly<{ texto?: string }>

type DependenciasDoRepositorioEditorial = Readonly<{
  gerarId: () => string
}>

const BLOCO_TIPO_ETAPA = 'ETAPA'

export class RepositorioEditorialDeMomentosDrizzle
  implements
    RepositorioDeEdicaoDeMomentos,
    RepositorioDePublicacaoDeMomentos,
    RepositorioDeRevogacaoDeMomentos
{
  constructor(
    private readonly baseDeDados: BaseDeDados,
    private readonly dependencias: DependenciasDoRepositorioEditorial,
  ) {}

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

  async obterRascunho(
    negocioId: string,
    momentoId: string,
  ): Promise<RascunhoEditorialDoMomento | null> {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )

      const [experiencia] = await transacao
        .select()
        .from(experiencias)
        .where(
          and(
            eq(experiencias.id, momentoId),
            eq(experiencias.negocioId, negocioId),
          ),
        )
        .limit(1)
      if (experiencia === undefined) return null

      const versaoId =
        experiencia.estado === 'PUBLICADA'
          ? experiencia.versaoPublicadaId
          : experiencia.versaoDeRascunhoAtualId
      if (versaoId === null) return null

      const [traducao] = await transacao
        .select()
        .from(traducoesDaExperiencia)
        .where(
          and(
            eq(traducoesDaExperiencia.experienciaId, momentoId),
            eq(traducoesDaExperiencia.idioma, experiencia.idiomaPredefinido),
          ),
        )
        .limit(1)

      const linhasDosBlocos = await transacao
        .select()
        .from(blocos)
        .where(eq(blocos.versaoDaExperienciaId, versaoId))
        .orderBy(blocos.posicao)

      const idsDosBlocos = linhasDosBlocos.map((bloco) => bloco.id)
      const traducoesDosBlocos =
        idsDosBlocos.length === 0
          ? []
          : await transacao
              .select()
              .from(traducoesDoBloco)
              .where(
                and(
                  inArray(traducoesDoBloco.blocoId, idsDosBlocos),
                  eq(traducoesDoBloco.idioma, experiencia.idiomaPredefinido),
                ),
              )

      const [politica] = await transacao
        .select()
        .from(politicasDeDisponibilidade)
        .where(eq(politicasDeDisponibilidade.versaoDaExperienciaId, versaoId))
        .limit(1)

      const configuracao = experiencia.configuracao as ConfiguracaoDaExperiencia

      const etapas: EtapaDoMomento[] = linhasDosBlocos.map((bloco) => {
        const configuracaoDoBloco = bloco.configuracao as ConfiguracaoDoBloco
        const conteudo = traducoesDosBlocos.find(
          (traducaoDoBloco) => traducaoDoBloco.blocoId === bloco.id,
        )?.conteudo as ConteudoDoBloco | undefined

        return {
          chave: bloco.chaveDoBloco,
          final: configuracaoDoBloco.final ?? false,
          ordem: bloco.posicao,
          ...(configuracaoDoBloco.media === undefined
            ? {}
            : { media: configuracaoDoBloco.media }),
          ...(conteudo?.texto === undefined ? {} : { texto: conteudo.texto }),
        }
      })

      const abertura: RascunhoEditorialDoMomento['abertura'] =
        politica === undefined || politica.modo !== 'AGENDAR_ABERTURA'
          ? {
              fusoHorario: politica?.fusoHorario ?? experiencia.fusoHorario,
              modo: 'ABRIR_AGORA',
            }
          : {
              abreEm: (politica.abreEm ?? new Date()).toISOString(),
              fusoHorario: politica.fusoHorario,
              modo: 'AGENDAR_ABERTURA',
            }

      return {
        abertura,
        capa: configuracao.capa ?? null,
        estado: experiencia.estado === 'PUBLICADA' ? 'PUBLICADA' : 'RASCUNHO',
        etapas,
        idioma: experiencia.idiomaPredefinido,
        modeloEditorial: configuracao.modeloEditorial ?? 'CARTA_INTIMA',
        momentoId: experiencia.id,
        negocioId: experiencia.negocioId,
        ...(traducao?.resumo == null ? {} : { nomeDoDestinatario: traducao.resumo }),
        titulo: traducao?.titulo ?? '',
        versaoId,
      }
    })
  }

  async atualizarRascunho(
    negocioId: string,
    momentoId: string,
    edicao: CamposEditaveisDoMomento,
  ): Promise<void> {
    await this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )

      const [experiencia] = await transacao
        .select()
        .from(experiencias)
        .where(
          and(
            eq(experiencias.id, momentoId),
            eq(experiencias.negocioId, negocioId),
          ),
        )
        .limit(1)
      if (experiencia === undefined) throw new Error('RASCUNHO_INEXISTENTE')

      const versaoId = experiencia.versaoDeRascunhoAtualId
      if (versaoId === null) throw new Error('RASCUNHO_SEM_VERSAO')

      let idiomaAtual = experiencia.idiomaPredefinido

      if (edicao.idioma !== undefined && edicao.idioma !== idiomaAtual) {
        await transacao
          .update(experiencias)
          .set({ idiomaPredefinido: edicao.idioma })
          .where(eq(experiencias.id, momentoId))
        await transacao
          .update(traducoesDaExperiencia)
          .set({ idioma: edicao.idioma })
          .where(
            and(
              eq(traducoesDaExperiencia.experienciaId, momentoId),
              eq(traducoesDaExperiencia.idioma, idiomaAtual),
            ),
          )

        const idsDosBlocosDaVersao = await transacao
          .select({ id: blocos.id })
          .from(blocos)
          .where(eq(blocos.versaoDaExperienciaId, versaoId))
        if (idsDosBlocosDaVersao.length > 0) {
          await transacao
            .update(traducoesDoBloco)
            .set({ idioma: edicao.idioma })
            .where(
              and(
                inArray(
                  traducoesDoBloco.blocoId,
                  idsDosBlocosDaVersao.map((linha) => linha.id),
                ),
                eq(traducoesDoBloco.idioma, idiomaAtual),
              ),
            )
        }

        idiomaAtual = edicao.idioma
      }

      if (edicao.titulo !== undefined || edicao.nomeDoDestinatario !== undefined) {
        await transacao
          .update(traducoesDaExperiencia)
          .set({
            ...(edicao.titulo === undefined ? {} : { titulo: edicao.titulo }),
            ...(edicao.nomeDoDestinatario === undefined
              ? {}
              : { resumo: edicao.nomeDoDestinatario }),
          })
          .where(
            and(
              eq(traducoesDaExperiencia.experienciaId, momentoId),
              eq(traducoesDaExperiencia.idioma, idiomaAtual),
            ),
          )
      }

      if (edicao.capa !== undefined || edicao.modeloEditorial !== undefined) {
        const configuracaoAtual = (experiencia.configuracao ??
          {}) as Record<string, unknown>
        await transacao
          .update(experiencias)
          .set({
            configuracao: {
              ...configuracaoAtual,
              ...(edicao.capa === undefined ? {} : { capa: edicao.capa }),
              ...(edicao.modeloEditorial === undefined
                ? {}
                : { modeloEditorial: edicao.modeloEditorial }),
            },
          })
          .where(eq(experiencias.id, momentoId))
      }

      if (edicao.abertura !== undefined) {
        const abertura = edicao.abertura
        const valores = {
          abreEm:
            abertura.modo === 'AGENDAR_ABERTURA'
              ? new Date(abertura.abreEm)
              : null,
          fusoHorario: abertura.fusoHorario,
          modo: abertura.modo,
        }
        await transacao
          .insert(politicasDeDisponibilidade)
          .values({ ...valores, versaoDaExperienciaId: versaoId })
          .onConflictDoUpdate({
            set: valores,
            target: politicasDeDisponibilidade.versaoDaExperienciaId,
          })
      }

      if (edicao.etapas !== undefined) {
        const idsDosBlocosAntigos = await transacao
          .select({ id: blocos.id })
          .from(blocos)
          .where(eq(blocos.versaoDaExperienciaId, versaoId))
        if (idsDosBlocosAntigos.length > 0) {
          await transacao.delete(traducoesDoBloco).where(
            inArray(
              traducoesDoBloco.blocoId,
              idsDosBlocosAntigos.map((linha) => linha.id),
            ),
          )
          await transacao
            .delete(blocos)
            .where(eq(blocos.versaoDaExperienciaId, versaoId))
        }

        for (const etapa of edicao.etapas) {
          const blocoId = this.dependencias.gerarId()
          const configuracaoDoBloco: ConfiguracaoDoBloco = {
            final: etapa.final,
            ...(etapa.media === undefined ? {} : { media: etapa.media }),
          }
          await transacao.insert(blocos).values({
            chaveDoBloco: etapa.chave,
            configuracao: configuracaoDoBloco,
            id: blocoId,
            posicao: etapa.ordem,
            tipo: BLOCO_TIPO_ETAPA,
            versaoDaExperienciaId: versaoId,
          })

          if (etapa.texto !== undefined) {
            const conteudoDoBloco: ConteudoDoBloco = { texto: etapa.texto }
            await transacao.insert(traducoesDoBloco).values({
              blocoId,
              conteudo: conteudoDoBloco,
              idioma: idiomaAtual,
            })
          }
        }
      }
    })
  }

  async possuiDireitoAtivo(
    negocioId: string,
    capacidade: 'PUBLICAR_MOMENTO',
  ): Promise<boolean> {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )
      const agora = new Date()
      const [direito] = await transacao
        .select({ id: direitos.id })
        .from(direitos)
        .where(
          and(
            eq(direitos.negocioId, negocioId),
            eq(direitos.tipo, capacidade),
            eq(direitos.estado, 'ATIVO'),
            lte(direitos.iniciaEm, agora),
            or(isNull(direitos.terminaEm), gt(direitos.terminaEm, agora)),
          ),
        )
        .limit(1)

      return direito !== undefined
    })
  }

  async publicarAtomico(publicacao: PublicacaoDoMomento): Promise<void> {
    await this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${publicacao.negocioId}, true)`,
      )

      // Porta de concorrência: só avança se a experiência ainda estiver em
      // RASCUNHO no momento exacto da escrita. O UPDATE...WHERE é atómico ao
      // nível do PostgreSQL (bloqueio de linha); duas publicações concorrentes
      // do mesmo Momento nunca produzem duas versões publicadas.
      const linhasGanhas = await transacao
        .update(experiencias)
        .set({
          estado: 'PUBLICADA',
          publicadaEm: new Date(publicacao.publicadoEm),
          versaoPublicadaId: publicacao.versaoId,
        })
        .where(
          and(
            eq(experiencias.id, publicacao.momentoId),
            eq(experiencias.estado, 'RASCUNHO'),
          ),
        )
        .returning({ id: experiencias.id })

      if (linhasGanhas.length === 0) {
        throw new Error('CONFLITO_DE_PUBLICACAO')
      }

      await transacao
        .update(versoesDaExperiencia)
        .set({
          estado: 'PUBLICADA',
          publicadaEm: new Date(publicacao.publicadoEm),
          somaDeVerificacao: publicacao.somaDeVerificacao,
        })
        .where(eq(versoesDaExperiencia.id, publicacao.versaoId))

      for (const ponto of publicacao.pontosDeAcesso) {
        await transacao.insert(pontosDeAcesso).values({
          canalDeOrigem: ponto.canalDeOrigem,
          estado: 'ATIVO',
          experienciaId: publicacao.momentoId,
          hmacDoTokenPublico: ponto.hmacDoToken,
          id: ponto.id,
          tipo: ponto.tipo,
          versaoDaExperienciaId: publicacao.versaoId,
        })
      }
    })
  }

  async obterExperiencia(
    negocioId: string,
    momentoId: string,
  ): Promise<ExperienciaPublicavel | null> {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )
      const [experiencia] = await transacao
        .select({
          estado: experiencias.estado,
          versaoPublicadaId: experiencias.versaoPublicadaId,
        })
        .from(experiencias)
        .where(
          and(
            eq(experiencias.id, momentoId),
            eq(experiencias.negocioId, negocioId),
          ),
        )
        .limit(1)
      if (experiencia === undefined) return null

      return {
        estado: experiencia.estado,
        momentoId,
        versaoPublicadaId: experiencia.versaoPublicadaId,
      }
    })
  }

  async substituirPontosDeAcessoAtomico(
    negocioId: string,
    momentoId: string,
    portas: readonly PontoDeAcessoPublicado[],
  ): Promise<void> {
    await this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(
        sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
      )
      await transacao.execute(
        sql`SELECT id FROM experiencias WHERE id = ${momentoId} AND negocio_id = ${negocioId} FOR UPDATE`,
      )
      await transacao
        .update(pontosDeAcesso)
        .set({ estado: 'REVOGADO' })
        .where(
          and(
            eq(pontosDeAcesso.experienciaId, momentoId),
            eq(pontosDeAcesso.estado, 'ATIVO'),
          ),
        )
      for (const porta of portas) {
        await transacao.insert(pontosDeAcesso).values({
          canalDeOrigem: porta.canalDeOrigem,
          estado: 'ATIVO',
          experienciaId: porta.momentoId,
          hmacDoTokenPublico: porta.hmacDoToken,
          id: porta.id,
          tipo: porta.tipo,
          versaoDaExperienciaId: porta.versaoId,
        })
      }
    })
  }
}
