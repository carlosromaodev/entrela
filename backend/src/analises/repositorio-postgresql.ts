import { and, eq, sql } from 'drizzle-orm'

import { experiencias, membrosDoNegocio } from '../../drizzle/schema.js'
import type { BaseDeDados } from '../lib/base-de-dados/criar-base-de-dados.js'
import type { PapelDoNegocio } from '../service/politica-de-acesso-ao-negocio.js'
import type {
  EstadoAgregadoDoMomento,
  RepositorioDeAnalisesDeMomentos,
} from './contratos.js'
import {
  EVENTO_DE_ABERTURA_HUMANA,
  EVENTO_DE_CONCLUSAO,
} from './politica-de-metricas.js'

type LinhaAgregada = Readonly<{
  aberturas: string | number
  conclusoes: string | number
  primeira_abertura_em: Date | string | null
  primeira_conclusao_em: Date | string | null
  tipo: 'QR' | 'URL'
  ultima_abertura_em: Date | string | null
}>

function iso(valor: Date | string | null): string | null {
  if (valor === null) return null
  return (valor instanceof Date ? valor : new Date(valor)).toISOString()
}

export class RepositorioDeAnalisesDeMomentosPostgresql
  implements RepositorioDeAnalisesDeMomentos
{
  constructor(private readonly baseDeDados: BaseDeDados) {}

  async obterPapelDoUtilizador(negocioId: string, utilizadorId: string) {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
      const [membro] = await transacao.select({ papel: membrosDoNegocio.papel })
        .from(membrosDoNegocio)
        .where(and(
          eq(membrosDoNegocio.negocioId, negocioId),
          eq(membrosDoNegocio.utilizadorId, utilizadorId),
          eq(membrosDoNegocio.estado, 'ATIVO'),
        )).limit(1)
      return (membro?.papel as PapelDoNegocio | undefined) ?? null
    })
  }

  async obterEstadoAgregado(
    negocioId: string,
    momentoId: string,
    pontoDeAcessoId?: string,
  ): Promise<EstadoAgregadoDoMomento | null> {
    return this.baseDeDados.transaction(async (transacao) => {
      await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
      const [momento] = await transacao.select({ id: experiencias.id })
        .from(experiencias)
        .where(and(
          eq(experiencias.id, momentoId),
          eq(experiencias.negocioId, negocioId),
          eq(experiencias.categoria, 'MOMENTOS'),
        )).limit(1)
      if (momento === undefined) return null

      const resultado = await transacao.execute<LinhaAgregada>(sql`
        WITH producao AS (
          SELECT
            e.sessao_de_interacao_id AS sessao_id,
            p.tipo,
            MIN(e.ocorreu_em) FILTER (
              WHERE e.tipo = ${EVENTO_DE_ABERTURA_HUMANA}
                AND e.origem IN ('URL', 'QR')
            ) AS aberta_em,
            MIN(e.ocorreu_em) FILTER (
              WHERE e.tipo = ${EVENTO_DE_CONCLUSAO}
            ) AS concluida_em
          FROM eventos_de_interacao e
          JOIN sessoes_de_interacao s ON s.id = e.sessao_de_interacao_id
          JOIN pontos_de_acesso p ON p.id = s.ponto_de_acesso_id
          WHERE e.negocio_id = ${negocioId}
            AND e.experiencia_id = ${momentoId}
            AND e.sessao_de_interacao_id IS NOT NULL
            AND s.estado <> 'PRE_VISUALIZACAO'
            AND p.tipo IN ('URL', 'QR')
            ${pontoDeAcessoId === undefined ? sql`` : sql`AND p.id = ${pontoDeAcessoId}`}
          GROUP BY e.sessao_de_interacao_id, p.tipo
        )
        SELECT
          tipo,
          COUNT(*) FILTER (WHERE aberta_em IS NOT NULL) AS aberturas,
          COUNT(*) FILTER (
            WHERE aberta_em IS NOT NULL AND concluida_em IS NOT NULL
          ) AS conclusoes,
          MIN(aberta_em) AS primeira_abertura_em,
          MAX(aberta_em) AS ultima_abertura_em,
          MIN(concluida_em) FILTER (
            WHERE aberta_em IS NOT NULL
          ) AS primeira_conclusao_em
        FROM producao
        GROUP BY tipo
        ORDER BY tipo
      `)
      const linhas = resultado.rows
      const aberturas = linhas.reduce((total, linha) => total + Number(linha.aberturas), 0)
      const conclusoes = linhas.reduce((total, linha) => total + Number(linha.conclusoes), 0)
      const primeirasAberturas = linhas.map((linha) => iso(linha.primeira_abertura_em)).filter((v): v is string => v !== null).sort()
      const ultimasAberturas = linhas.map((linha) => iso(linha.ultima_abertura_em)).filter((v): v is string => v !== null).sort()
      const conclusoesEm = linhas.map((linha) => iso(linha.primeira_conclusao_em)).filter((v): v is string => v !== null).sort()
      return {
        conclusoes,
        primeiraAberturaEm: primeirasAberturas[0] ?? null,
        primeiraConclusaoEm: conclusoesEm[0] ?? null,
        origens: linhas.map((linha) => ({
          aberturas: Number(linha.aberturas),
          conclusoes: Number(linha.conclusoes),
          tipo: linha.tipo,
        })),
        sessoesAbertas: aberturas,
        ultimaAberturaEm: ultimasAberturas.at(-1) ?? null,
      }
    })
  }
}
