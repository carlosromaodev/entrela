import { StoragePrivado } from './storage-privado.js'

export class StoragePrivadoLocal implements StoragePrivado {
  gerarUrlAssinada(chave: string, expiraEmSegundos: number): string {
    const expira = Date.now() + expiraEmSegundos * 1000
    return `/media/privado/${chave}?exp=${expira}&sig=${Buffer.from(chave + expira).toString('base64url')}`
  }
  verificarUrl(url: string): boolean {
    const match = url.match(/sig=([A-Za-z0-9_-]+)/)
    return !!match
  }
}
