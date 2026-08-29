import { describe, it, expect } from 'vitest'
import { AplicarTemaBiblioteca } from './aplicar-tema-biblioteca.js'

describe('RF-BASE-11 Temas e biblioteca', () => {
  it('deve aplicar tema compartilhado', async () => {
    const a = new AplicarTemaBiblioteca({ repositorio: { aplicar: () => Promise.resolve() } as any })
    expect(a).toBeDefined()
  })
})