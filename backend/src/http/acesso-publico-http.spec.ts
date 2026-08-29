import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'

import { criarAplicacao } from '../app.js'
import type { Configuracao } from '../lib/configuracao/carregar-configuracao.js'
import { TokenPublico } from '../lib/seguranca/token-publico.js'
import type { RepositorioDeAcessoPublicoAMomentos } from '../repository/contratos/repositorio-de-acesso-publico-a-momentos.js'
import { AcederMomentoPublico } from '../service/aceder-momento-publico.js'
import { ContinuarNarrativaDoMomento } from '../service/continuar-narrativa-do-momento.js'

const configuracao: Configuracao = {
  ambiente: 'teste', chaveDeHmac: 'chave-segura-com-mais-de-trinta-e-dois-bytes',
  chaveDeMedia: 'chave-de-media-com-mais-de-trinta-e-dois-bytes',
  chaveDeSessao: 'outra-chave-segura-com-mais-de-trinta-e-dois', hospede: '127.0.0.1',
  diretorioDeMedia: '/tmp/entrela-media-teste', nivelDeLog: 'silent', origemPublica: 'http://localhost:3333', porta: 3333,
  urlDaBaseDeDados: 'postgresql://entrela:entrela@localhost/entrela', versaoDaAplicacao: 'teste',
}

describe('HTTP público de Momentos', () => {
  let app: FastifyInstance | undefined
  afterEach(async () => app?.close())

  it('GET é neutro e POST emite cookie HttpOnly sem expor identificadores internos', async () => {
    let aberturas = 0
    const repositorio: RepositorioDeAcessoPublicoAMomentos = {
      async resolver() {
        return {
          abreEm: null, capa: { tipo: 'COR', corHexadecimal: '#123456' },
          estadoDaExperiencia: 'PUBLICADA', estadoDaPorta: 'ATIVO', expiraEm: null,
          fusoHorario: 'Africa/Luanda',
          iniciaEm: null, maximoDeUsos: null, modeloEditorial: 'CARTA_INTIMA',
          negocioId: '0198f9a0-8b75-7000-8000-000000000001',
          pontoDeAcessoId: '0198f9a0-8b75-7000-8000-000000000002', quantidadeDeUsos: 0,
          tipo: 'URL', terminaEm: null, titulo: 'Uma surpresa', versaoId: '0198f9a0-8b75-7000-8000-000000000003',
        }
      },
      async abrir(entrada) {
        aberturas += 1
        return { etapa: { chave: 'inicio', final: true, ordem: 1, texto: 'Olá' }, sessaoId: entrada.idDaSessao }
      },
      async continuar() {
        return {
          estado: 'ATIVA',
          etapa: { chave: 'segunda', final: true, ordem: 2, texto: 'Fim' },
          repetida: false,
        }
      },
    }
    const tokenPublico = new TokenPublico({ chaveDeHmac: configuracao.chaveDeHmac })
    const servico = new AcederMomentoPublico({
      gerarId: () => '0198f9a0-8b75-7000-8000-000000000004',
      gerarIdentificadorAnonimo: () => 'cookie-anonimo-opaco-comprido',
      obterInstanteAtual: () => new Date('2026-08-14T12:00:00Z'), repositorio, tokenPublico,
    })
    const continuarNarrativaDoMomento = new ContinuarNarrativaDoMomento({
      gerarId: () => crypto.randomUUID(), obterInstanteAtual: () => new Date(),
      repositorio, tokenPublico,
    })
    app = await criarAplicacao({
      acederMomentoPublico: servico, configuracao, continuarNarrativaDoMomento,
    })

    const openapi = (await app.inject({ method: 'GET', url: '/documentacao/json' })).json()
    expect(openapi.paths['/momento/{token}'].get.tags).toEqual(['Momento público'])
    expect(openapi.paths['/momento/{token}/abrir'].post.tags).toEqual(['Momento público'])

    const resolucao = await app.inject({ method: 'GET', url: '/momento/token-publico-opaco-comprido' })
    expect(resolucao.statusCode).toBe(200)
    expect(aberturas).toBe(0)
    expect(resolucao.json().dados).toMatchObject({ estado: 'DISPONIVEL', titulo: 'Uma surpresa' })

    const abertura = await app.inject({ method: 'POST', url: '/momento/token-publico-opaco-comprido/abrir' })
    expect(abertura.statusCode).toBe(200)
    expect(abertura.headers['set-cookie']).toContain('HttpOnly')
    expect(abertura.json().dados).toMatchObject({ estado: 'ATIVA', etapa: { chave: 'inicio' } })
    expect(JSON.stringify(abertura.json())).not.toContain('negocioId')

    const continuacao = await app.inject({
      headers: { cookie: abertura.headers['set-cookie'] as string },
      method: 'POST',
      payload: {
        chaveDaEtapaAtual: 'inicio',
        chaveDeIdempotencia: 'continuacao-http-0001',
      },
      url: '/momento/token-publico-opaco-comprido/continuar',
    })
    expect(continuacao.statusCode, continuacao.body).toBe(200)
    expect(continuacao.json().dados).toMatchObject({
      estado: 'ATIVA', etapa: { chave: 'segunda' }, repetida: false,
    })
  })

  it('token inexistente e revogado devolvem o mesmo contrato 404', async () => {
    let revogado = false
    const repositorio: RepositorioDeAcessoPublicoAMomentos = {
      async resolver() {
        return revogado ? {
          abreEm: null, capa: null, estadoDaExperiencia: 'PUBLICADA', estadoDaPorta: 'REVOGADO',
          expiraEm: null, fusoHorario: 'Africa/Luanda', iniciaEm: null, maximoDeUsos: null, modeloEditorial: 'CARTA_INTIMA',
          negocioId: crypto.randomUUID(), pontoDeAcessoId: crypto.randomUUID(), quantidadeDeUsos: 0,
          tipo: 'URL', terminaEm: null, titulo: 'oculto', versaoId: crypto.randomUUID(),
        } : null
      },
      async abrir() { throw new Error('não deve abrir') },
      async continuar() { throw new Error('não deve continuar') },
    }
    const servico = new AcederMomentoPublico({
      gerarId: crypto.randomUUID, obterInstanteAtual: () => new Date(), repositorio,
      tokenPublico: new TokenPublico({ chaveDeHmac: configuracao.chaveDeHmac }),
    })
    app = await criarAplicacao({ acederMomentoPublico: servico, configuracao })
    const inexistente = await app.inject({ method: 'GET', url: '/momento/token-publico-opaco-comprido' })
    revogado = true
    const portaRevogada = await app.inject({ method: 'GET', url: '/momento/token-publico-opaco-comprido' })
    expect(inexistente.statusCode).toBe(404)
    expect(portaRevogada.statusCode).toBe(404)
    expect(inexistente.json().erro.codigo).toBe(portaRevogada.json().erro.codigo)
  })
})
