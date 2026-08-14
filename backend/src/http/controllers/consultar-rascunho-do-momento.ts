import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import type { SessaoDoCriador } from '../../lib/seguranca/sessao-do-criador.js'
import type { ConsultarRascunhoDoMomento } from '../../service/consultar-rascunho-do-momento.js'
import type { esquemaDosParametrosDoMomento } from '../schemas/esquemas-dos-momentos.js'

type RequisicaoDeConsulta = FastifyRequest<{
  Params: z.output<typeof esquemaDosParametrosDoMomento>
}>

export function criarControladorDeConsultaDoRascunho(
  consultarRascunhoDoMomento: ConsultarRascunhoDoMomento,
  sessaoDoCriador: SessaoDoCriador,
) {
  return async (requisicao: RequisicaoDeConsulta, resposta: FastifyReply) => {
    const sessao = sessaoDoCriador.validar(requisicao.headers.authorization)
    const resultado = await consultarRascunhoDoMomento.executar({
      contexto: {
        negocioId: sessao.negocioId,
        utilizadorId: sessao.utilizadorId,
      },
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
