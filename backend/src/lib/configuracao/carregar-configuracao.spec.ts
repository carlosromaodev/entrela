import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  ErroDeConfiguracao,
  carregarConfiguracao,
} from './carregar-configuracao.js'

describe('carregarConfiguracao', () => {
  it('mantém o ficheiro de exemplo compatível com o schema', () => {
    const conteudo = readFileSync(
      new URL('../../../.env.exemplo', import.meta.url),
      'utf8',
    )
    const variaveis = Object.fromEntries(
      conteudo
        .split('\n')
        .filter((linha) => linha.trim() !== '' && !linha.startsWith('#'))
        .map((linha) => {
          const separador = linha.indexOf('=')
          return [linha.slice(0, separador), linha.slice(separador + 1)]
        }),
    )

    expect(() => carregarConfiguracao(variaveis)).not.toThrow()
  })

  it('valida, converte e completa a configuração do processo', () => {
    const configuracao = carregarConfiguracao({
      AMBIENTE: 'teste',
      CHAVE_DE_HMAC: 'uma-chave-de-teste-com-pelo-menos-32-caracteres',
      CHAVE_DE_SESSAO: 'outra-chave-exclusiva-para-assinar-sessoes-de-teste',
      PORTA: '4545',
      URL_DA_BASE_DE_DADOS: 'postgresql://entrela:entrela@localhost:5432/entrela',
      VERSAO_DA_APLICACAO: '1.2.3',
    })

    expect(configuracao).toEqual({
      ambiente: 'teste',
      chaveDeHmac: 'uma-chave-de-teste-com-pelo-menos-32-caracteres',
      chaveDeSessao: 'outra-chave-exclusiva-para-assinar-sessoes-de-teste',
      hospede: '0.0.0.0',
      nivelDeLog: 'silent',
      porta: 4545,
      urlDaBaseDeDados: 'postgresql://entrela:entrela@localhost:5432/entrela',
      versaoDaAplicacao: '1.2.3',
    })
  })

  it('recusa configuração incompleta com campos identificáveis e sem expor segredos', () => {
    const chaveCurta = 'segredo-exposto'

    expect(() =>
      carregarConfiguracao({
        AMBIENTE: 'producao',
        CHAVE_DE_HMAC: chaveCurta,
        PORTA: '70000',
      }),
    ).toThrow(ErroDeConfiguracao)

    try {
      carregarConfiguracao({
        AMBIENTE: 'producao',
        CHAVE_DE_HMAC: chaveCurta,
        PORTA: '70000',
      })
    } catch (erro: unknown) {
      expect(erro).toBeInstanceOf(ErroDeConfiguracao)
      expect((erro as Error).message).toContain('CHAVE_DE_HMAC')
      expect((erro as Error).message).toContain('CHAVE_DE_SESSAO')
      expect((erro as Error).message).toContain('PORTA')
      expect((erro as Error).message).toContain('URL_DA_BASE_DE_DADOS')
      expect((erro as Error).message).not.toContain(chaveCurta)
    }
  })
})
