import { RateLimit } from './rate-limit.js'

export class RateLimitMemoria implements RateLimit {
  private registros = new Map<string, number[]>()
  verificar(chave: string, limite: number, janelaSegundos: number): boolean {
    const agora = Date.now()
    const janela = agora - janelaSegundos * 1000
    const historico = (this.registros.get(chave) || []).filter(t => t > janela)
    if (historico.length >= limite) return false
    historico.push(agora)
    this.registros.set(chave, historico)
    return true
  }
}
