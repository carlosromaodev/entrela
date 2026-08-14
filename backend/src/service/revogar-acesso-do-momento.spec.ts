import { describe, expect, it } from 'vitest'

import { RepositorioDeRevogacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-revogacao-de-momentos-em-memoria.js'
import { TokenPublico } from '../lib/seguranca/token-publico.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { RevogarAcessoDoMomento } from './revogar-acesso-do-momento.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'
const versaoId = '0198f9a0-8b75-7000-8000-000000000004'

function criarTokenPublicoDeterministico(): TokenPublico {
  let chamada = 0
  return new TokenPublico({
    chaveDeHmac: 'chave-de-hmac-isolada-e-segura-para-os-testes-revogar',
    gerarBytesAleatorios: () => {
      chamada += 1
      return Uint8Array.from({ length: 32 }, (_, indice) => (indice + chamada) % 256)
    },
  })
}

function criarRepositorioPublicado() {
  const repositorio = new RepositorioDeRevogacaoDeMomentosEmMemoria()
  repositorio.adicionarExperiencia({
    estado: 'PUBLICADA',
    momentoId,
    negocioId,
    versaoPublicadaId: versaoId,
  })
  repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
  repositorio.adicionarPortaAtiva({
    canalDeOrigem: 'LINK',
    estado: 'ATIVO',
    hmacDoToken: 'a'.repeat(64),
    id: 'ponto-url-antigo',
    momentoId,
    tipo: 'URL',
    versaoId,
  })
  repositorio.adicionarPortaAtiva({
    canalDeOrigem: 'QR',
    estado: 'ATIVO',
    hmacDoToken: 'b'.repeat(64),
    id: 'ponto-qr-antigo',
    momentoId,
    tipo: 'QR',
    versaoId,
  })
  return repositorio
}

describe('RevogarAcessoDoMomento', () => {
  it('revoga as portas activas sem criar novas', async () => {
    const repositorio = criarRepositorioPublicado()
    const revogar = new RevogarAcessoDoMomento({
      gerarId: () => 'novo-id',
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    const resultado = await revogar.executar({
      acao: 'REVOGAR',
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    expect(resultado).toEqual({ acao: 'REVOGAR', momentoId })
    const portas = repositorio.portasPorMomento.get(momentoId) ?? []
    expect(portas.every((porta) => porta.estado === 'REVOGADO')).toBe(true)
    expect(portas).toHaveLength(2)
  })

  it('regenera portas: revoga as antigas e cria duas novas distintas', async () => {
    const repositorio = criarRepositorioPublicado()
    const revogar = new RevogarAcessoDoMomento({
      gerarId: (() => {
        let indice = 0
        const ids = ['novo-url', 'novo-qr']
        return () => {
          const id = ids[indice]
          indice += 1
          if (id === undefined) throw new Error('Faltam IDs no teste.')
          return id
        }
      })(),
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    const resultado = await revogar.executar({
      acao: 'REGENERAR',
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    expect(resultado.acao).toBe('REGENERAR')
    expect(resultado.portas).toHaveLength(2)
    expect(resultado.portas?.[0]?.token).not.toBe(resultado.portas?.[1]?.token)

    const portas = repositorio.portasPorMomento.get(momentoId) ?? []
    expect(portas).toHaveLength(4)
    expect(portas.filter((porta) => porta.estado === 'REVOGADO')).toHaveLength(2)
    expect(portas.filter((porta) => porta.estado === 'ATIVO')).toHaveLength(2)
  })

  it('recusa revogar um Momento que nunca foi publicado', async () => {
    const repositorio = criarRepositorioPublicado()
    repositorio.adicionarExperiencia({
      estado: 'RASCUNHO',
      momentoId,
      negocioId,
      versaoPublicadaId: null,
    })
    const revogar = new RevogarAcessoDoMomento({
      gerarId: () => 'id',
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    await expect(
      revogar.executar({
        acao: 'REVOGAR',
        contexto: { negocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeTransicaoDeEstado)
  })

  it('recusa quem não tem permissão para revogar acesso', async () => {
    const repositorio = criarRepositorioPublicado()
    repositorio.definirPapel(negocioId, utilizadorId, 'ANALISTA')
    const revogar = new RevogarAcessoDoMomento({
      gerarId: () => 'id',
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    await expect(
      revogar.executar({
        acao: 'REVOGAR',
        contexto: { negocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('não distingue negócio inexistente de acesso cruzado', async () => {
    const repositorio = criarRepositorioPublicado()
    const outroNegocioId = '0198f9a0-8b75-7000-8000-000000000099'
    const revogar = new RevogarAcessoDoMomento({
      gerarId: () => 'id',
      repositorio,
      tokenPublico: criarTokenPublicoDeterministico(),
    })

    await expect(
      revogar.executar({
        acao: 'REVOGAR',
        contexto: { negocioId: outroNegocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })
})
