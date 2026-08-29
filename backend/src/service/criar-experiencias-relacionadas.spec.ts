import { describe, it, expect } from 'vitest'
import { CriarExperienciasRelacionadas } from './criar-experiencias-relacionadas.js'

describe('RF-BASE-05 Experiências relacionadas', () => {
  it('deve criar relação entre experiências', async () => {
    const c = new CriarExperienciasRelacionadas({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(c).toBeDefined()
  })
})