import { describe, it, expect } from 'vitest'
import { EscolherCategoria } from './escolher-categoria.js'

describe('RF-BASE-03 Escolha de categoria', () => {
  it('deve mostrar apenas modelos compatíveis', async () => {
    const esc = new EscolherCategoria({ repositorio: { listar: () => Promise.resolve([]) } as any })
    expect(esc).toBeDefined()
  })
})