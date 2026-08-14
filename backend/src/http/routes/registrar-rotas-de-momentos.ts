import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import type { SessaoDoCriador } from '../../lib/seguranca/sessao-do-criador.js'
import type { AtualizarRascunhoDoMomento } from '../../service/atualizar-rascunho-do-momento.js'
import type { CriarMomento } from '../../service/criar-momento.js'
import type { PublicarMomento } from '../../service/publicar-momento.js'
import type { RevogarAcessoDoMomento } from '../../service/revogar-acesso-do-momento.js'
import { criarControladorDeAtualizacaoDoMomento } from '../controllers/atualizar-momento.js'
import { criarControladorDeCriacaoDoMomento } from '../controllers/criar-momento.js'
import { criarControladorDePublicacaoDoMomento } from '../controllers/publicar-momento.js'
import { criarControladorDeRevogacaoDoMomento } from '../controllers/revogar-acesso-do-momento.js'
import {
  esquemaDaRespostaDaAtualizacaoDoMomento,
  esquemaDaRespostaDaCriacaoDoMomento,
  esquemaDaRespostaDaPublicacaoDoMomento,
  esquemaDaRespostaDaRevogacaoDoMomento,
  esquemaDoCorpoParaAtualizarMomento,
  esquemaDoCorpoParaCriarMomento,
  esquemaDoCorpoParaRevogarAcesso,
  esquemaDosParametrosDoMomento,
} from '../schemas/esquemas-dos-momentos.js'
import { esquemaDoErroHttp } from '../schemas/esquemas-de-resposta-http.js'

type DependenciasDasRotasDeMomentos = Readonly<{
  atualizarRascunhoDoMomento?: AtualizarRascunhoDoMomento
  criarMomento?: CriarMomento
  publicarMomento?: PublicarMomento
  revogarAcessoDoMomento?: RevogarAcessoDoMomento
  sessaoDoCriador: SessaoDoCriador
}>

export async function registrarRotasDeMomentos(
  aplicacao: FastifyInstance,
  dependencias: DependenciasDasRotasDeMomentos,
): Promise<void> {
  if (dependencias.criarMomento !== undefined) {
    aplicacao.withTypeProvider<ZodTypeProvider>().post(
      '/v1/momentos',
      {
        schema: {
          body: esquemaDoCorpoParaCriarMomento,
          description:
            'Cria uma experiência de Momentos e a primeira versão de rascunho no negócio da sessão autenticada.',
          response: {
            201: esquemaDaRespostaDaCriacaoDoMomento,
            400: esquemaDoErroHttp,
            401: esquemaDoErroHttp,
            403: esquemaDoErroHttp,
            500: esquemaDoErroHttp,
          },
          security: [{ sessaoDoCriador: [] }],
          summary: 'Criar rascunho de Momento',
          tags: ['Momentos'],
        },
      },
      criarControladorDeCriacaoDoMomento(
        dependencias.criarMomento,
        dependencias.sessaoDoCriador,
      ),
    )
  }

  if (dependencias.atualizarRascunhoDoMomento !== undefined) {
    aplicacao.withTypeProvider<ZodTypeProvider>().patch(
      '/v1/momentos/:momentoId',
      {
        schema: {
          body: esquemaDoCorpoParaAtualizarMomento,
          description:
            'Actualiza campos do rascunho (título, destinatário, idioma, modelo, capa, etapas ou abertura) do negócio autorizado. Só aceita rascunhos ainda não publicados.',
          params: esquemaDosParametrosDoMomento,
          response: {
            200: esquemaDaRespostaDaAtualizacaoDoMomento,
            400: esquemaDoErroHttp,
            401: esquemaDoErroHttp,
            403: esquemaDoErroHttp,
            409: esquemaDoErroHttp,
            422: esquemaDoErroHttp,
            500: esquemaDoErroHttp,
          },
          security: [{ sessaoDoCriador: [] }],
          summary: 'Actualizar rascunho de Momento',
          tags: ['Momentos'],
        },
      },
      criarControladorDeAtualizacaoDoMomento(
        dependencias.atualizarRascunhoDoMomento,
        dependencias.sessaoDoCriador,
      ),
    )
  }

  if (dependencias.publicarMomento !== undefined) {
    aplicacao.withTypeProvider<ZodTypeProvider>().post(
      '/v1/momentos/:momentoId/publicacoes',
      {
        schema: {
          description:
            'Valida o rascunho, exige direito activo e publica o Momento, congelando a versão e criando as portas URL e QR.',
          params: esquemaDosParametrosDoMomento,
          response: {
            201: esquemaDaRespostaDaPublicacaoDoMomento,
            400: esquemaDoErroHttp,
            401: esquemaDoErroHttp,
            403: esquemaDoErroHttp,
            422: esquemaDoErroHttp,
            500: esquemaDoErroHttp,
          },
          security: [{ sessaoDoCriador: [] }],
          summary: 'Publicar Momento',
          tags: ['Momentos'],
        },
      },
      criarControladorDePublicacaoDoMomento(
        dependencias.publicarMomento,
        dependencias.sessaoDoCriador,
      ),
    )
  }

  if (dependencias.revogarAcessoDoMomento !== undefined) {
    aplicacao.withTypeProvider<ZodTypeProvider>().post(
      '/v1/momentos/:momentoId/revogacoes-de-acesso',
      {
        schema: {
          body: esquemaDoCorpoParaRevogarAcesso,
          description:
            'Revoga as portas activas ou regenera-as (revoga as antigas e cria URL/QR novos), mantendo a experiência publicada.',
          params: esquemaDosParametrosDoMomento,
          response: {
            201: esquemaDaRespostaDaRevogacaoDoMomento,
            400: esquemaDoErroHttp,
            401: esquemaDoErroHttp,
            403: esquemaDoErroHttp,
            409: esquemaDoErroHttp,
            500: esquemaDoErroHttp,
          },
          security: [{ sessaoDoCriador: [] }],
          summary: 'Revogar ou regenerar acesso ao Momento',
          tags: ['Momentos'],
        },
      },
      criarControladorDeRevogacaoDoMomento(
        dependencias.revogarAcessoDoMomento,
        dependencias.sessaoDoCriador,
      ),
    )
  }
}
