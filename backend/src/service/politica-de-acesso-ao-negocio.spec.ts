import { describe, expect, it } from 'vitest'

import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'

describe('PoliticaDeAcessoAoNegocio', () => {
  const politica = new PoliticaDeAcessoAoNegocio()

  it('concede ao proprietário todas as acções de negócio', () => {
    for (const acao of politica.acoesConhecidas) {
      expect(
        politica.podeExecutar({ acao, papel: 'PROPRIETARIO' }),
        acao,
      ).toBe(true)
    }
  })

  it.each([
    ['EDITOR', 'CRIAR_EXPERIENCIA', true],
    ['EDITOR', 'PUBLICAR_EXPERIENCIA', true],
    ['EDITOR', 'GERIR_FATURACAO', false],
    ['OPERADOR', 'OPERAR_EVENTO', true],
    ['OPERADOR', 'EDITAR_RASCUNHO', false],
    ['ANALISTA', 'VER_ANALISES', true],
    ['ANALISTA', 'CRIAR_EXPERIENCIA', false],
    ['FATURACAO', 'GERIR_FATURACAO', true],
    ['FATURACAO', 'VER_CONTEUDO_PRIVADO', false],
    ['ADMINISTRADOR', 'TRANSFERIR_PROPRIEDADE', false],
  ] as const)('%s / %s = %s', (papel, acao, resultado) => {
    expect(politica.podeExecutar({ acao, papel })).toBe(resultado)
  })

  it('nega quando o utilizador não é membro activo do negócio', () => {
    expect(
      politica.podeExecutar({ acao: 'CRIAR_EXPERIENCIA', papel: null }),
    ).toBe(false)
  })
})
