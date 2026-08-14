import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type { RascunhoEditorialDoMomento } from './repositorio-de-publicacao-de-momentos.js'

export interface RepositorioDeConsultaDeMomentos {
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
  obterRascunho(
    negocioId: string,
    momentoId: string,
  ): Promise<RascunhoEditorialDoMomento | null>
}
