import type { PapelDoNegocio } from '../service/politica-de-acesso-ao-negocio.js'

export type EstadoAgregadoDoMomento = Readonly<{
  conclusoes: number
  primeiraAberturaEm: string | null
  primeiraConclusaoEm: string | null
  origens: readonly Readonly<{
    aberturas: number
    conclusoes: number
    tipo: 'QR' | 'URL'
  }>[]
  sessoesAbertas: number
  ultimaAberturaEm: string | null
}>

export interface RepositorioDeAnalisesDeMomentos {
  obterEstadoAgregado(
    negocioId: string,
    momentoId: string,
    pontoDeAcessoId?: string,
  ): Promise<EstadoAgregadoDoMomento | null>
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
}
