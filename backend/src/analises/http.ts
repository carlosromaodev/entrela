import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import type { SessaoDoCriador } from '../lib/seguranca/sessao-do-criador.js'
import { esquemaDoErroHttp, esquemaDosMetadadosHttp } from '../http/schemas/esquemas-de-resposta-http.js'
import type { ConsultarEstadoAgregadoDoMomento } from './servico.js'

const parametros = z.strictObject({ momentoId: z.uuid() })
const consulta = z.strictObject({ pontoDeAcessoId: z.uuid().optional() })
const resposta = z.strictObject({
  dados: z.strictObject({
    conclusoes: z.number().int().nonnegative(),
    primeiraAberturaEm: z.string().nullable(),
    primeiraConclusaoEm: z.string().nullable(),
    origens: z.array(z.strictObject({
      aberturas: z.number().int().nonnegative(),
      conclusoes: z.number().int().nonnegative(),
      tipo: z.enum(['QR', 'URL']),
    })),
    sessoesAbertas: z.number().int().nonnegative(),
    ultimaAberturaEm: z.string().nullable(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

export async function registrarRotasDeAnalises(
  app: FastifyInstance,
  dependencias: Readonly<{
    consultarEstadoAgregado: ConsultarEstadoAgregadoDoMomento
    sessaoDoCriador: SessaoDoCriador
  }>,
) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/v1/momentos/:momentoId/analises',
    {
      schema: {
        params: parametros,
        querystring: consulta,
        response: {
          200: resposta,
          400: esquemaDoErroHttp,
          401: esquemaDoErroHttp,
          403: esquemaDoErroHttp,
        },
        security: [{ sessaoDoCriador: [] }],
        summary: 'Consultar estado agregado e anónimo do Momento',
        tags: ['Análises'],
      },
    },
    async (requisicao, retorno) => {
      const sessao = dependencias.sessaoDoCriador.validar(
        requisicao.headers.authorization,
      )
      const dados = await dependencias.consultarEstadoAgregado.executar({
        contexto: {
          negocioId: sessao.negocioId,
          utilizadorId: sessao.utilizadorId,
        },
        momentoId: requisicao.params.momentoId,
        ...(requisicao.query.pontoDeAcessoId === undefined
          ? {}
          : { pontoDeAcessoId: requisicao.query.pontoDeAcessoId }),
      })
      return retorno.status(200).send({
        dados: { ...dados, origens: [...dados.origens] },
        metadados: {
          idDaRequisicao: requisicao.id,
          versaoDaAPI: 'v1' as const,
        },
      })
    },
  )
}

export const esquemasHttpDasAnalises = { consulta, parametros, resposta }
