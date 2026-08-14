import { describe, expect, it } from 'vitest'

import { RepositorioDePublicacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-publicacao-de-momentos-em-memoria.js'
import type { RascunhoEditorialDoMomento } from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { ConsultarRascunhoDoMomento } from './consultar-rascunho-do-momento.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'
const versaoId = '0198f9a0-8b75-7000-8000-000000000004'

function criarRascunho(
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
): RascunhoEditorialDoMomento {
  return {
    abertura: {
      abreEm: '2026-12-24T20:00:00.000Z',
      fusoHorario: 'Africa/Luanda',
      modo: 'AGENDAR_ABERTURA',
    },
    capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
    estado: 'RASCUNHO',
    etapas: [
      { chave: 'inicio', final: false, ordem: 1, texto: 'Começa aqui.' },
      { chave: 'final', final: true, ordem: 2, texto: 'A revelação.' },
    ],
    idioma: 'pt-AO',
    modeloEditorial: 'CARTA_INTIMA',
    momentoId,
    negocioId,
    nomeDoDestinatario: 'Ana',
    titulo: 'Uma surpresa para ti',
    versaoId,
    ...alteracoes,
  }
}

function preparar(
  papel: 'EDITOR' | 'ANALISTA' = 'EDITOR',
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
) {
  const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
  repositorio.adicionarRascunho(criarRascunho(alteracoes))
  repositorio.definirPapel(negocioId, utilizadorId, papel)
  return {
    consultar: new ConsultarRascunhoDoMomento({ repositorio }),
    repositorio,
  }
}

describe('ConsultarRascunhoDoMomento', () => {
  it('devolve apenas a projecção editorial necessária para hidratar o editor', async () => {
    const { consultar } = preparar()

    const resultado = await consultar.executar({
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    expect(resultado).toEqual({
      abertura: {
        abreEm: '2026-12-24T20:00:00.000Z',
        fusoHorario: 'Africa/Luanda',
        modo: 'AGENDAR_ABERTURA',
      },
      capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
      estado: 'RASCUNHO',
      etapas: [
        { chave: 'inicio', final: false, ordem: 1, texto: 'Começa aqui.' },
        { chave: 'final', final: true, ordem: 2, texto: 'A revelação.' },
      ],
      idioma: 'pt-AO',
      modeloEditorial: 'CARTA_INTIMA',
      momentoId,
      nomeDoDestinatario: 'Ana',
      titulo: 'Uma surpresa para ti',
      versaoId,
    })
    expect(resultado).not.toHaveProperty('negocioId')
    expect(resultado).not.toHaveProperty('pontosDeAcesso')
  })

  it('não distingue Momento inexistente de acesso por outro negócio', async () => {
    const { consultar } = preparar()

    await expect(
      consultar.executar({
        contexto: {
          negocioId: '0198f9a0-8b75-7000-8000-000000000099',
          utilizadorId,
        },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('permite retomar um rascunho recém-criado ainda sem etapas', async () => {
    const { consultar } = preparar('EDITOR', { etapas: [] })

    const resultado = await consultar.executar({
      contexto: { negocioId, utilizadorId },
      momentoId,
    })

    expect(resultado.etapas).toEqual([])
  })

  it('recusa papel sem acesso ao conteúdo privado', async () => {
    const { consultar } = preparar('ANALISTA')

    await expect(
      consultar.executar({
        contexto: { negocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('recusa usar a consulta do editor para uma versão já publicada', async () => {
    const { consultar } = preparar('EDITOR', { estado: 'PUBLICADA' })

    await expect(
      consultar.executar({
        contexto: { negocioId, utilizadorId },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeTransicaoDeEstado)
  })
})
