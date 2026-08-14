export type IdiomaDoMomento = 'pt-AO' | 'en'

export type RascunhoDoMomento = Readonly<{
  conteudo: Readonly<{
    idioma: IdiomaDoMomento
    nomeDoDestinatario?: string
    titulo: string
  }>
  experiencia: Readonly<{
    categoria: 'MOMENTOS'
    criadoPorUtilizadorId: string
    estado: 'RASCUNHO'
    fusoHorario: string
    id: string
    idiomaPredefinido: IdiomaDoMomento
    negocioId: string
    versaoDeRascunhoAtualId: string
    versaoPublicadaId: null
  }>
  versao: Readonly<{
    criadoPorUtilizadorId: string
    estado: 'RASCUNHO'
    experienciaId: string
    id: string
    numero: 1
  }>
}>

export interface RepositorioDeMomentos {
  criarRascunho(rascunho: RascunhoDoMomento): Promise<void>
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
}
import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
