import type { ContextoAutenticado, EntregadorDeDesafio, LimitadorDeAutenticacao, NovaSessao, RepositorioDeAutenticacao } from './contratos.js'

type Desafio = { email: string; expiraEm: Date; consumido: boolean }
type Sessao = { contexto: ContextoAutenticado; dados: NovaSessao; revogada: boolean }

export class RepositorioDeAutenticacaoEmMemoria implements RepositorioDeAutenticacao {
  readonly desafios = new Map<string, Desafio>()
  readonly sessoes = new Map<string, Sessao>()
  readonly pessoais = new Map<string, string>()
  private fila = Promise.resolve()

  async guardarDesafio(e: { emailNormalizado: string; expiraEm: Date; hmacToken: string; id: string }): Promise<void> {
    this.desafios.set(e.hmacToken, { email: e.emailNormalizado, expiraEm: e.expiraEm, consumido: false })
  }
  async consumirDesafioEProvisionar(e: { agora: Date; hmacDoDesafio: string; novaSessao: NovaSessao }): Promise<ContextoAutenticado | null> {
    return this.exclusivo(async () => {
      const desafio = this.desafios.get(e.hmacDoDesafio)
      if (!desafio || desafio.consumido || desafio.expiraEm <= e.agora) return null
      desafio.consumido = true
      const utilizadorId = `u:${desafio.email}`
      const negocioId = this.pessoais.get(utilizadorId) ?? `n:${desafio.email}`
      this.pessoais.set(utilizadorId, negocioId)
      const contexto = { negocioId, sessaoId: e.novaSessao.id, utilizadorId }
      this.sessoes.set(e.novaSessao.hmacToken, { contexto, dados: e.novaSessao, revogada: false })
      return contexto
    })
  }
  async obterSessaoAtiva(hmac: string, agora: Date, csrf?: string): Promise<ContextoAutenticado | null> {
    const s = this.sessoes.get(hmac)
    return !s || s.revogada || s.dados.expiraEm <= agora || (csrf !== undefined && csrf !== s.dados.hmacCsrf) ? null : s.contexto
  }
  async revogarSessao(hmac: string, csrf: string): Promise<boolean> {
    const s = this.sessoes.get(hmac)
    if (!s || s.revogada || s.dados.hmacCsrf !== csrf) return false
    s.revogada = true
    return true
  }
  async rotacionarSessao(e: { agora: Date; hmacAtual: string; hmacCsrfAtual: string; novaSessao: NovaSessao }): Promise<ContextoAutenticado | null> {
    return this.exclusivo(async () => {
      const contexto = await this.obterSessaoAtiva(e.hmacAtual, e.agora, e.hmacCsrfAtual)
      if (!contexto) return null
      this.sessoes.get(e.hmacAtual)!.revogada = true
      const novo = { ...contexto, sessaoId: e.novaSessao.id }
      this.sessoes.set(e.novaSessao.hmacToken, { contexto: novo, dados: e.novaSessao, revogada: false })
      return novo
    })
  }
  private async exclusivo<T>(f: () => Promise<T>): Promise<T> {
    const anterior = this.fila; let liberar!: () => void
    this.fila = new Promise<void>((r) => { liberar = r }); await anterior
    try { return await f() } finally { liberar() }
  }
}

export class EntregadorDeDesafioEmMemoria implements EntregadorDeDesafio {
  readonly entregas: Array<{ email: string; token: string }> = []
  async entregar(e: { email: string; token: string }): Promise<void> { this.entregas.push(e) }
}
export class LimitadorDeAutenticacaoEmMemoria implements LimitadorDeAutenticacao {
  constructor(public permitido = true) {}
  async permitir(): Promise<boolean> { return this.permitido }
}
