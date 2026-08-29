import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import { pedidoDeSessao, type ResolvedorDeSessaoDoCriador } from '../../identidade/autenticacao/resolvedor-de-sessao.js'
import type { RevogarAcessoDoMomento } from '../../service/revogar-acesso-do-momento.js'
import type { esquemaDoCorpoParaRevogarAcesso } from '../schemas/esquemas-dos-momentos.js'
import type { esquemaDosParametrosDoMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDeRevogacao = FastifyRequest<{
  Body: z.output<typeof esquemaDoCorpoParaRevogarAcesso>
  Params: z.output<typeof esquemaDosParametrosDoMomento>
}>

export function criarControladorDeRevogacaoDoMomento(
  revogarAcessoDoMomento: RevogarAcessoDoMomento,
  sessaoDoCriador: ResolvedorDeSessaoDoCriador,
) {
  return async (
    requisicao: RequisicaoDeRevogacao,
    resposta: FastifyReply,
  ) => {
    const sessao = await sessaoDoCriador.resolver(
      pedidoDeSessao(requisicao.headers, true),
    )
    const resultado = await revogarAcessoDoMomento.executar({
      acao: requisicao.body.acao,
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
