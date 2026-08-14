import { randomUUID } from 'node:crypto'

import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'

import { criarAplicacao } from '../app.js'
import type { Configuracao } from '../lib/configuracao/carregar-configuracao.js'
import { SessaoDoCriador } from '../lib/seguranca/sessao-do-criador.js'
import { TokenPublico } from '../lib/seguranca/token-publico.js'
import { RepositorioDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-momentos-em-memoria.js'
import type { RascunhoEditorialDoMomento } from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { RepositorioDePublicacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-publicacao-de-momentos-em-memoria.js'
import { AtualizarRascunhoDoMomento } from '../service/atualizar-rascunho-do-momento.js'
import { CriarMomento } from '../service/criar-momento.js'
import { PublicarMomento } from '../service/publicar-momento.js'
import { RepositorioDeRevogacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-revogacao-de-momentos-em-memoria.js'
import { RevogarAcessoDoMomento } from '../service/revogar-acesso-do-momento.js'
import { esquemaDaRespostaDoCatalogoDeCategorias } from './schemas/esquemas-das-categorias.js'
import {
  esquemaDaRespostaDaAtualizacaoDoMomento,
  esquemaDaRespostaDaCriacaoDoMomento,
  esquemaDaRespostaDaPublicacaoDoMomento,
  esquemaDaRespostaDaRevogacaoDoMomento,
} from './schemas/esquemas-dos-momentos.js'
import { esquemaDaRespostaDeSaude } from './schemas/esquemas-da-saude.js'
import { esquemaDoErroHttp } from './schemas/esquemas-de-resposta-http.js'

const configuracao: Configuracao = {
  ambiente: 'teste',
  chaveDeHmac: 'uma-chave-de-teste-com-pelo-menos-32-caracteres',
  chaveDeSessao: 'outra-chave-exclusiva-para-assinar-sessoes-de-teste',
  hospede: '127.0.0.1',
  nivelDeLog: 'silent',
  porta: 3333,
  urlDaBaseDeDados: 'postgresql://entrela:entrela@localhost:5432/entrela',
  versaoDaAplicacao: '0.1.0-teste',
}

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const sessaoId = '0198f9a0-8b75-7000-8000-000000000003'
const momentoId = '0198f9a0-8b75-7000-8000-000000000004'
const versaoId = '0198f9a0-8b75-7000-8000-000000000005'

function criarDependenciasDosMomentos() {
  const repositorio = new RepositorioDeMomentosEmMemoria()
  repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
  const ids = [momentoId, versaoId]
  const criarMomento = new CriarMomento({
    gerarId: () => {
      const id = ids.shift()
      if (id === undefined) throw new Error('Faltam IDs no teste HTTP.')
      return id
    },
    repositorio,
  })
  const sessaoDoCriador = new SessaoDoCriador({
    chaveDeSessao: configuracao.chaveDeSessao,
    obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
  })
  const token = sessaoDoCriador.emitir({
    duracaoEmSegundos: 900,
    negocioId,
    sessaoId,
    utilizadorId,
  })

  return { criarMomento, repositorio, sessaoDoCriador, token }
}

function criarRascunhoPublicavel(
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
): RascunhoEditorialDoMomento {
  return {
    abertura: { fusoHorario: 'Africa/Luanda', modo: 'ABRIR_AGORA' },
    capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
    estado: 'RASCUNHO',
    etapas: [
      { chave: 'revelacao-final', final: true, ordem: 1, texto: 'A revelação.' },
    ],
    idioma: 'pt-AO',
    modeloEditorial: 'CARTA_INTIMA',
    momentoId,
    negocioId,
    titulo: 'Uma surpresa para ti',
    versaoId,
    ...alteracoes,
  }
}

function criarTokenPublicoDeterministico(): TokenPublico {
  let chamada = 0
  return new TokenPublico({
    chaveDeHmac: 'chave-de-hmac-isolada-e-segura-para-os-testes-http',
    gerarBytesAleatorios: () => {
      chamada += 1
      return Uint8Array.from({ length: 32 }, (_, indice) => (indice + chamada) % 256)
    },
  })
}

function criarDependenciasDaPublicacao() {
  const repositorioDePublicacao = new RepositorioDePublicacaoDeMomentosEmMemoria()
  repositorioDePublicacao.adicionarRascunho(criarRascunhoPublicavel())
  repositorioDePublicacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
  repositorioDePublicacao.concederDireito(negocioId, 'PUBLICAR_MOMENTO')
  const publicarMomento = new PublicarMomento({
    gerarId: () => randomUUID(),
    obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
    repositorio: repositorioDePublicacao,
    tokenPublico: criarTokenPublicoDeterministico(),
  })
  const sessaoDoCriador = new SessaoDoCriador({
    chaveDeSessao: configuracao.chaveDeSessao,
    obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
  })
  const token = sessaoDoCriador.emitir({
    duracaoEmSegundos: 900,
    negocioId,
    sessaoId,
    utilizadorId,
  })

  return { publicarMomento, repositorioDePublicacao, sessaoDoCriador, token }
}

function criarDependenciasDaAtualizacao() {
  const repositorioDePublicacao = new RepositorioDePublicacaoDeMomentosEmMemoria()
  repositorioDePublicacao.adicionarRascunho(criarRascunhoPublicavel())
  repositorioDePublicacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
  const atualizarRascunhoDoMomento = new AtualizarRascunhoDoMomento({
    repositorio: repositorioDePublicacao,
  })
  const sessaoDoCriador = new SessaoDoCriador({
    chaveDeSessao: configuracao.chaveDeSessao,
    obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
  })
  const token = sessaoDoCriador.emitir({
    duracaoEmSegundos: 900,
    negocioId,
    sessaoId,
    utilizadorId,
  })

  return { atualizarRascunhoDoMomento, repositorioDePublicacao, sessaoDoCriador, token }
}

function criarDependenciasDaRevogacao() {
  const repositorioDeRevogacao = new RepositorioDeRevogacaoDeMomentosEmMemoria()
  repositorioDeRevogacao.adicionarExperiencia({
    estado: 'PUBLICADA',
    momentoId,
    negocioId,
    versaoPublicadaId: versaoId,
  })
  repositorioDeRevogacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
  repositorioDeRevogacao.adicionarPortaAtiva({
    canalDeOrigem: 'LINK',
    estado: 'ATIVO',
    hmacDoToken: 'a'.repeat(64),
    id: 'ponto-url-antigo',
    momentoId,
    tipo: 'URL',
    versaoId,
  })
  const revogarAcessoDoMomento = new RevogarAcessoDoMomento({
    gerarId: () => randomUUID(),
    repositorio: repositorioDeRevogacao,
    tokenPublico: criarTokenPublicoDeterministico(),
  })
  const sessaoDoCriador = new SessaoDoCriador({
    chaveDeSessao: configuracao.chaveDeSessao,
    obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
  })
  const token = sessaoDoCriador.emitir({
    duracaoEmSegundos: 900,
    negocioId,
    sessaoId,
    utilizadorId,
  })

  return { repositorioDeRevogacao, revogarAcessoDoMomento, sessaoDoCriador, token }
}

describe('contrato HTTP da fundação', () => {
  let aplicacao: FastifyInstance | undefined

  afterEach(async () => {
    await aplicacao?.close()
  })

  it('responde à saúde sem depender da base de dados', async () => {
    aplicacao = await criarAplicacao({
      configuracao,
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
    })

    const resposta = await aplicacao.inject({
      method: 'GET',
      url: '/saude',
    })

    expect(resposta.statusCode).toBe(200)
    expect(esquemaDaRespostaDeSaude.parse(resposta.json())).toEqual({
      dados: {
        estado: 'SAUDAVEL',
        instante: '2026-08-02T12:00:00.000Z',
        servico: 'entrela-backend',
        versao: '0.1.0-teste',
      },
      metadados: {
        idDaRequisicao: expect.any(String),
        versaoDaAPI: 'v1',
      },
    })
    expect(resposta.headers['x-id-da-requisicao']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('publica OpenAPI gerada a partir dos schemas Zod', async () => {
    aplicacao = await criarAplicacao({ configuracao })

    const resposta = await aplicacao.inject({
      method: 'GET',
      url: '/documentacao/json',
    })
    const documento = resposta.json()

    expect(resposta.statusCode).toBe(200)
    expect(documento.openapi).toBe('3.1.0')
    expect(documento.info.title).toBe('API Entrela')
    expect(
      documento.paths['/saude'].get.responses['200'].content[
        'application/json'
      ].schema.properties.dados.properties.estado.enum,
    ).toEqual(['SAUDAVEL'])
    expect(documento.paths['/v1/categorias'].get.tags).toEqual(['Catálogo'])

    const interfaceSwagger = await aplicacao.inject({
      method: 'GET',
      url: '/documentacao/',
    })

    expect(interfaceSwagger.statusCode).toBe(200)
    expect(interfaceSwagger.headers['content-type']).toContain('text/html')
    expect(interfaceSwagger.body).toContain('Swagger UI')
  })

  it('expõe o catálogo canónico sem anunciar categorias planeadas como disponíveis', async () => {
    aplicacao = await criarAplicacao({ configuracao })

    const resposta = await aplicacao.inject({
      method: 'GET',
      url: '/v1/categorias',
    })
    const corpo = esquemaDaRespostaDoCatalogoDeCategorias.parse(
      resposta.json(),
    )

    expect(resposta.statusCode).toBe(200)
    expect(corpo.dados).toHaveLength(6)
    expect(
      corpo.dados.find(({ codigo }) => codigo === 'MOMENTOS'),
    ).toMatchObject({
      disponibilidade: 'EM_IMPLEMENTACAO',
      primeiraFatia: true,
    })
  })

  it('usa o envelope de erro nas rotas inexistentes', async () => {
    aplicacao = await criarAplicacao({ configuracao })

    const resposta = await aplicacao.inject({
      method: 'GET',
      url: '/rota-inexistente',
    })
    const corpo = esquemaDoErroHttp.parse(resposta.json())

    expect(resposta.statusCode).toBe(404)
    expect(corpo.erro.codigo).toBe('ROTA_NAO_ENCONTRADA')
    expect(corpo.erro.idDaRequisicao).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('aplica cabeçalhos defensivos sem permitir cache de respostas da API', async () => {
    aplicacao = await criarAplicacao({ configuracao })

    const resposta = await aplicacao.inject({ method: 'GET', url: '/saude' })

    expect(resposta.headers).toMatchObject({
      'cache-control': 'no-store',
      'content-security-policy': expect.stringContaining(
        "frame-ancestors 'none'",
      ),
      'permissions-policy': 'camera=(), geolocation=(), microphone=()',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
    })
    expect(resposta.headers).not.toHaveProperty('access-control-allow-origin')
  })

  it('cria um Momento com o negócio e utilizador derivados da sessão', async () => {
    const dependencias = criarDependenciasDosMomentos()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      payload: {
        fusoHorario: 'Africa/Luanda',
        idioma: 'pt-AO',
        nomeDoDestinatario: 'Ana',
        titulo: 'Uma surpresa para ti',
      },
      url: '/v1/momentos',
    })

    expect(resposta.statusCode).toBe(201)
    expect(esquemaDaRespostaDaCriacaoDoMomento.parse(resposta.json())).toEqual({
      dados: {
        estado: 'RASCUNHO',
        momentoId,
        versaoDeRascunhoId: versaoId,
      },
      metadados: {
        idDaRequisicao: expect.any(String),
        versaoDaAPI: 'v1',
      },
    })
    expect(dependencias.repositorio.rascunhos[0]?.experiencia).toMatchObject({
      negocioId,
      criadoPorUtilizadorId: utilizadorId,
    })
  })

  it('recusa contexto de negócio injectado no corpo e sessão ausente', async () => {
    const dependencias = criarDependenciasDosMomentos()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const semSessao = await aplicacao.inject({
      method: 'POST',
      payload: {
        fusoHorario: 'Africa/Luanda',
        idioma: 'pt-AO',
        titulo: 'Momento privado',
      },
      url: '/v1/momentos',
    })
    const contextoNoCorpo = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      payload: {
        contexto: { negocioId, utilizadorId },
        fusoHorario: 'Africa/Luanda',
        idioma: 'pt-AO',
        titulo: 'Momento privado',
      },
      url: '/v1/momentos',
    })

    expect(semSessao.statusCode).toBe(401)
    expect(contextoNoCorpo.statusCode).toBe(400)
    expect(dependencias.repositorio.rascunhos).toHaveLength(0)
  })

  it('publica um Momento válido e devolve portas URL e QR distintas', async () => {
    const dependencias = criarDependenciasDaPublicacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      url: `/v1/momentos/${momentoId}/publicacoes`,
    })
    const corpo = esquemaDaRespostaDaPublicacaoDoMomento.parse(resposta.json())

    expect(resposta.statusCode).toBe(201)
    expect(corpo.dados).toMatchObject({ estado: 'PUBLICADA', momentoId })
    expect(corpo.dados.portas).toHaveLength(2)
    expect(corpo.dados.portas[0]?.token).not.toBe(corpo.dados.portas[1]?.token)
    expect(dependencias.repositorioDePublicacao.publicacoes).toHaveLength(1)
  })

  it('recusa publicar sem sessão autenticada', async () => {
    const dependencias = criarDependenciasDaPublicacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      method: 'POST',
      url: `/v1/momentos/${momentoId}/publicacoes`,
    })

    expect(resposta.statusCode).toBe(401)
    expect(dependencias.repositorioDePublicacao.publicacoes).toHaveLength(0)
  })

  it('recusa publicar sem direito comercial activo com o envelope de erro canónico', async () => {
    const dependencias = criarDependenciasDaPublicacao()
    dependencias.repositorioDePublicacao = new RepositorioDePublicacaoDeMomentosEmMemoria()
    dependencias.repositorioDePublicacao.adicionarRascunho(criarRascunhoPublicavel())
    dependencias.repositorioDePublicacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
    dependencias.publicarMomento = new PublicarMomento({
      gerarId: () => randomUUID(),
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
      repositorio: dependencias.repositorioDePublicacao,
      tokenPublico: criarTokenPublicoDeterministico(),
    })
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      url: `/v1/momentos/${momentoId}/publicacoes`,
    })
    const corpo = esquemaDoErroHttp.parse(resposta.json())

    expect(resposta.statusCode).toBe(403)
    expect(corpo.erro.codigo).toBe('DIREITO_INATIVO')
  })

  it('recusa publicar um rascunho editorial inválido com estado 422', async () => {
    const dependencias = criarDependenciasDaPublicacao()
    dependencias.repositorioDePublicacao = new RepositorioDePublicacaoDeMomentosEmMemoria()
    dependencias.repositorioDePublicacao.adicionarRascunho(
      criarRascunhoPublicavel({ capa: null }),
    )
    dependencias.repositorioDePublicacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
    dependencias.repositorioDePublicacao.concederDireito(negocioId, 'PUBLICAR_MOMENTO')
    dependencias.publicarMomento = new PublicarMomento({
      gerarId: () => randomUUID(),
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
      repositorio: dependencias.repositorioDePublicacao,
      tokenPublico: criarTokenPublicoDeterministico(),
    })
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      url: `/v1/momentos/${momentoId}/publicacoes`,
    })
    const corpo = esquemaDoErroHttp.parse(resposta.json())

    expect(resposta.statusCode).toBe(422)
    expect(corpo.erro.codigo).toBe('MOMENTO_NAO_PUBLICAVEL')
    expect(corpo.erro.campos).toBeUndefined()
  })

  it('actualiza o título do rascunho do negócio autenticado', async () => {
    const dependencias = criarDependenciasDaAtualizacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'PATCH',
      payload: { titulo: 'Título actualizado por HTTP' },
      url: `/v1/momentos/${momentoId}`,
    })
    const corpo = esquemaDaRespostaDaAtualizacaoDoMomento.parse(resposta.json())

    expect(resposta.statusCode).toBe(200)
    expect(corpo.dados).toEqual({ estado: 'RASCUNHO', momentoId, versaoId })
    const rascunho = await dependencias.repositorioDePublicacao.obterRascunho(
      negocioId,
      momentoId,
    )
    expect(rascunho?.titulo).toBe('Título actualizado por HTTP')
  })

  it('recusa actualizar sem sessão e sem nenhum campo enviado', async () => {
    const dependencias = criarDependenciasDaAtualizacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const semSessao = await aplicacao.inject({
      method: 'PATCH',
      payload: { titulo: 'Sem sessão' },
      url: `/v1/momentos/${momentoId}`,
    })
    const corpoVazio = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'PATCH',
      payload: {},
      url: `/v1/momentos/${momentoId}`,
    })

    expect(semSessao.statusCode).toBe(401)
    expect(corpoVazio.statusCode).toBe(400)
  })

  it('recusa actualizar um Momento já publicado com estado 409', async () => {
    const dependencias = criarDependenciasDaAtualizacao()
    dependencias.repositorioDePublicacao = new RepositorioDePublicacaoDeMomentosEmMemoria()
    dependencias.repositorioDePublicacao.adicionarRascunho(
      criarRascunhoPublicavel({ estado: 'PUBLICADA' }),
    )
    dependencias.repositorioDePublicacao.definirPapel(negocioId, utilizadorId, 'EDITOR')
    dependencias.atualizarRascunhoDoMomento = new AtualizarRascunhoDoMomento({
      repositorio: dependencias.repositorioDePublicacao,
    })
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'PATCH',
      payload: { titulo: 'Tarde demais' },
      url: `/v1/momentos/${momentoId}`,
    })
    const corpo = esquemaDoErroHttp.parse(resposta.json())

    expect(resposta.statusCode).toBe(409)
    expect(corpo.erro.codigo).toBe('TRANSICAO_DE_ESTADO_INVALIDA')
  })

  it('regenera as portas de um Momento publicado', async () => {
    const dependencias = criarDependenciasDaRevogacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const resposta = await aplicacao.inject({
      headers: { authorization: `Bearer ${dependencias.token}` },
      method: 'POST',
      payload: { acao: 'REGENERAR' },
      url: `/v1/momentos/${momentoId}/revogacoes-de-acesso`,
    })
    const corpo = esquemaDaRespostaDaRevogacaoDoMomento.parse(resposta.json())

    expect(resposta.statusCode).toBe(201)
    expect(corpo.dados.acao).toBe('REGENERAR')
    expect(corpo.dados.portas).toHaveLength(2)
    const portas = dependencias.repositorioDeRevogacao.portasPorMomento.get(momentoId) ?? []
    expect(portas.filter((porta) => porta.estado === 'ATIVO')).toHaveLength(2)
    expect(portas.filter((porta) => porta.estado === 'REVOGADO')).toHaveLength(1)
  })

  it('recusa revogar sem sessão e sem permissão adequada', async () => {
    const dependencias = criarDependenciasDaRevogacao()
    aplicacao = await criarAplicacao({ configuracao, ...dependencias })

    const semSessao = await aplicacao.inject({
      method: 'POST',
      payload: { acao: 'REVOGAR' },
      url: `/v1/momentos/${momentoId}/revogacoes-de-acesso`,
    })

    expect(semSessao.statusCode).toBe(401)
  })
})
