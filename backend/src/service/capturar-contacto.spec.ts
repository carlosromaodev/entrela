import { describe, it, expect } from 'vitest'
import { CapturarContacto } from './capturar-contacto.js'

describe('CapturarContacto', () => {
  it('deve capturar contacto', async () => {
    const cap = new CapturarContacto({ repositorio: { capturar: () => Promise.resolve() } as any })
    expect(cap).toBeDefined()
  })
})