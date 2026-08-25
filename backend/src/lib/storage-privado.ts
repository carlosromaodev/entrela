export interface StoragePrivado {
  gerarUrlAssinada(chave: string, expiraEmSegundos: number): string
  verificarUrl(url: string): boolean
}
