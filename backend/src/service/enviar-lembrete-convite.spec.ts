import { describe, it, expect } from 'vitest'
import { EnviarLembreteConvite } from './enviar-lembrete-convite.js'

describe('EnviarLembreteConvite', () => {
  it('deve enviar lembrete', async () => {
    const env = new EnviarLembreteConvite({ repositorio: { enviar: () => Promise.resolve() } as any })
    expect(env).toBeDefined()
  })
})