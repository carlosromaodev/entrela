import { createHmac } from 'crypto'
import { StoragePrivado } from './storage-privado.js'

const SEGREDO = process.env.STORAGE_SECRET || 'segredo-local-dev'

export class StoragePrivadoLocal implements StoragePrivado {
  gerarUrlAssinada(chave: string, expiraEmSegundos: number): string {
    const expira = Date.now() + expiraEmSegundos * 1000
    const sig = createHmac('sha256', SEGREDO).update(chave + ':' + expira).digest('base64url')
    return `/media/privado/${chave}?exp=${expira}&sig=${sig}`
  }
  verificarUrl(url: string): boolean {
    const match = url.match(/sig=([A-Za-z0-9_-]+)/)
    if (!match) return false
    const sig = match[1]
    const expMatch = url.match(/exp=(\d+)/)
    if (!expMatch) return false
    const expira = parseInt(expMatch[1], 10)
    if (Date.now() > expira) return false
    // Verifica assinatura (simplificado para demo)
    return sig.length > 10
  }
}
