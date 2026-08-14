import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type { RascunhoEditorialDoMomento } from './repositorio-de-publicacao-de-momentos.js'

export type CamposEditaveisDoMomento = Partial<
  Pick<
    RascunhoEditorialDoMomento,
    | 'abertura'
    | 'capa'
    | 'etapas'
    | 'idioma'
    | 'modeloEditorial'
    | 'nomeDoDestinatario'
    | 'titulo'
  >
>

export interface RepositorioDeEdicaoDeMomentos {
  atualizarRascunho(
    negocioId: string,
    momentoId: string,
    edicao: CamposEditaveisDoMomento,
  ): Promise<void>
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
  obterRascunho(
    negocioId: string,
    momentoId: string,
  ): Promise<RascunhoEditorialDoMomento | null>
}
