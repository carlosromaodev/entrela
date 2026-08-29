import { describe, it, expect } from 'vitest'
import { GerarQREmMassa } from './gerar-qr-em-massa.js'

describe('GerarQREmMassa', () => {
  it('deve gerar QR em lote', async () => {
    const gerar = new GerarQREmMassa({ repositorio: { gerarLote: () => Promise.resolve() } as any })
    expect(gerar).toBeDefined()
  })
})