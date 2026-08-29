import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import { pedidoDeSessao, type ResolvedorDeSessaoDoCriador } from '../../identidade/autenticacao/resolvedor-de-sessao.js'
import type { CriarMomento } from '../../service/criar-momento.js'
import type { esquemaDoCorpoParaCriarMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDeCriacao = FastifyRequest<{
  Body: z.output<typeof esquemaDoCorpoParaCriarMomento>
}>

export function criarControladorDeCriacaoDoMomento(
  criarMomento: CriarMomento,
  sessaoDoCriador: ResolvedorDeSessaoDoCriador,
) {
  return async (requisicao: RequisicaoDeCriacao, resposta: FastifyReply) => {
    const sessao = await sessaoDoCriador.resolver(
      pedidoDeSessao(requisicao.headers, true),
    )
    const resultado = await criarMomento.executar({
      contexto: {
        negocioId: sessao.negocioId,
        utilizadorId: sessao.utilizadorId,
      },
      dados: requisicao.body,
    })

    return resposta.status(201).send({
      dados: resultado,
      metadados: {
        idDaRequisicao: requisicao.id,
        versaoDaAPI: 'v1' as const,
      },
    })
  }
}
