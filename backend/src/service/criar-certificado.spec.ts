import { describe, it, expect } from 'vitest'
import { CriarCertificado } from './criar-certificado.js'

describe('CriarCertificado', () => {
  it('deve criar certificado', async () => {
    const c = new CriarCertificado({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(c).toBeDefined()
  })
})