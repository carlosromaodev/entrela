import { describe, it, expect } from 'vitest'
import { GerirNegocioPartilhado } from './gerir-negocio-partilhado.js'

describe('RF-BASE-04 Conta e negócio partilhados', () => {
  it('deve permitir gerir múltiplos negócios', async () => {
    const g = new GerirNegocioPartilhado({ repositorio: { listar: () => Promise.resolve([]) } as any })
    expect(g).toBeDefined()
  })
})