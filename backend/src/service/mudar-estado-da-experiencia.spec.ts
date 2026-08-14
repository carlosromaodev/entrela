import { describe, expect, it } from 'vitest'

import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { MudarEstadoDaExperiencia } from './mudar-estado-da-experiencia.js'

describe('MudarEstadoDaExperiencia', () => {
  const mudarEstado = new MudarEstadoDaExperiencia()

  it.each([
    ['RASCUNHO', 'PUBLICAR', 'PUBLICADA'],
    ['RASCUNHO', 'ARQUIVAR', 'ARQUIVADA'],
    ['PUBLICADA', 'PAUSAR', 'PAUSADA'],
    ['PUBLICADA', 'ARQUIVAR', 'ARQUIVADA'],
    ['PAUSADA', 'RETOMAR', 'PUBLICADA'],
    ['PAUSADA', 'ARQUIVAR', 'ARQUIVADA'],
  ] as const)('aceita %s → %s → %s', (estado, acao, esperado) => {
    expect(mudarEstado.executar({ acao, estadoAtual: estado })).toEqual({
      estadoAnterior: estado,
      estadoAtual: esperado,
    })
  })

  it.each([
    ['RASCUNHO', 'PAUSAR'],
    ['PUBLICADA', 'PUBLICAR'],
    ['PAUSADA', 'PUBLICAR'],
    ['ARQUIVADA', 'RETOMAR'],
  ] as const)('recusa a transição %s → %s', (estado, acao) => {
    expect(() =>
      mudarEstado.executar({ acao, estadoAtual: estado }),
    ).toThrow(ErroDeTransicaoDeEstado)
  })
})
