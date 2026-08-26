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
    const urlObj = new URL(url, 'http://localhost')
    const sig = urlObj.searchParams.get('sig')
    const expStr = urlObj.searchParams.get('exp')
    if (!sig || !expStr) return false
    const expira = parseInt(expStr, 10)
    if (Date.now() > expira) return false
    const chave = urlObj.pathname.replace('/media/privado/', '')
    const sigEsperada = createHmac('sha256', SEGREDO).update(chave + ':' + expira).digest('base64url')
    return sig === sigEsperada
  }
}
