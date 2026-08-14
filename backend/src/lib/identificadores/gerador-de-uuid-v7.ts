import { randomBytes } from 'node:crypto'

type DependenciasDoGerador = Readonly<{
  gerarBytesAleatorios?: (tamanho: number) => Uint8Array
  obterInstanteAtual?: () => Date
}>

export class GeradorDeUuidV7 {
  private readonly gerarBytesAleatorios: (tamanho: number) => Uint8Array
  private readonly obterInstanteAtual: () => Date

  constructor(dependencias: DependenciasDoGerador = {}) {
    this.gerarBytesAleatorios =
      dependencias.gerarBytesAleatorios ?? ((tamanho) => randomBytes(tamanho))
    this.obterInstanteAtual =
      dependencias.obterInstanteAtual ?? (() => new Date())
  }

  gerar(): string {
    const milissegundos = this.obterInstanteAtual().getTime()
    if (
      !Number.isSafeInteger(milissegundos) ||
      milissegundos < 0 ||
      milissegundos > 0xffff_ffff_ffff
    ) {
      throw new Error('O instante não pode ser representado num UUIDv7.')
    }

    const aleatorios = this.gerarBytesAleatorios(10)
    if (aleatorios.length !== 10) {
      throw new Error('O gerador seguro precisa de devolver exactamente 10 bytes.')
    }

    const bytes = Buffer.alloc(16)
    let instante = BigInt(milissegundos)
    for (let indice = 5; indice >= 0; indice -= 1) {
      bytes[indice] = Number(instante & 0xffn)
      instante >>= 8n
    }

    bytes[6] = 0x70 | ((aleatorios[0] ?? 0) & 0x0f)
    bytes[7] = aleatorios[1] ?? 0
    bytes[8] = 0x80 | ((aleatorios[2] ?? 0) & 0x3f)
    for (let indice = 9; indice < 16; indice += 1) {
      bytes[indice] = aleatorios[indice - 6] ?? 0
    }

    const hexadecimal = bytes.toString('hex')
    return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`
  }
}
