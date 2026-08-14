import { randomUUID } from 'node:crypto'

import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify, { LogController, type FastifyInstance } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { registrarRotasDeCategorias } from './http/routes/registrar-rotas-de-categorias.js'
import { registrarRotasDeMomentos } from './http/routes/registrar-rotas-de-momentos.js'
import { registrarRotasDeSaude } from './http/routes/registrar-rotas-de-saude.js'
import type { Configuracao } from './lib/configuracao/carregar-configuracao.js'
import type { SessaoDoCriador } from './lib/seguranca/sessao-do-criador.js'
import type { AtualizarRascunhoDoMomento } from './service/atualizar-rascunho-do-momento.js'
import type { CriarMomento } from './service/criar-momento.js'
import type { PublicarMomento } from './service/publicar-momento.js'
import type { RevogarAcessoDoMomento } from './service/revogar-acesso-do-momento.js'
import { ErroDeAcessoAoNegocio } from './service/errs/ErroDeAcessoAoNegocio.js'
import { ErroDeAutenticacao } from './service/errs/ErroDeAutenticacao.js'
import { ErroDeDireitoInativo } from './service/errs/ErroDeDireitoInativo.js'
import { ErroDePublicacaoDoMomento } from './service/errs/ErroDePublicacaoDoMomento.js'
import { ErroDeTransicaoDeEstado } from './service/errs/ErroDeTransicaoDeEstado.js'
import { ErroDeValidacaoDoCasoDeUso } from './service/errs/ErroDeValidacaoDoCasoDeUso.js'
import { ObterCatalogoDeCategorias } from './service/obter-catalogo-de-categorias.js'
import { VerificarSaudeDoBackend } from './service/verificar-saude-do-backend.js'

type DependenciasDaAplicacao = Readonly<{
  aoEncerrar?: () => Promise<void>
  atualizarRascunhoDoMomento?: AtualizarRascunhoDoMomento
  configuracao: Configuracao
  criarMomento?: CriarMomento
  obterInstanteAtual?: () => Date
  publicarMomento?: PublicarMomento
  revogarAcessoDoMomento?: RevogarAcessoDoMomento
  sessaoDoCriador?: SessaoDoCriador
}>

function erroTemValidacao(
  erro: unknown,
): erro is Readonly<{ validation: unknown }> {
  return (
    typeof erro === 'object' &&
    erro !== null &&
    'validation' in erro &&
    erro.validation !== undefined
  )
}

function erroTemCodigo(
  erro: unknown,
): erro is Error & Readonly<{ codigo: string }> {
  return (
    erro instanceof Error &&
    'codigo' in erro &&
    typeof erro.codigo === 'string'
  )
}

