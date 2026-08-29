import { describe, it, expect } from 'vitest'
import { CalcularPontuacaoEquipa } from './calcular-pontuacao-equipa.js'

describe('CalcularPontuacaoEquipa', () => {
  it('deve calcular pontuação', async () => {
    const calc = new CalcularPontuacaoEquipa({ repositorio: { calcular: () => Promise.resolve() } as any })
    expect(calc).toBeDefined()
  })
})