import { describe, expect, it } from 'vitest'

import {
  criarEventoDeErroHttpSeguro,
  criarEventoHttpSeguro,
} from './contexto-seguro-de-log.js'

const metadados = {
  duracaoEmMilissegundos: 12.5,
  idDaRequisicao: '0198f9a0-8b75-7000-8000-000000000001',
  metodo: 'POST',
  rota: '/v1/momentos/{momentoId}/publicacoes',
  statusHttp: 201,
} as const

describe('contexto seguro de log', () => {
  it('produz um evento HTTP JSON apenas com metadados da allowlist', () => {
    expect(criarEventoHttpSeguro(metadados)).toEqual({
      ...metadados,
      evento: 'REQUISICAO_HTTP_CONCLUIDA',
    })
  })

  it('recusa URL crua que possa transportar token ou dados pessoais', () => {
    expect(() =>
      criarEventoHttpSeguro({
        ...metadados,
        rota: '/momento/token-secreto?email=ana@example.com',
      }),
    ).toThrow('padrão sem query string')
  })

  it('serializa erro sem mensagem, stack, causa ou propriedades sensíveis', () => {
    const erro = Object.assign(
      new Error('Conteúdo íntimo: a surpresa é uma viagem.'),
      {
        authorization: 'Bearer token-super-secreto',
        cause: new Error('password=segredo'),
        codigo: 'PUBLICACAO_INVALIDA',
        cookie: 'sessao=token-cookie-secreto',
        email: 'ana@example.com',
      },
    )

    const evento = criarEventoDeErroHttpSeguro({
      ...metadados,
      erro,
      statusHttp: 422,
    })
    const serializado = JSON.stringify(evento)

    expect(evento.erro).toEqual({
      codigo: 'PUBLICACAO_INVALIDA',
      tipo: 'Error',
    })
    expect(serializado).not.toContain('viagem')
    expect(serializado).not.toContain('token-super-secreto')
    expect(serializado).not.toContain('token-cookie-secreto')
    expect(serializado).not.toContain('password')
    expect(serializado).not.toContain('ana@example.com')
    expect(serializado).not.toContain('stack')
  })

  it('substitui códigos e tipos não seguros por valores neutros', () => {
    const erro = Object.assign(new Error('segredo'), {
      codigo: 'codigo com dados pessoais',
      name: 'Erro<script>',
    })

    expect(
      criarEventoDeErroHttpSeguro({ ...metadados, erro, statusHttp: 500 }).erro,
    ).toEqual({
      codigo: 'ERRO_NAO_CLASSIFICADO',
      tipo: 'ErroDesconhecido',
    })
  })

  it.each([
    [{ ...metadados, duracaoEmMilissegundos: Number.NaN }, 'duração'],
    [{ ...metadados, idDaRequisicao: 'id\nforjado' }, 'identificador'],
    [{ ...metadados, metodo: 'TRACE' }, 'método'],
    [{ ...metadados, statusHttp: 999 }, 'estado HTTP'],
  ])('recusa metadados inválidos antes do log', (entrada, mensagem) => {
    expect(() => criarEventoHttpSeguro(entrada)).toThrow(mensagem)
  })
})