export async function criarAplicacao(
  dependencias: DependenciasDaAplicacao,
): Promise<FastifyInstance> {
  const aplicacao = Fastify({
    bodyLimit: 1024 * 1024,
    genReqId: () => randomUUID(),
    logController: new LogController({
      disableRequestLogging: dependencias.configuracao.ambiente === 'teste',
    }),
    logger:
      dependencias.configuracao.nivelDeLog === 'silent'
        ? false
        : {
            level: dependencias.configuracao.nivelDeLog,
            redact: {
              censor: '[OCULTO]',
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers.x-token-publico',
                'res.headers.set-cookie',
              ],
            },
          },
  })

  aplicacao.setValidatorCompiler(validatorCompiler)
  aplicacao.setSerializerCompiler(serializerCompiler)

  await aplicacao.register(swagger, {
    openapi: {
      info: {
        description: 'Contratos HTTP da plataforma Entrela.',
        title: 'API Entrela',
        version: dependencias.configuracao.versaoDaAplicacao,
      },
      components: {
        securitySchemes: {
          sessaoDoCriador: {
            bearerFormat: 'Sessão Entrela assinada',
            scheme: 'bearer',
            type: 'http',
          },
        },
      },
      openapi: '3.1.0',
    },
    transform: jsonSchemaTransform,
  })

  aplicacao.addHook('onRequest', async (requisicao, resposta) => {
    resposta.header('x-id-da-requisicao', requisicao.id)
    resposta.header('cache-control', 'no-store')
    resposta.header(
      'content-security-policy',
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    )
    resposta.header(
      'permissions-policy',
      'camera=(), geolocation=(), microphone=()',
    )
    resposta.header('referrer-policy', 'no-referrer')
    resposta.header('x-content-type-options', 'nosniff')
    resposta.header('x-frame-options', 'DENY')

    if (dependencias.configuracao.ambiente === 'producao') {
      resposta.header(
        'strict-transport-security',
        'max-age=31536000; includeSubDomains',
      )
    }
  })

  aplicacao.setNotFoundHandler(async (requisicao, resposta) => {
    return resposta.status(404).send({
      erro: {
        codigo: 'ROTA_NAO_ENCONTRADA',
        idDaRequisicao: requisicao.id,
        mensagem: 'A rota solicitada não existe.',
      },
    })
  })

  aplicacao.setErrorHandler(async (erro, requisicao, resposta) => {
    const validacaoFalhou = erroTemValidacao(erro)
    const validacaoDoCasoDeUso = erro instanceof ErroDeValidacaoDoCasoDeUso
    const estadoHttp =
      validacaoFalhou || validacaoDoCasoDeUso
        ? 400
        : erro instanceof ErroDeAutenticacao
          ? 401
          : erro instanceof ErroDeAcessoAoNegocio ||
              erro instanceof ErroDeDireitoInativo
            ? 403
            : erro instanceof ErroDeTransicaoDeEstado
              ? 409
              : erro instanceof ErroDePublicacaoDoMomento
                ? 422
                : 500

    if (estadoHttp === 500) {
      requisicao.log.error({ erro }, 'Falha não tratada na requisição.')
    }

    const codigo =
      validacaoFalhou || validacaoDoCasoDeUso
        ? 'VALIDACAO_FALHOU'
        : erroTemCodigo(erro)
          ? erro.codigo
          : 'ERRO_INTERNO'
    const mensagem =
      estadoHttp === 500
        ? 'Não foi possível concluir a operação.'
        : validacaoFalhou || validacaoDoCasoDeUso
          ? 'Os dados enviados não são válidos.'
          : erro instanceof Error
            ? erro.message
            : 'Não foi possível concluir a operação.'

    return resposta.status(estadoHttp).send({
      erro: {
        ...(validacaoDoCasoDeUso ? { campos: erro.campos } : {}),
        codigo,
        idDaRequisicao: requisicao.id,
        mensagem,
      },
    })
  })

  const verificarSaudeDoBackend = new VerificarSaudeDoBackend({
    obterInstanteAtual: dependencias.obterInstanteAtual ?? (() => new Date()),
    versaoDaAplicacao: dependencias.configuracao.versaoDaAplicacao,
  })
  const obterCatalogoDeCategorias = new ObterCatalogoDeCategorias()

  await registrarRotasDeSaude(aplicacao, {
    verificarSaudeDoBackend,
  })
  await registrarRotasDeCategorias(aplicacao, {
    obterCatalogoDeCategorias,
  })
  if (
    dependencias.sessaoDoCriador !== undefined &&
    (dependencias.criarMomento !== undefined ||
      dependencias.publicarMomento !== undefined ||
      dependencias.atualizarRascunhoDoMomento !== undefined ||
      dependencias.revogarAcessoDoMomento !== undefined)
  ) {
    await registrarRotasDeMomentos(aplicacao, {
      sessaoDoCriador: dependencias.sessaoDoCriador,
      ...(dependencias.criarMomento !== undefined
        ? { criarMomento: dependencias.criarMomento }
        : {}),
      ...(dependencias.publicarMomento !== undefined
        ? { publicarMomento: dependencias.publicarMomento }
        : {}),
      ...(dependencias.atualizarRascunhoDoMomento !== undefined
        ? { atualizarRascunhoDoMomento: dependencias.atualizarRascunhoDoMomento }
        : {}),
      ...(dependencias.revogarAcessoDoMomento !== undefined
        ? { revogarAcessoDoMomento: dependencias.revogarAcessoDoMomento }
        : {}),
    })
  }

  if (dependencias.aoEncerrar !== undefined) {
    aplicacao.addHook('onClose', dependencias.aoEncerrar)
  }

  await aplicacao.register(swaggerUi, {
    routePrefix: '/documentacao',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  })

  await aplicacao.ready()

  return aplicacao
}
