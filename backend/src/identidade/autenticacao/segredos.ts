import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export class SegredosDeAutenticacao {
  constructor(
    private readonly chave: string,
    private readonly gerarBytes: (n: number) => Uint8Array = randomBytes,
  ) {
    if (Buffer.byteLength(chave) < 32) throw new Error('Chave de autenticação demasiado curta.')
  }

  gerar(finalidade: 'desafio' | 'sessao' | 'csrf'): Readonly<{ hmac: string; token: string }> {
    const token = Buffer.from(this.gerarBytes(32)).toString('base64url')
    return { hmac: this.hmac(finalidade, token), token }
  }

  calcular(finalidade: 'desafio' | 'sessao' | 'csrf', token: string): string {
    return this.hmac(finalidade, token)
  }

  corresponde(finalidade: 'desafio' | 'sessao' | 'csrf', token: string, esperado: string): boolean {
    if (!/^[a-f0-9]{64}$/.test(esperado)) return false
    const a = Buffer.from(this.hmac(finalidade, token), 'hex')
    const b = Buffer.from(esperado, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  }

  private hmac(finalidade: string, token: string): string {
    return createHmac('sha256', this.chave).update(`${finalidade}\0${token}`).digest('hex')
  }
}
