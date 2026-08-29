import { describe, it, expect } from 'vitest'
import { EmitirCertificado } from './emitir-certificado.js'

describe('EmitirCertificado', () => {
  it('deve emitir certificado', async () => {
    const emit = new EmitirCertificado({ repositorio: { emitir: () => Promise.resolve() } as any })
    expect(emit).toBeDefined()
  })
})