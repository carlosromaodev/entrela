const origemDaApi = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')

export class ErroDaApi extends Error {
  constructor(readonly codigo: string, readonly estadoHttp: number) {
    super(codigo)
    this.name = 'ErroDaApi'
  }
}

function lerCookie(nome: string) {
  return document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${nome}=`))?.slice(nome.length + 1)
}

async function pedir<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const metodo = (opcoes.method ?? 'GET').toUpperCase()
  const alteraEstado = !['GET', 'HEAD', 'OPTIONS'].includes(metodo)
  const csrf = alteraEstado ? lerCookie('__Host-entrela-csrf') : undefined
  const resposta = await fetch(`${origemDaApi}${caminho}`, {
    ...opcoes,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
      ...opcoes.headers,
    },
  })
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null) as { erro?: { codigo?: string } } | null
    throw new ErroDaApi(corpo?.erro?.codigo ?? 'PEDIDO_FALHOU', resposta.status)
  }
  if (resposta.status === 204) return undefined as T
  return resposta.json() as Promise<T>
}

export function solicitarDesafioDeAutenticacao(email: string) {
  return pedir<{ dados: { aceite: true } }>('/v1/autenticacao/desafios', { method: 'POST', body: JSON.stringify({ email }) })
}

export function confirmarDesafioDeAutenticacao(token: string) {
  return pedir<{ dados: { negocioId: string; sessaoId: string; utilizadorId: string } }>('/v1/autenticacao/confirmacoes', { method: 'POST', body: JSON.stringify({ token }) })
}

export function terminarSessao() {
  return pedir<void>('/v1/autenticacao/sessao', { method: 'DELETE' })
}

export function criarMomento(dados: { fusoHorario: string; idioma: 'pt-AO' | 'en'; nomeDoDestinatario?: string; titulo: string }) {
  return pedir<{ dados: { estado: 'RASCUNHO'; momentoId: string; versaoDeRascunhoId: string } }>('/v1/momentos', { method: 'POST', body: JSON.stringify(dados) })
}

export function consultarMomento(momentoId: string) {
  return pedir<{ dados: unknown }>(`/v1/momentos/${encodeURIComponent(momentoId)}`)
}

export function atualizarMomento(momentoId: string, dados: Record<string, unknown>) {
  return pedir<{ dados: { estado: 'RASCUNHO'; momentoId: string; versaoId: string } }>(`/v1/momentos/${encodeURIComponent(momentoId)}`, { method: 'PATCH', body: JSON.stringify(dados) })
}

export function publicarMomento(momentoId: string) {
  return pedir<{ dados: { abreEm: string; estado: 'PUBLICADA'; momentoId: string; portas: Array<{ tipo: 'URL' | 'QR'; token: string }>; versaoId: string } }>(`/v1/momentos/${encodeURIComponent(momentoId)}/publicacoes`, { method: 'POST' })
}

export function solicitarUploadPrivado(momentoId: string, dados: { mime: string; tamanhoEmBytes: number; tipo: 'AUDIO' | 'IMAGEM' | 'VIDEO' }) {
  return pedir<{ dados: { estado: 'PENDENTE'; expiraEm: string; ficheiroId: string; upload: { campos: Record<string, string>; url: string } } }>(`/v1/momentos/${encodeURIComponent(momentoId)}/ficheiros/uploads`, { method: 'POST', body: JSON.stringify(dados) })
}

export function confirmarUploadPrivado(ficheiroId: string) {
  return pedir<{ dados: { estado: 'PENDENTE' | 'PROCESSANDO' | 'PRONTO' | 'FALHOU'; ficheiroId: string } }>(`/v1/ficheiros/${encodeURIComponent(ficheiroId)}/confirmacoes`, { method: 'POST' })
}

export type EtapaPublicaDaApi = { chave: string; final: boolean; ordem: number; texto?: string; media?: unknown }

export function resolverMomentoPublico(token: string) {
  return pedir<{ dados: { abreEm: string; estado: 'EM_ESPERA' } | { capa: unknown; estado: 'DISPONIVEL'; modeloEditorial: string; titulo: string } }>(`/momento/${encodeURIComponent(token)}`)
}

export function abrirMomentoPublico(token: string) {
  return pedir<{ dados: { abreEm: string; estado: 'EM_ESPERA' } | { estado: 'ATIVA'; etapa?: EtapaPublicaDaApi } }>(`/momento/${encodeURIComponent(token)}/abrir`, { method: 'POST' })
}

export function continuarMomentoPublico(token: string, chaveDaEtapaAtual: string) {
  return pedir<{ dados: { estado: 'CONCLUIDA'; repetida: boolean } | { estado: 'ATIVA'; etapa: EtapaPublicaDaApi; repetida: boolean } }>(`/momento/${encodeURIComponent(token)}/continuar`, { method: 'POST', body: JSON.stringify({ chaveDaEtapaAtual, chaveDeIdempotencia: crypto.randomUUID() }) })
}

export async function enviarFicheiroParaArmazenamentoPrivado(
  momentoId: string,
  ficheiro: File,
  tipo: 'AUDIO' | 'IMAGEM' | 'VIDEO',
  aoMudarEstado?: (estado: 'PENDENTE' | 'PROCESSANDO' | 'PRONTO' | 'FALHOU') => void,
) {
  const solicitado = await solicitarUploadPrivado(momentoId, { mime: ficheiro.type, tamanhoEmBytes: ficheiro.size, tipo })
  aoMudarEstado?.('PENDENTE')
  let envio: Response
  if (new URL(solicitado.dados.upload.url, window.location.href).pathname === '/media-local/uploads') {
    envio = await fetch(solicitado.dados.upload.url, {
      method: 'PUT',
      headers: { 'Content-Type': solicitado.dados.upload.campos['Content-Type'] ?? ficheiro.type },
      body: ficheiro,
    })
  } else {
    const formulario = new FormData()
    Object.entries(solicitado.dados.upload.campos).forEach(([chave, valor]) => formulario.append(chave, valor))
    formulario.append('file', ficheiro)
    envio = await fetch(solicitado.dados.upload.url, { method: 'POST', body: formulario })
  }
  if (!envio.ok) throw new ErroDaApi('UPLOAD_FALHOU', envio.status)

  let estado: 'PENDENTE' | 'PROCESSANDO' | 'PRONTO' | 'FALHOU' = 'PENDENTE'
  for (let tentativa = 0; tentativa < 12; tentativa += 1) {
    const confirmacao = await confirmarUploadPrivado(solicitado.dados.ficheiroId)
    estado = confirmacao.dados.estado
    aoMudarEstado?.(estado)
    if (estado === 'PRONTO') return { ficheiroId: solicitado.dados.ficheiroId, estado }
    if (estado === 'FALHOU') throw new ErroDaApi('MEDIA_REPROVADO', 422)
    await new Promise((resolver) => window.setTimeout(resolver, 650))
  }
  throw new ErroDaApi('PROCESSAMENTO_DE_MEDIA_EXPIRADO', 408)
}
