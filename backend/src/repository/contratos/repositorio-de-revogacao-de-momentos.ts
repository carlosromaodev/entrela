import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type { PontoDeAcessoPublicado } from './repositorio-de-publicacao-de-momentos.js'

export type ExperienciaPublicavel = Readonly<{
  estado: 'RASCUNHO' | 'PUBLICADA' | 'PAUSADA' | 'ARQUIVADA'
  momentoId: string
  versaoPublicadaId: string | null
}>

export interface RepositorioDeRevogacaoDeMomentos {
  substituirPontosDeAcessoAtomico(
    negocioId: string,
    momentoId: string,
    portas: readonly PontoDeAcessoPublicado[],
  ): Promise<void>
  obterExperiencia(
    negocioId: string,
    momentoId: string,
  ): Promise<ExperienciaPublicavel | null>
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
}
