import { describe, expect, it } from 'vitest'

import { ObterCatalogoDeCategorias } from './obter-catalogo-de-categorias.js'

describe('ObterCatalogoDeCategorias', () => {
  it('expõe exactamente as seis categorias da marca Entrela', () => {
    const servico = new ObterCatalogoDeCategorias()

    const catalogo = servico.executar()

    expect(catalogo.map((categoria) => categoria.codigo)).toEqual([
      'EMPRESAS',
      'EVENTOS',
      'MOMENTOS',
      'PRESENTES',
      'CONVITES',
      'EXPERIENCIAS',
    ])
  })

  it('identifica Momentos como primeira fatia disponível sem fingir que as restantes já foram implementadas', () => {
    const servico = new ObterCatalogoDeCategorias()

    const catalogo = servico.executar()

    expect(catalogo.find(({ codigo }) => codigo === 'MOMENTOS')).toMatchObject({
      disponibilidade: 'EM_IMPLEMENTACAO',
      primeiraFatia: true,
    })
    expect(
      catalogo
        .filter(({ codigo }) => codigo !== 'MOMENTOS')
        .every(({ disponibilidade }) => disponibilidade === 'PLANEADA'),
    ).toBe(true)
  })

  it('devolve uma cópia imutável do catálogo em cada chamada', () => {
    const servico = new ObterCatalogoDeCategorias()
    const primeiraLeitura = servico.executar()

    expect(Object.isFrozen(primeiraLeitura)).toBe(true)
    expect(Object.isFrozen(primeiraLeitura[0])).toBe(true)
    expect(servico.executar()).not.toBe(primeiraLeitura)
  })
})
