import { describe, expect, it } from 'vitest'

import { TokenPublico } from './token-publico.js'

describe('TokenPublico', () => {
  const chaveDeHmac = 'uma-chave-separada-com-pelo-menos-32-caracteres'

  it('gera token opaco de 256 bits e guarda somente o HMAC SHA-256', () => {
    const bytes = Uint8Array.from({ length: 32 }, (_, indice) => indice + 1)
    const tokenPublico = new TokenPublico({
      chaveDeHmac,
      gerarBytesAleatorios: () => bytes,
    })

    const resultado = tokenPublico.gerar()

    expect(resultado.token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(resultado.hmacDoToken).toMatch(/^[a-f0-9]{64}$/)
    expect(resultado.hmacDoToken).not.toContain(resultado.token)
  })

  it('verifica o token com comparação segura e recusa alteração', () => {
    const tokenPublico = new TokenPublico({ chaveDeHmac })
    const resultado = tokenPublico.gerar()

    expect(
      tokenPublico.correspondeAoHmac(resultado.token, resultado.hmacDoToken),
    ).toBe(true)
    expect(
      tokenPublico.correspondeAoHmac(
        `${resultado.token.slice(0, -1)}x`,
        resultado.hmacDoToken,
      ),
    ).toBe(false)
  })

  it('recusa HMAC armazenado com forma inválida sem lançar erro', () => {
    const tokenPublico = new TokenPublico({ chaveDeHmac })

    expect(tokenPublico.correspondeAoHmac('token', 'invalido')).toBe(false)
  })
})
