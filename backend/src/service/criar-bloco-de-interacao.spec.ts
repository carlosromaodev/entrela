import { describe, it, expect } from 'vitest'
import { CriarBlocoDeInteracao } from './criar-bloco-de-interacao.js'

describe('CriarBlocoDeInteracao', () => {
  it('deve criar bloco', async () => {
    const b = new CriarBlocoDeInteracao({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(b).toBeDefined()
  })
})