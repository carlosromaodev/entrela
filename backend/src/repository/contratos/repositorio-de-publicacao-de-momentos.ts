import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'

export type MediaDoMomento = Readonly<{
  estado: 'PENDENTE' | 'PRONTO' | 'FALHOU'
  ficheiroId: string
  tamanhoEmBytes: number
  tipo: 'IMAGEM' | 'AUDIO' | 'VIDEO'
}>

export type EtapaDoMomento = Readonly<{
  chave: string
  final: boolean
  media?: MediaDoMomento
  ordem: number
  texto?: string
}>

export type RascunhoEditorialDoMomento = Readonly<{
  abertura:
    | Readonly<{
        fusoHorario: string
        modo: 'ABRIR_AGORA'
      }>
    | Readonly<{
        abreEm: string
        fusoHorario: string
        modo: 'AGENDAR_ABERTURA'
      }>
  capa:
    | Readonly<{ corHexadecimal: string; tipo: 'COR' }>
    | Readonly<{ ficheiroId: string; tipo: 'IMAGEM' }>
    | null
  estado: 'RASCUNHO' | 'PUBLICADA'
  etapas: readonly EtapaDoMomento[]
  idioma: 'pt-AO' | 'en'
  modeloEditorial: 'CARTA_INTIMA' | 'MEMORIAS' | 'CELEBRACAO'
  momentoId: string
  negocioId: string
  nomeDoDestinatario?: string
  titulo: string
  versaoId: string
}>

export type PontoDeAcessoPublicado = Readonly<{
  canalDeOrigem: 'LINK' | 'QR'
  estado: 'ATIVO'
  hmacDoToken: string
  id: string
  momentoId: string
  tipo: 'URL' | 'QR'
  versaoId: string
}>

export type PublicacaoDoMomento = Readonly<{
  abreEm: string
  estadoDaExperiencia: 'PUBLICADA'
  estadoDaVersao: 'PUBLICADA'
  momentoId: string
  negocioId: string
  pontosDeAcesso: readonly PontoDeAcessoPublicado[]
  publicadoEm: string
  somaDeVerificacao: string
  versaoId: string
}>

export interface RepositorioDePublicacaoDeMomentos {
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
  obterRascunho(
    negocioId: string,
    momentoId: string,
  ): Promise<RascunhoEditorialDoMomento | null>
  possuiDireitoAtivo(
    negocioId: string,
    capacidade: 'PUBLICAR_MOMENTO',
  ): Promise<boolean>
  publicarAtomico(publicacao: PublicacaoDoMomento): Promise<void>
}
