import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

type DependenciasDoTokenPublico = Readonly<{
  chaveDeHmac: string
  gerarBytesAleatorios?: (tamanho: number) => Uint8Array
}>

export class TokenPublico {
  private readonly chaveDeHmac: string
  private readonly gerarBytesAleatorios: (tamanho: number) => Uint8Array

  constructor(dependencias: DependenciasDoTokenPublico) {
    if (Buffer.byteLength(dependencias.chaveDeHmac, 'utf8') < 32) {
      throw new Error('A chave de HMAC precisa de pelo menos 32 bytes.')
    }

    this.chaveDeHmac = dependencias.chaveDeHmac
    this.gerarBytesAleatorios =
      dependencias.gerarBytesAleatorios ?? ((tamanho) => randomBytes(tamanho))
  }

  gerar(): Readonly<{ hmacDoToken: string; token: string }> {
    const token = Buffer.from(this.gerarBytesAleatorios(32)).toString('base64url')

    return { hmacDoToken: this.calcularHmac(token).toString('hex'), token }
  }

  correspondeAoHmac(token: string, hmacEsperado: string): boolean {
    if (!/^[a-f0-9]{64}$/.test(hmacEsperado)) {
      return false
    }

    const calculado = this.calcularHmac(token)
    const esperado = Buffer.from(hmacEsperado, 'hex')

    return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
  }

  private calcularHmac(token: string): Buffer {
    return createHmac('sha256', this.chaveDeHmac).update(token).digest()
  }
}
