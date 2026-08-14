import { describe, expect, it } from 'vitest'

import { AvaliarRegras } from './avaliar-regras.js'
import { ErroDeValidacaoDoCasoDeUso } from './errs/ErroDeValidacaoDoCasoDeUso.js'

const regraDeSequencia = {
  acoes: [{ chaveDoBloco: 'cena-2', tipo: 'DESBLOQUEAR_BLOCO' }],
  chave: 'revelar-cena-2',
  condicao: {
    todas: [
      {
        facto: 'evento.chaveDoBloco',
        operador: 'IGUAL',
        valor: 'cena-1',
      },
      {
        facto: 'sessao.estado',
        operador: 'IGUAL',
        valor: 'ATIVA',
      },
    ],
  },
  estado: 'ATIVA',
  escopo: 'SESSAO',
  gatilho: 'BLOCO_CONTINUADO',
  prioridade: 100,
} as const

describe('AvaliarRegras', () => {
  const avaliador = new AvaliarRegras()

  it('avalia apenas factos e acções permitidos pelo manifesto', () => {
    const resultado = avaliador.executar({
      acoesPermitidas: ['DESBLOQUEAR_BLOCO'],
      evento: {
        chave: 'evento-1',
        gatilho: 'BLOCO_CONTINUADO',
      },
      execucoesAnteriores: [],
      factos: {
        'evento.chaveDoBloco': 'cena-1',
        'sessao.estado': 'ATIVA',
      },
      regras: [regraDeSequencia],
      chaveDoEscopo: 'sessao-1',
    })

    expect(resultado).toEqual({
      acoes: [
        {
          chaveDaExecucao:
            'revelar-cena-2:evento-1:sessao-1',
          chaveDaRegra: 'revelar-cena-2',
          efeito: {
            chaveDoBloco: 'cena-2',
            tipo: 'DESBLOQUEAR_BLOCO',
          },
        },
      ],
    })
  })

  it('ordena regras pela prioridade e depois pela chave', () => {
    const segundaRegra = {
      ...regraDeSequencia,
      chave: 'auditar-avanco',
      prioridade: 10,
    }

    const resultado = avaliador.executar({
      acoesPermitidas: ['DESBLOQUEAR_BLOCO'],
      evento: { chave: 'evento-2', gatilho: 'BLOCO_CONTINUADO' },
      execucoesAnteriores: [],
      factos: {
        'evento.chaveDoBloco': 'cena-1',
        'sessao.estado': 'ATIVA',
      },
      regras: [regraDeSequencia, segundaRegra],
      chaveDoEscopo: 'sessao-1',
    })

    expect(resultado.acoes.map(({ chaveDaRegra }) => chaveDaRegra)).toEqual([
      'auditar-avanco',
      'revelar-cena-2',
    ])
  })

  it('não volta a executar a mesma regra para o mesmo evento e escopo', () => {
    const chaveDaExecucao = 'revelar-cena-2:evento-1:sessao-1'

    const resultado = avaliador.executar({
      acoesPermitidas: ['DESBLOQUEAR_BLOCO'],
      evento: { chave: 'evento-1', gatilho: 'BLOCO_CONTINUADO' },
      execucoesAnteriores: [chaveDaExecucao],
      factos: {
        'evento.chaveDoBloco': 'cena-1',
        'sessao.estado': 'ATIVA',
      },
      regras: [regraDeSequencia],
      chaveDoEscopo: 'sessao-1',
    })

    expect(resultado.acoes).toEqual([])
  })

  it('recusa factos fora da allowlist em vez de avaliar expressões livres', () => {
    expect(() =>
      avaliador.executar({
        acoesPermitidas: ['DESBLOQUEAR_BLOCO'],
        evento: { chave: 'evento-1', gatilho: 'BLOCO_CONTINUADO' },
        execucoesAnteriores: [],
        factos: { 'pessoa.email': 'segredo@exemplo.ao' },
        regras: [regraDeSequencia],
        chaveDoEscopo: 'sessao-1',
      }),
    ).toThrow(ErroDeValidacaoDoCasoDeUso)
  })

  it('recusa uma acção que a categoria não autorizou', () => {
    expect(() =>
      avaliador.executar({
        acoesPermitidas: ['MARCAR_EXPERIENCIA_COMO_CONCLUIDA'],
        evento: { chave: 'evento-1', gatilho: 'BLOCO_CONTINUADO' },
        execucoesAnteriores: [],
        factos: {
          'evento.chaveDoBloco': 'cena-1',
          'sessao.estado': 'ATIVA',
        },
        regras: [regraDeSequencia],
        chaveDoEscopo: 'sessao-1',
      }),
    ).toThrow(ErroDeValidacaoDoCasoDeUso)
  })

  it('aceita colecções apenas nos factos declarados e aplica CONTEM', () => {
    const resultado = avaliador.executar({
      acoesPermitidas: ['DESBLOQUEAR_BLOCO'],
      evento: { chave: 'evento-3', gatilho: 'BLOCO_CONTINUADO' },
      execucoesAnteriores: [],
      factos: {
        'sessao.blocosDesbloqueados': ['capa', 'cena-1'],
      },
      regras: [
        {
          ...regraDeSequencia,
          condicao: {
            facto: 'sessao.blocosDesbloqueados',
            operador: 'CONTEM',
            valor: 'cena-1',
          },
        },
      ],
      chaveDoEscopo: 'sessao-1',
    })

    expect(resultado.acoes).toHaveLength(1)
  })
})
