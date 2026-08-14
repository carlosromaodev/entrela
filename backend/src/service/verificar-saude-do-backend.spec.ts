import { describe, expect, it } from 'vitest'

import { VerificarSaudeDoBackend } from './verificar-saude-do-backend.js'

describe('VerificarSaudeDoBackend', () => {
  it('devolve o estado operacional com instante e versão controlados', () => {
    const verificarSaudeDoBackend = new VerificarSaudeDoBackend({
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
      versaoDaAplicacao: '1.0.0-teste',
    })

    expect(verificarSaudeDoBackend.executar()).toEqual({
      estado: 'SAUDAVEL',
      instante: '2026-08-02T12:00:00.000Z',
      servico: 'entrela-backend',
      versao: '1.0.0-teste',
    })
  })
})
