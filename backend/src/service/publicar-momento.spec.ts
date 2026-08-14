import { describe, expect, it } from 'vitest'

import { TokenPublico } from '../lib/seguranca/token-publico.js'
import { RepositorioDePublicacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-publicacao-de-momentos-em-memoria.js'
import type { RascunhoEditorialDoMomento } from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDePublicacaoDoMomento } from './errs/ErroDePublicacaoDoMomento.js'
import { PublicarMomento } from './publicar-momento.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'
const versaoId = '0198f9a0-8b75-7000-8000-000000000004'
const pontoUrlId = '0198f9a0-8b75-7000-8000-000000000005'
const pontoQrId = '0198f9a0-8b75-7000-8000-000000000006'

function criarRascunho(
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
): RascunhoEditorialDoMomento {
  return {
    abertura: {
      abreEm: '2026-12-24T19:00:00.000Z',
      fusoHorario: 'Africa/Luanda',
      modo: 'AGENDAR_ABERTURA',
    },
    capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
    estado: 'RASCUNHO',
    etapas: [
      {
        chave: 'cena-1',
        final: false,
        ordem: 1,
        texto: 'A primeira recordação.',
      },
      {
        chave: 'revelacao-final',
        final: true,
        ordem: 2,
        texto: 'A revelação.',
      },
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

function criarGeradorDeIds(...ids: string[]): () => string {
  let indice = 0
  return () => {
    const id = ids[indice]
    indice += 1
    if (id === undefined) throw new Error('Faltam IDs preparados no teste.')
    return id
  }
}

function criarTokenPublicoDeterministico(): TokenPublico {
  let chamada = 0
  return new TokenPublico({
    chaveDeHmac: 'chave-de-hmac-isolada-e-segura-para-os-testes',
    gerarBytesAleatorios: () => {
      chamada += 1
      return Uint8Array.from({ length: 32 }, (_, indice) =>
        (indice + chamada) % 256,
      )
    },
  })
}

describe('PublicarMomento', () => {
  it('congela a versão e cria portas URL e QR distintas numa única operação', async () => {
    const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
    repositorio.adicionarRascunho(criarRascunho())
    repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
    repositorio.concederDireito(negocioId, 'PUBLICAR_MOMENTO')
    const publicar = new PublicarMomento({
      gerarId: criarGeradorDeIds(pontoUrlId, pontoQrId),
      obterInstanteAtual: () => new Date('2026-08-02T12:00:00.000Z'),
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    const resultado = await publicar.executar({
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    expect(resultado).toMatchObject({
      abreEm: '2026-12-24T19:00:00.000Z',
      estado: 'PUBLICADA',
      momentoId,
      portas: [
        { tipo: 'URL', token: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) },
        { tipo: 'QR', token: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) },
      ],
      versaoId,
    })
    expect(resultado.portas[0]?.token).not.toBe(resultado.portas[1]?.token)
    expect(repositorio.publicacoes).toHaveLength(1)
    expect(repositorio.publicacoes[0]).toMatchObject({
      estadoDaExperiencia: 'PUBLICADA',
      estadoDaVersao: 'PUBLICADA',
      momentoId,
      pontosDeAcesso: [
        { id: pontoUrlId, tipo: 'URL' },
        { id: pontoQrId, tipo: 'QR' },
      ],
      versaoId,
    })
    expect(repositorio.publicacoes[0]?.somaDeVerificacao).toMatch(
      /^[a-f0-9]{64}$/,
    )
    for (const ponto of repositorio.publicacoes[0]?.pontosDeAcesso ?? []) {
      expect(ponto).not.toHaveProperty('token')
    }
  })

  it.each([
    [
      'SEM_CAPA',
      criarRascunho({ capa: null }),
    ],
    [
      'ETAPA_SEM_CONTEUDO',
      criarRascunho({
        etapas: [
          { chave: 'final', final: true, ordem: 1, texto: ' ' },
        ],
      }),
    ],
    [
      'MEDIA_NAO_PRONTA',
      criarRascunho({
        etapas: [
          {
            chave: 'final',
            final: true,
            media: {
              estado: 'PENDENTE',
              ficheiroId: versaoId,
              tamanhoEmBytes: 1024,
              tipo: 'IMAGEM',
            },
            ordem: 1,
          },
        ],
      }),
    ],
  ] as const)('recusa publicação editorial inválida: %s', async (codigo, rascunho) => {
    const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
    repositorio.adicionarRascunho(rascunho)
    repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
    repositorio.concederDireito(negocioId, 'PUBLICAR_MOMENTO')
    const publicar = new PublicarMomento({
      gerarId: criarGeradorDeIds(pontoUrlId, pontoQrId),
      obterInstanteAtual: () => new Date(),
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    const execucao = publicar.executar({
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    await expect(execucao).rejects.toBeInstanceOf(ErroDePublicacaoDoMomento)
    await expect(execucao).rejects.toMatchObject({ problemas: [codigo] })
    expect(repositorio.publicacoes).toHaveLength(0)
  })

  it('recusa publicação sem direito comercial activo', async () => {
    const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
    repositorio.adicionarRascunho(criarRascunho())
    repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
    const publicar = new PublicarMomento({
      gerarId: criarGeradorDeIds(pontoUrlId, pontoQrId),
      obterInstanteAtual: () => new Date(),
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    await expect(
      publicar.executar({
        contexto: { negocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toMatchObject({ codigo: 'DIREITO_INATIVO' })
    expect(repositorio.publicacoes).toHaveLength(0)
  })

  it('não distingue negócio inexistente de acesso cruzado', async () => {
    const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
    repositorio.adicionarRascunho(criarRascunho())
    const outroNegocioId = '0198f9a0-8b75-7000-8000-000000000099'
    repositorio.definirPapel(outroNegocioId, utilizadorId, 'EDITOR')
    const publicar = new PublicarMomento({
      gerarId: criarGeradorDeIds(pontoUrlId, pontoQrId),
      obterInstanteAtual: () => new Date(),
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    await expect(
      publicar.executar({
        contexto: { negocioId: outroNegocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })
})
