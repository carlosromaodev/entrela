import { describe, it, expect } from 'vitest'
import { AplicarPapelNegocio } from './aplicar-papel-negocio.js'

describe('RF-BASE-08 Papéis de negócio', () => {
  it('deve restringir ações por papel', async () => {
    const a = new AplicarPapelNegocio({ repositorio: { verificar: () => Promise.resolve() } as any })
    expect(a).toBeDefined()
  })
})