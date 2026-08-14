import { describe, expect, it } from 'vitest'

import { ErroDeAutenticacao } from '../../service/errs/ErroDeAutenticacao.js'
import { SessaoDoCriador } from './sessao-do-criador.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const sessaoId = '0198f9a0-8b75-7000-8000-000000000003'

describe('SessaoDoCriador', () => {
  const instante = new Date('2026-08-02T12:00:00.000Z')
  const sessao = new SessaoDoCriador({
    chaveDeSessao: 'chave-exclusiva-de-sessao-com-32-caracteres-ou-mais',
    obterInstanteAtual: () => instante,
  })

  it('emite e valida contexto assinado com expiração curta', () => {
    const token = sessao.emitir({
      duracaoEmSegundos: 900,
      negocioId,
      sessaoId,
      utilizadorId,
    })

    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    expect(sessao.validar(`Bearer ${token}`)).toEqual({
      expiraEm: '2026-08-02T12:15:00.000Z',
      negocioId,
      sessaoId,
      utilizadorId,
    })
  })

  it.each(['', 'Basic abc', 'Bearer alterado.valor', 'Bearer apenas-uma-parte'])(
    'recusa autorização inválida sem distinguir o motivo: %s',
    (autorizacao) => {
      expect(() => sessao.validar(autorizacao)).toThrow(ErroDeAutenticacao)
    },
  )

  it('recusa assinatura alterada', () => {
    const token = sessao.emitir({
      duracaoEmSegundos: 900,
      negocioId,
      sessaoId,
      utilizadorId,
    })
    const tokenAlterado = `${token.slice(0, -1)}x`

    expect(() => sessao.validar(`Bearer ${tokenAlterado}`)).toThrow(
      ErroDeAutenticacao,
    )
  })

  it('recusa sessão no instante exacto de expiração', () => {
    const emissor = new SessaoDoCriador({
      chaveDeSessao: 'chave-exclusiva-de-sessao-com-32-caracteres-ou-mais',
      obterInstanteAtual: () => new Date('2026-08-02T11:45:00.000Z'),
    })
    const token = emissor.emitir({
      duracaoEmSegundos: 900,
      negocioId,
      sessaoId,
      utilizadorId,
    })

    expect(() => sessao.validar(`Bearer ${token}`)).toThrow(
      ErroDeAutenticacao,
    )
  })
})
