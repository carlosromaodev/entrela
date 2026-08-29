import Fastify from 'fastify'
import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

import { SessaoDoCriador } from '../lib/seguranca/sessao-do-criador.js'
import type { RepositorioDeAnalisesDeMomentos } from './contratos.js'
import { registrarRotasDeAnalises } from './http.js'
import { ConsultarEstadoAgregadoDoMomento } from './servico.js'

describe('HTTP de análises de Momentos', () => {
  let app: FastifyInstance | undefined
  afterEach(async () => app?.close())

  it('exige sessão e devolve envelope sem dados pessoais', async () => {
    const negocioId = crypto.randomUUID()
    const utilizadorId = crypto.randomUUID()
    const momentoId = crypto.randomUUID()
    const repositorio: RepositorioDeAnalisesDeMomentos = {
      async obterEstadoAgregado() {
        return {
          conclusoes: 0, primeiraAberturaEm: null, primeiraConclusaoEm: null,
          origens: [], sessoesAbertas: 0, ultimaAberturaEm: null,
        }
      },
      async obterPapelDoUtilizador() { return 'PROPRIETARIO' },
    }
    const sessaoDoCriador = new SessaoDoCriador({
      chaveDeSessao: 'chave-de-sessao-segura-com-mais-de-32-bytes',
      obterInstanteAtual: () => new Date('2026-08-14T12:00:00Z'),
    })
    app = Fastify({ genReqId: () => crypto.randomUUID(), logger: false })
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    await registrarRotasDeAnalises(app, {
      consultarEstadoAgregado: new ConsultarEstadoAgregadoDoMomento({ repositorio }),
      sessaoDoCriador,
    })
    const token = sessaoDoCriador.emitir({
      duracaoEmSegundos: 600, negocioId, sessaoId: crypto.randomUUID(), utilizadorId,
    })
    const resposta = await app.inject({
      headers: { authorization: `Bearer ${token}` }, method: 'GET',
      url: `/v1/momentos/${momentoId}/analises`,
    })
    expect(resposta.statusCode).toBe(200)
    expect(resposta.json().dados).toEqual({
      conclusoes: 0, primeiraAberturaEm: null, primeiraConclusaoEm: null,
      origens: [], sessoesAbertas: 0, ultimaAberturaEm: null,
    })
    expect(JSON.stringify(resposta.json())).not.toContain('sessaoId')
  })
})
