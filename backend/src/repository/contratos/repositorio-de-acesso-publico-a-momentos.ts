import type { EtapaDoMomento } from './repositorio-de-publicacao-de-momentos.js'

export type PortaPublicaDoMomento = Readonly<{
  abreEm: string | null
  capa: unknown
  estadoDaExperiencia: 'RASCUNHO' | 'PUBLICADA' | 'PAUSADA' | 'ARQUIVADA'
  estadoDaPorta: 'ATIVO' | 'REVOGADO' | 'EXPIRADO'
  expiraEm: string | null
  fusoHorario: string
  iniciaEm: string | null
  maximoDeUsos: number | null
  modeloEditorial: string
  negocioId: string
  pontoDeAcessoId: string
  quantidadeDeUsos: number
  titulo: string
  tipo: 'URL' | 'QR'
  terminaEm: string | null
  versaoId: string
}>

export interface RepositorioDeAcessoPublicoAMomentos {
  abrir(entrada: Readonly<{
    estado: 'ATIVA' | 'EM_ESPERA'
    hmacAnonimo: string
    idDoEvento: string
    idDaSessao: string
    ocorreuEm: string
    porta: PortaPublicaDoMomento
  }>): Promise<Readonly<{ etapa?: EtapaDoMomento; sessaoId: string }>>
  continuar(entrada: Readonly<{
    chaveDaEtapaAtual: string
    chaveDeIdempotencia: string
    hmacAnonimo: string
    idDoEvento: string
    ocorreuEm: string
    porta: PortaPublicaDoMomento
  }>): Promise<
    | Readonly<{ estado: 'ATIVA'; etapa: EtapaDoMomento; repetida: boolean }>
    | Readonly<{ estado: 'CONCLUIDA'; repetida: boolean }>
  >
  resolver(hmacDoToken: string): Promise<PortaPublicaDoMomento | null>
}
