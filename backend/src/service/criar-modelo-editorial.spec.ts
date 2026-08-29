import { describe, it, expect } from 'vitest'
import { CriarModeloEditorial } from './criar-modelo-editorial.js'

describe('CriarModeloEditorial', () => {
  it('deve criar modelo', async () => {
    const m = new CriarModeloEditorial({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(m).toBeDefined()
  })
})