import { describe, expect, it } from 'vitest'

import {
  iniciarBackend,
  obterMensagemDaFalhaNoArranque,
} from './iniciar-backend.js'
import { ErroDeConfiguracao } from './configuracao/carregar-configuracao.js'

describe('arranque do backend', () => {
  it('falha com mensagem segura quando falta configuração obrigatória', async () => {
    expect.assertions(6)

    try {
      await iniciarBackend({ AMBIENTE: 'teste' })
    } catch (erro: unknown) {
      const mensagem = obterMensagemDaFalhaNoArranque(erro)

      expect(erro).toBeInstanceOf(ErroDeConfiguracao)
      expect(mensagem).toContain('CHAVE_DE_HMAC')
      expect(mensagem).toContain('CHAVE_DE_SESSAO')
      expect(mensagem).toContain('URL_DA_BASE_DE_DADOS')
      expect(mensagem).not.toContain('undefined')
      expect(mensagem).not.toContain('segredo')
    }
  })
})
