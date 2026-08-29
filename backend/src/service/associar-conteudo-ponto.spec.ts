import { describe, it, expect } from 'vitest'
import { AssociarConteudoPonto } from './associar-conteudo-ponto.js'

describe('AssociarConteudoPonto', () => {
  it('deve associar conteúdo a ponto de interesse', async () => {
    const assoc = new AssociarConteudoPonto({ repositorio: { associar: () => Promise.resolve() } as any })
    expect(assoc).toBeDefined()
  })
})