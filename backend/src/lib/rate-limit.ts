export interface RateLimit {
  verificar(chave: string, limite: number, janelaSegundos: number): boolean
}
