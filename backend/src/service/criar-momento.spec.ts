import { describe, expect, it } from 'vitest'

import { RepositorioDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-momentos-em-memoria.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeValidacaoDoCasoDeUso } from './errs/ErroDeValidacaoDoCasoDeUso.js'
import { CriarMomento } from './criar-momento.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'
const versaoId = '0198f9a0-8b75-7000-8000-000000000004'

function criarGeradorDeIds(...ids: string[]): () => string {
  let indice = 0

  return () => {
    const id = ids[indice]
    indice += 1

    if (id === undefined) {
      throw new Error('O teste não preparou IDs suficientes.')
    }

    return id
  }
}

describe('CriarMomento', () => {
  it('cria experiência, versão inicial e conteúdo como um único rascunho', async () => {
    const repositorio = new RepositorioDeMomentosEmMemoria()
    repositorio.autorizarCriacao(negocioId, utilizadorId)
    const criarMomento = new CriarMomento({
      gerarId: criarGeradorDeIds(momentoId, versaoId),
      repositorio,
    })

    const resultado = await criarMomento.executar({
      contexto: { negocioId, utilizadorId },
      dados: {
        fusoHorario: 'Africa/Luanda',
        idioma: 'pt-AO',
        nomeDoDestinatario: 'Ana',
        titulo: 'Uma surpresa para ti',
      },
    })

    expect(resultado).toEqual({
      estado: 'RASCUNHO',
      momentoId,
      versaoDeRascunhoId: versaoId,
    })
    expect(repositorio.rascunhos).toEqual([
      {
        conteudo: {
          idioma: 'pt-AO',
          nomeDoDestinatario: 'Ana',
          titulo: 'Uma surpresa para ti',
        },
        experiencia: {
          categoria: 'MOMENTOS',
          criadoPorUtilizadorId: utilizadorId,
          estado: 'RASCUNHO',
          fusoHorario: 'Africa/Luanda',
          id: momentoId,
          idiomaPredefinido: 'pt-AO',
          negocioId,
          versaoDeRascunhoAtualId: versaoId,
          versaoPublicadaId: null,
        },
        versao: {
          criadoPorUtilizadorId: utilizadorId,
          estado: 'RASCUNHO',
          experienciaId: momentoId,
          id: versaoId,
          numero: 1,
        },
      },
    ])
  })

  it('recusa dados editoriais inválidos antes de consultar o repositório', async () => {
    const repositorio = new RepositorioDeMomentosEmMemoria()
    const criarMomento = new CriarMomento({
      gerarId: criarGeradorDeIds(momentoId, versaoId),
      repositorio,
    })

    const execucao = criarMomento.executar({
      contexto: { negocioId, utilizadorId },
      dados: {
        fusoHorario: 'Fuso/Inexistente',
        idioma: 'pt-AO',
        titulo: ' ',
      },
    })

    await expect(execucao).rejects.toBeInstanceOf(
      ErroDeValidacaoDoCasoDeUso,
    )
    await expect(execucao).rejects.toMatchObject({
      codigo: 'VALIDACAO_FALHOU',
    })
    expect(repositorio.quantidadeDeConsultasDeAcesso).toBe(0)
    expect(repositorio.rascunhos).toHaveLength(0)
  })

  it('recusa utilizador sem papel autorizado no negócio', async () => {
    const repositorio = new RepositorioDeMomentosEmMemoria()
    const criarMomento = new CriarMomento({
      gerarId: criarGeradorDeIds(momentoId, versaoId),
      repositorio,
    })

    await expect(
      criarMomento.executar({
        contexto: { negocioId, utilizadorId },
        dados: {
          fusoHorario: 'Africa/Luanda',
          idioma: 'en',
          titulo: 'A private moment',
        },
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
    expect(repositorio.rascunhos).toHaveLength(0)
  })
})
