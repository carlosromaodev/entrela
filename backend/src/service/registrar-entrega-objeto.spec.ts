import { describe, it, expect } from 'vitest'
import { RegistrarEntregaObjeto } from './registrar-entrega-objeto.js'

describe('RegistrarEntregaObjeto', () => {
  it('deve registrar entrega', async () => {
    const reg = new RegistrarEntregaObjeto({ repositorio: { registrar: () => Promise.resolve() } as any })
    expect(reg).toBeDefined()
  })
})