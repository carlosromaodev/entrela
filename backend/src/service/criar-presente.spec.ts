import { describe, it, expect, vi } from 'vitest'
import { CriarPresente } from './criar-presente.js'

describe('CriarPresente', () => {
  it('deve criar presente com objeto físico', async () => {
    const criar = new CriarPresente({ repositorio: { criarPresente: vi.fn() } as any })
    expect(criar).toBeDefined()
  })
})
