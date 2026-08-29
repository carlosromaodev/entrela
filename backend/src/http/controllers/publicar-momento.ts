import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import { pedidoDeSessao, type ResolvedorDeSessaoDoCriador } from '../../identidade/autenticacao/resolvedor-de-sessao.js'
import type { PublicarMomento } from '../../service/publicar-momento.js'
import type { esquemaDosParametrosDoMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDePublicacao = FastifyRequest<{
  Params: z.output<typeof esquemaDosParametrosDoMomento>
}>

export function criarControladorDePublicacaoDoMomento(
  publicarMomento: PublicarMomento,
  sessaoDoCriador: ResolvedorDeSessaoDoCriador,
) {
  return async (
    requisicao: RequisicaoDePublicacao,
    resposta: FastifyReply,
  ) => {
    const sessao = await sessaoDoCriador.resolver(
      pedidoDeSessao(requisicao.headers, true),
    )
    const resultado = await publicarMomento.executar({
      contexto: {
        negocioId: sessao.negocioId,
        utilizadorId: sessao.utilizadorId,
      },
      momentoId: requisicao.params.momentoId,
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
