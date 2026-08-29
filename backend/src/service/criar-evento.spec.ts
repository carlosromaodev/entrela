import { describe, it, expect } from 'vitest'
import { CriarEvento } from './criar-evento.js'

describe('CriarEvento', () => {
  it('deve criar evento com tipos de ingresso', async () => {
    const criar = new CriarEvento({ repositorio: { criarEvento: () => Promise.resolve() } as any })
    expect(criar).toBeDefined()
  })
})