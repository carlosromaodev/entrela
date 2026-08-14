import { describe, expect, it } from 'vitest'

import { GeradorDeUuidV7 } from './gerador-de-uuid-v7.js'

describe('GeradorDeUuidV7', () => {
  it('gera UUID com versão 7 e variante RFC 9562', () => {
    const gerador = new GeradorDeUuidV7({
      gerarBytesAleatorios: () => Uint8Array.from({ length: 10 }, () => 0),
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
    })

    expect(gerador.gerar()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('ordena lexicograficamente identificadores de instantes diferentes', () => {
    let instante = new Date('2026-08-02T12:00:00.000Z')
    const gerador = new GeradorDeUuidV7({
      gerarBytesAleatorios: () => Uint8Array.from({ length: 10 }, () => 1),
      obterInstanteAtual: () => instante,
    })
    const primeiro = gerador.gerar()
    instante = new Date('2026-08-02T12:00:00.001Z')
    const segundo = gerador.gerar()

    expect(primeiro < segundo).toBe(true)
  })
})
