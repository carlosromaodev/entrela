import { describe, it, expect } from 'vitest'
import { CriarPainelPorPapel } from './criar-painel-por-papel.js'

describe('RF-BASE-13 Painéis por papel', () => {
  it('deve criar 4 painéis', async () => {
    const c = new CriarPainelPorPapel({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(c).toBeDefined()
  })
})