import { describe, expect, it } from 'vitest'

import { AvaliarDisponibilidade } from './avaliar-disponibilidade.js'
import { ErroDeValidacaoDoCasoDeUso } from './errs/ErroDeValidacaoDoCasoDeUso.js'

const instante = new Date('2026-12-24T19:00:00.000Z')

function criarAvaliador(agora = instante): AvaliarDisponibilidade {
  return new AvaliarDisponibilidade({ obterInstanteAtual: () => agora })
}

const entradaBase = {
  estadoDaExperiencia: 'PUBLICADA',
  pontoDeAcesso: {
    estado: 'ATIVO',
    iniciaEm: null,
    terminaEm: null,
    usos: 0,
    maximoDeUsos: null,
  },
  politica: {
    abreEm: '2026-12-24T19:00:00.000Z',
    expiraEm: null,
    fusoHorario: 'Africa/Luanda',
    modo: 'JANELA',
  },
} as const

describe('AvaliarDisponibilidade', () => {
  it('mantém a sessão em espera sem devolver conteúdo antes da abertura', () => {
    const avaliador = criarAvaliador(
      new Date('2026-12-24T18:59:59.999Z'),
    )

    expect(avaliador.executar(entradaBase)).toEqual({
      abreEm: '2026-12-24T19:00:00.000Z',
      estadoDaSessao: 'EM_ESPERA',
    })
  })

  it('activa a mesma publicação quando o relógio do servidor alcança a abertura', () => {
    expect(criarAvaliador().executar(entradaBase)).toEqual({
      estadoDaSessao: 'ATIVA',
    })
  })

  it('expira a sessão no limite superior da janela', () => {
    expect(
      criarAvaliador().executar({
        ...entradaBase,
        politica: {
          ...entradaBase.politica,
          abreEm: '2026-12-24T18:00:00.000Z',
          expiraEm: instante.toISOString(),
        },
      }),
    ).toEqual({ estadoDaSessao: 'EXPIRADA' })
  })

  it.each([
    ['PAUSADA', 'ATIVO', 'EXPERIENCIA_INDISPONIVEL'],
    ['PUBLICADA', 'REVOGADO', 'PONTO_DE_ACESSO_INVALIDO'],
    ['PUBLICADA', 'EXPIRADO', 'PONTO_DE_ACESSO_INVALIDO'],
  ] as const)(
    'nega sem revelar conteúdo quando experiência=%s e ponto=%s',
    (estadoDaExperiencia, estado, motivo) => {
      expect(
        criarAvaliador().executar({
          ...entradaBase,
          estadoDaExperiencia,
          pontoDeAcesso: { ...entradaBase.pontoDeAcesso, estado },
        }),
      ).toEqual({ estadoDaSessao: 'NEGADA', motivo })
    },
  )

  it('nega atomicamente quando o limite de usos já foi atingido', () => {
    expect(
      criarAvaliador().executar({
        ...entradaBase,
        pontoDeAcesso: {
          ...entradaBase.pontoDeAcesso,
          maximoDeUsos: 1,
          usos: 1,
        },
      }),
    ).toEqual({
      estadoDaSessao: 'NEGADA',
      motivo: 'LIMITE_DE_USOS_ATINGIDO',
    })
  })

  it('recusa uma janela temporal invertida', () => {
    expect(() =>
      criarAvaliador().executar({
        ...entradaBase,
        politica: {
          ...entradaBase.politica,
          abreEm: '2026-12-25T19:00:00.000Z',
          expiraEm: '2026-12-24T19:00:00.000Z',
        },
      }),
    ).toThrow(ErroDeValidacaoDoCasoDeUso)
  })
})
