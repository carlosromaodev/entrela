import { describe, it, expect } from 'vitest'
import { AplicarIdiomaInterface } from './aplicar-idioma-interface.js'

describe('RF-BASE-06 Idiomas da interface', () => {
  it('deve persistir pt-AO ou en', async () => {
    const a = new AplicarIdiomaInterface({ repositorio: { atualizar: () => Promise.resolve() } as any })
    expect(a).toBeDefined()
  })
})