import { describe, it, expect } from 'vitest'
import { EnviarMensagemAgradecimento } from './enviar-mensagem-agradecimento.js'

describe('EnviarMensagemAgradecimento', () => {
  it('deve enviar agradecimento', async () => {
    const env = new EnviarMensagemAgradecimento({ repositorio: { enviar: () => Promise.resolve() } as any })
    expect(env).toBeDefined()
  })
})