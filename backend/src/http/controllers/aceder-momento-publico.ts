import type { FastifyReply, FastifyRequest } from 'fastify'
import type { z } from 'zod'

import type { Configuracao } from '../../lib/configuracao/carregar-configuracao.js'
import type { AcederMomentoPublico } from '../../service/aceder-momento-publico.js'
import type { esquemaDoTokenPublico } from '../schemas/esquemas-do-acesso-publico.js'

type Pedido = FastifyRequest<{ Params: z.output<typeof esquemaDoTokenPublico> }>

export function lerCookie(cabecalho: string | undefined): string | undefined {
  return cabecalho
    ?.split(';')
    .map((item) => item.trim().split('='))
    .find(([nome]) => nome === 'entrela_sessao')?.[1]
}

function envelope(requisicao: Pedido, dados: unknown) {
  return {
    dados,
    metadados: { idDaRequisicao: requisicao.id, versaoDaAPI: 'v1' as const },
  }
}

export function controladorDeResolucaoPublica(servico: AcederMomentoPublico) {
  return async (requisicao: Pedido, resposta: FastifyReply) =>
    resposta.status(200).send(
      envelope(
        requisicao,
        await servico.resolver({ token: requisicao.params.token }),
      ),
    )
}

export function controladorDeAberturaPublica(
  servico: AcederMomentoPublico,
  configuracao: Configuracao,
) {
  return async (requisicao: Pedido, resposta: FastifyReply) => {
    const resultado = await servico.abrir({
      identificadorAnonimo: lerCookie(requisicao.headers.cookie),
      token: requisicao.params.token,
    })
    resposta.header(
      'set-cookie',
      `entrela_sessao=${resultado.identificadorAnonimo}; Path=/momento; HttpOnly; SameSite=Lax; Max-Age=2592000${configuracao.ambiente === 'producao' ? '; Secure' : ''}`,
    )
    const { identificadorAnonimo: _, ...dados } = resultado
    return resposta.status(200).send(envelope(requisicao, dados))
  }
}
