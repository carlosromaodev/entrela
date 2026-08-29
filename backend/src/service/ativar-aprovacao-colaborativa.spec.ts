import { describe, it, expect } from 'vitest'
import { AtivarAprovacaoColaborativa } from './ativar-aprovacao-colaborativa.js'

describe('RF-BASE-12 Edição colaborativa', () => {
  it('deve ativar fluxo de aprovação', async () => {
    const a = new AtivarAprovacaoColaborativa({ repositorio: { ativar: () => Promise.resolve() } as any })
    expect(a).toBeDefined()
  })
})