import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import type { SessaoDoCriador } from '../../lib/seguranca/sessao-do-criador.js'
import type { CriarMomento } from '../../service/criar-momento.js'
import type { esquemaDoCorpoParaCriarMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDeCriacao = FastifyRequest<{
  Body: z.output<typeof esquemaDoCorpoParaCriarMomento>
}>

export function criarControladorDeCriacaoDoMomento(
  criarMomento: CriarMomento,
  sessaoDoCriador: SessaoDoCriador,
) {
  return async (requisicao: RequisicaoDeCriacao, resposta: FastifyReply) => {
    const sessao = sessaoDoCriador.validar(requisicao.headers.authorization)
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
