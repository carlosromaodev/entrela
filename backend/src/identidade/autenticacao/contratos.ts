export type ContextoAutenticado = Readonly<{
  negocioId: string
  sessaoId: string
  utilizadorId: string
}>

export type NovaSessao = Readonly<{
  expiraEm: Date
  hmacCsrf: string
  hmacToken: string
  id: string
}>

export interface RepositorioDeAutenticacao {
  guardarDesafio(entrada: Readonly<{
    emailNormalizado: string
    expiraEm: Date
    hmacToken: string
    id: string
  }>): Promise<void>
  consumirDesafioEProvisionar(entrada: Readonly<{
    agora: Date
    hmacDoDesafio: string
    novaSessao: NovaSessao
  }>): Promise<ContextoAutenticado | null>
  obterSessaoAtiva(hmacToken: string, agora: Date, hmacCsrf?: string): Promise<ContextoAutenticado | null>
  revogarSessao(hmacToken: string, hmacCsrf: string, agora: Date): Promise<boolean>
  rotacionarSessao(entrada: Readonly<{
    agora: Date
    hmacCsrfAtual: string
    hmacAtual: string
    novaSessao: NovaSessao
  }>): Promise<ContextoAutenticado | null>
}

export interface EntregadorDeDesafio {
  entregar(entrada: Readonly<{ email: string; token: string }>): Promise<void>
}

export interface LimitadorDeAutenticacao {
  permitir(entrada: Readonly<{
    chave: string
    limite: number
    janelaEmSegundos: number
  }>): Promise<boolean>
}
