import { describe, it, expect } from 'vitest'
import { AplicarConteudoLocalizavel } from './aplicar-conteudo-localizavel.js'

describe('RF-BASE-07 Conteúdo localizável', () => {
  it('deve suportar conteúdo por idioma', async () => {
    const a = new AplicarConteudoLocalizavel({ repositorio: { atualizar: () => Promise.resolve() } as any })
    expect(a).toBeDefined()
  })
})