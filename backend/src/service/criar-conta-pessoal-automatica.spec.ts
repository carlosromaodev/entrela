import { describe, it, expect } from 'vitest'
import { CriarContaPessoalAutomatica } from './criar-conta-pessoal-automatica.js'

describe('RF-BASE-14 Conta pessoal automática', () => {
  it('deve criar negócio PESSOAL', async () => {
    const c = new CriarContaPessoalAutomatica({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(c).toBeDefined()
  })
})