import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import type { Configuracao } from '../../lib/configuracao/carregar-configuracao.js'
import type { AcederMomentoPublico } from '../../service/aceder-momento-publico.js'
import type { ContinuarNarrativaDoMomento } from '../../service/continuar-narrativa-do-momento.js'
import {
  controladorDeAberturaPublica,
  controladorDeResolucaoPublica,
  lerCookie,
} from '../controllers/aceder-momento-publico.js'
import {
  esquemaDoTokenPublico,
  corpoDaContinuacaoPublica,
  respostaDaContinuacaoPublica,
  respostaDaAberturaPublica,
  respostaDaResolucaoPublica,
} from '../schemas/esquemas-do-acesso-publico.js'
import { esquemaDoErroHttp } from '../schemas/esquemas-de-resposta-http.js'

export async function registrarRotasDeAcessoPublico(
  app: FastifyInstance,
  dependencias: Readonly<{
    acederMomentoPublico: AcederMomentoPublico
    configuracao: Configuracao
    continuarNarrativaDoMomento?: ContinuarNarrativaDoMomento
  }>,
) {
  app.withTypeProvider<ZodTypeProvider>().get('/momento/:token', {
    schema: {
      params: esquemaDoTokenPublico,
      response: { 200: respostaDaResolucaoPublica, 404: esquemaDoErroHttp },
      summary: 'Resolver acesso público ao Momento',
      tags: ['Momento público'],
    },
  }, controladorDeResolucaoPublica(dependencias.acederMomentoPublico))
  app.withTypeProvider<ZodTypeProvider>().post('/momento/:token/abrir', {
    schema: {
      params: esquemaDoTokenPublico,
      response: { 200: respostaDaAberturaPublica, 404: esquemaDoErroHttp },
      summary: 'Abrir Momento após gesto explícito',
      tags: ['Momento público'],
    },
  }, controladorDeAberturaPublica(dependencias.acederMomentoPublico, dependencias.configuracao))
  if (dependencias.continuarNarrativaDoMomento !== undefined) {
    app.withTypeProvider<ZodTypeProvider>().post('/momento/:token/continuar', {
      schema: {
        body: corpoDaContinuacaoPublica,
        params: esquemaDoTokenPublico,
        response: {
          200: respostaDaContinuacaoPublica,
          400: esquemaDoErroHttp,
          404: esquemaDoErroHttp,
          409: esquemaDoErroHttp,
        },
        summary: 'Continuar narrativa linear do Momento',
        tags: ['Momento público'],
      },
    }, async (requisicao, resposta) => {
      const identificadorAnonimo = lerCookie(requisicao.headers.cookie)
      if (identificadorAnonimo === undefined) {
        return resposta.status(404).send({
          erro: {
            codigo: 'MOMENTO_INDISPONIVEL',
            idDaRequisicao: requisicao.id,
            mensagem: 'Este Momento não está disponível.',
          },
        })
      }
      const resultado = await dependencias.continuarNarrativaDoMomento!.executar({
        ...requisicao.body,
        identificadorAnonimo,
        token: requisicao.params.token,
      })
      return resposta.status(200).send({
        dados: resultado,
        metadados: { idDaRequisicao: requisicao.id, versaoDaAPI: 'v1' as const },
      })
    })
  }
}
