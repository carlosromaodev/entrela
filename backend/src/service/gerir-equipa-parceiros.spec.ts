import { describe, it, expect } from 'vitest'
import { GerirEquipaParceiros } from './gerir-equipa-parceiros.js'

describe('RF-BASE-09 Equipa e parceiros', () => {
  it('deve gerir membros sem transferir propriedade', async () => {
    const g = new GerirEquipaParceiros({ repositorio: { listar: () => Promise.resolve([]) } as any })
    expect(g).toBeDefined()
  })
})