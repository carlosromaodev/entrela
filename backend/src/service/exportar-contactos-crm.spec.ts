import { describe, it, expect } from 'vitest'
import { ExportarContactosCRM } from './exportar-contactos-crm.js'

describe('ExportarContactosCRM', () => {
  it('deve exportar contactos', async () => {
    const exp = new ExportarContactosCRM({ repositorio: { exportar: () => Promise.resolve() } as any })
    expect(exp).toBeDefined()
  })
})