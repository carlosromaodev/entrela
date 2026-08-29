export type TipoDeMediaDoMomento = 'AUDIO' | 'IMAGEM' | 'VIDEO'
export type EstadoDeMediaDoMomento = 'PENDENTE' | 'PROCESSANDO' | 'PRONTO' | 'FALHOU'

export type MediaDoMomentoNoFrontend = {
  estado: EstadoDeMediaDoMomento
  ficheiroId?: string
  nome: string
  tamanhoEmBytes: number
  tipo: TipoDeMediaDoMomento
}

export type EtapaDoMomentoNoFrontend = {
  chave: string
  final: boolean
  media?: MediaDoMomentoNoFrontend
  ordem: number
  texto: string
  titulo: string
}

export type RascunhoDoMomentoNoFrontend = {
  abertura: { modo: 'ABRIR_AGORA'; fusoHorario: 'Africa/Luanda' } | { modo: 'AGENDAR_ABERTURA'; abreEm: string; fusoHorario: 'Africa/Luanda' }
  capa: { tipo: 'COR'; corHexadecimal: string } | { tipo: 'IMAGEM'; ficheiroId: string; nome: string } | null
  destinatario: string
  estado: 'RASCUNHO' | 'PUBLICADA'
  etapas: EtapaDoMomentoNoFrontend[]
  idioma: 'pt-AO' | 'en'
  modeloEditorial: 'CARTA_INTIMA' | 'MEMORIAS' | 'CELEBRACAO'
  momentoId?: string
  titulo: string
}

export const limitesDeMediaDoMomento = {
  AUDIO: 20 * 1024 * 1024,
  IMAGEM: 10 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
} as const

export const limiteTotalDeMediaDoMomento = 300 * 1024 * 1024
export const maximoDeEtapasDoMomento = 6

export function criarChaveDaEtapa(titulo: string, ordem: number, chavesUsadas: ReadonlySet<string>): string {
  const base = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `etapa-${ordem}`
  const limiteDaBase = chavesUsadas.has(base) ? 76 : 80
  const candidata = chavesUsadas.has(base) ? `${base.slice(0, limiteDaBase)}-${ordem}` : base.slice(0, limiteDaBase)
  return candidata
}

export type ProblemaDoMomento = {
  codigo: string
  mensagem: string
  alvo: 'abertura' | 'capa' | 'etapas' | 'media' | 'titulo'
}

const mensagens: Record<string, Omit<ProblemaDoMomento, 'codigo'>> = {
  ABERTURA_INVALIDA: { alvo: 'abertura', mensagem: 'Escolhe uma data e hora de abertura válidas.' },
  ETAPA_SEM_CONTEUDO: { alvo: 'etapas', mensagem: 'Cada etapa precisa de texto ou media.' },
  MEDIA_NAO_PRONTA: { alvo: 'media', mensagem: 'Espera até todos os ficheiros terminarem de processar.' },
  MEDIA_TOTAL_EXCEDE_LIMITE: { alvo: 'media', mensagem: 'O total de media não pode ultrapassar 300 MB.' },
  QUANTIDADE_DE_ETAPAS_INVALIDA: { alvo: 'etapas', mensagem: 'O momento deve ter entre 1 e 6 etapas.' },
  REVELACAO_FINAL_INVALIDA: { alvo: 'etapas', mensagem: 'A última etapa deve ser a única revelação final.' },
  SEM_CAPA: { alvo: 'capa', mensagem: 'Escolhe uma cor ou imagem de capa.' },
  TITULO_INVALIDO: { alvo: 'titulo', mensagem: 'O título deve ter entre 1 e 100 caracteres.' },
}

export function tipoDeMediaDoFicheiro(ficheiro: File): TipoDeMediaDoMomento | null {
  if (ficheiro.type === 'image/jpeg' || ficheiro.type === 'image/png') return 'IMAGEM'
  if (ficheiro.type === 'audio/mpeg') return 'AUDIO'
  if (ficheiro.type === 'video/mp4') return 'VIDEO'
  return null
}

export function validarFicheiroDoMomento(ficheiro: File): string | null {
  const tipo = tipoDeMediaDoFicheiro(ficheiro)
  if (tipo === null) return 'Usa JPG, PNG, MP3 ou MP4.'
  const limite = limitesDeMediaDoMomento[tipo]
  if (ficheiro.size > limite) {
    const limiteEmMb = Math.round(limite / 1024 / 1024)
    return `${tipo === 'IMAGEM' ? 'A imagem' : tipo === 'AUDIO' ? 'O áudio' : 'O vídeo'} não pode ultrapassar ${limiteEmMb} MB.`
  }
  return null
}

export function validarRascunhoParaPublicacao(rascunho: RascunhoDoMomentoNoFrontend): ProblemaDoMomento[] {
  const codigos: string[] = []
  if (rascunho.titulo.trim().length < 1 || rascunho.titulo.length > 100) codigos.push('TITULO_INVALIDO')
  if (rascunho.capa === null) codigos.push('SEM_CAPA')
  if (rascunho.etapas.length < 1 || rascunho.etapas.length > maximoDeEtapasDoMomento) codigos.push('QUANTIDADE_DE_ETAPAS_INVALIDA')

  const finais = rascunho.etapas.filter((etapa) => etapa.final)
  if (finais.length !== 1 || rascunho.etapas.at(-1)?.final !== true) codigos.push('REVELACAO_FINAL_INVALIDA')

  let totalDeMedia = 0
  for (const etapa of rascunho.etapas) {
    if (etapa.texto.trim().length === 0 && etapa.media === undefined) codigos.push('ETAPA_SEM_CONTEUDO')
    if (etapa.texto.length > 1600) codigos.push('ETAPA_SEM_CONTEUDO')
    if (etapa.media !== undefined) {
      totalDeMedia += etapa.media.tamanhoEmBytes
      if (etapa.media.estado !== 'PRONTO') codigos.push('MEDIA_NAO_PRONTA')
    }
  }
  if (totalDeMedia > limiteTotalDeMediaDoMomento) codigos.push('MEDIA_TOTAL_EXCEDE_LIMITE')

  if (rascunho.abertura.modo === 'AGENDAR_ABERTURA' && !Number.isFinite(Date.parse(rascunho.abertura.abreEm))) codigos.push('ABERTURA_INVALIDA')

  return [...new Set(codigos)].map((codigo) => ({ codigo, ...mensagens[codigo] }))
}

export function formatarTamanhoDoFicheiro(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`
}
