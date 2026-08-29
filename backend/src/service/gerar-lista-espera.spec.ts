import { describe, it, expect } from 'vitest'
import { GerarListaEspera } from './gerar-lista-espera.js'

describe('GerarListaEspera', () => {
  it('deve gerar lista de espera', async () => {
    const gerar = new GerarListaEspera({ repositorio: { gerar: () => Promise.resolve() } as any })
    expect(gerar).toBeDefined()
  })
})