import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import { pedidoDeSessao, type ResolvedorDeSessaoDoCriador } from '../../identidade/autenticacao/resolvedor-de-sessao.js'
import type { AtualizarRascunhoDoMomento } from '../../service/atualizar-rascunho-do-momento.js'
import type { esquemaDoCorpoParaAtualizarMomento } from '../schemas/esquemas-dos-momentos.js'
import type { esquemaDosParametrosDoMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDeAtualizacao = FastifyRequest<{
  Body: z.output<typeof esquemaDoCorpoParaAtualizarMomento>
  Params: z.output<typeof esquemaDosParametrosDoMomento>
}>

export function criarControladorDeAtualizacaoDoMomento(
  atualizarRascunhoDoMomento: AtualizarRascunhoDoMomento,
  sessaoDoCriador: ResolvedorDeSessaoDoCriador,
) {
  return async (
    requisicao: RequisicaoDeAtualizacao,
    resposta: FastifyReply,
  ) => {
    const sessao = await sessaoDoCriador.resolver(
      pedidoDeSessao(requisicao.headers, true),
    )
    const resultado = await atualizarRascunhoDoMomento.executar({
      contexto: {
        negocioId: sessao.negocioId,
        utilizadorId: sessao.utilizadorId,
      },
      dados: requisicao.body,
      momentoId: requisicao.params.momentoId,
    })

    return resposta.status(200).send({
      dados: resultado,
      metadados: {
        idDaRequisicao: requisicao.id,
        versaoDaAPI: 'v1' as const,
      },
    })
  }
}
