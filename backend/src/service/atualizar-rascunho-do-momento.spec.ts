import { describe, expect, it } from 'vitest'

import { RepositorioDePublicacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-publicacao-de-momentos-em-memoria.js'
import type { RascunhoEditorialDoMomento } from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { AtualizarRascunhoDoMomento } from './atualizar-rascunho-do-momento.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { ErroDeValidacaoDoCasoDeUso } from './errs/ErroDeValidacaoDoCasoDeUso.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'
const versaoId = '0198f9a0-8b75-7000-8000-000000000004'

function criarRascunho(
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
): RascunhoEditorialDoMomento {
  return {
    abertura: { fusoHorario: 'Africa/Luanda', modo: 'ABRIR_AGORA' },
    capa: null,
    estado: 'RASCUNHO',
    etapas: [{ chave: 'revelacao-final', final: true, ordem: 1 }],
    idioma: 'pt-AO',
    modeloEditorial: 'CARTA_INTIMA',
    momentoId,
    negocioId,
    titulo: 'Rascunho inicial',
    versaoId,
    ...alteracoes,
  }
}

function criarRepositorioComRascunho(
  papel: 'PROPRIETARIO' | 'ADMINISTRADOR' | 'EDITOR' | 'OPERADOR' | 'ANALISTA' | 'FATURACAO' = 'EDITOR',
  alteracoes: Partial<RascunhoEditorialDoMomento> = {},
): RepositorioDePublicacaoDeMomentosEmMemoria {
  const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
  repositorio.adicionarRascunho(criarRascunho(alteracoes))
  repositorio.definirPapel(negocioId, utilizadorId, papel)
  return repositorio
}

describe('AtualizarRascunhoDoMomento', () => {
  it('actualiza apenas os campos enviados, preservando os restantes', async () => {
    const repositorio = criarRepositorioComRascunho()
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    const resultado = await atualizar.executar({
      contexto: { negocioId, utilizadorId },
      dados: { titulo: 'Uma surpresa renomeada' },
      momentoId,
    })

    expect(resultado).toEqual({
      estado: 'RASCUNHO',
      momentoId,
      versaoId,
    })
    const rascunho = await repositorio.obterRascunho(negocioId, momentoId)
    expect(rascunho?.titulo).toBe('Uma surpresa renomeada')
    expect(rascunho?.idioma).toBe('pt-AO')
  })

  it('substitui a lista de etapas quando enviada', async () => {
    const repositorio = criarRepositorioComRascunho()
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    await atualizar.executar({
      contexto: { negocioId, utilizadorId },
      dados: {
        etapas: [
          { chave: 'cena-1', final: false, ordem: 1, texto: 'A primeira cena.' },
          { chave: 'final', final: true, ordem: 2, texto: 'A revelação.' },
        ],
      },
      momentoId,
    })

    const rascunho = await repositorio.obterRascunho(negocioId, momentoId)
    expect(rascunho?.etapas).toHaveLength(2)
    expect(rascunho?.etapas.at(-1)).toMatchObject({ chave: 'final', final: true })
  })

  it('recusa entrada sem nenhum campo para actualizar', async () => {
    const repositorio = criarRepositorioComRascunho()
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    await expect(
      atualizar.executar({
        contexto: { negocioId, utilizadorId },
        dados: {},
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeValidacaoDoCasoDeUso)
  })

  it('recusa etapas estruturalmente inválidas antes de persistir', async () => {
    const repositorio = criarRepositorioComRascunho()
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    const execucao = atualizar.executar({
      contexto: { negocioId, utilizadorId },
      dados: {
        etapas: [
          { chave: 'a', final: false, ordem: 1 },
          { chave: 'b', final: false, ordem: 1 },
        ],
      },
      momentoId,
    })

    await expect(execucao).rejects.toMatchObject({
      codigo: 'MOMENTO_NAO_PUBLICAVEL',
    })
    const rascunho = await repositorio.obterRascunho(negocioId, momentoId)
    expect(rascunho?.etapas).toHaveLength(1)
  })

  it('recusa edição de quem não tem permissão de editor no negócio', async () => {
    const repositorio = criarRepositorioComRascunho('ANALISTA')
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    await expect(
      atualizar.executar({
        contexto: { negocioId, utilizadorId },
        dados: { titulo: 'Tentativa não autorizada' },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('não distingue negócio inexistente de acesso cruzado', async () => {
    const repositorio = criarRepositorioComRascunho()
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })
    const outroNegocioId = '0198f9a0-8b75-7000-8000-000000000099'

    await expect(
      atualizar.executar({
        contexto: { negocioId: outroNegocioId, utilizadorId },
        dados: { titulo: 'Não deveria funcionar' },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('recusa editar um Momento já publicado', async () => {
    const repositorio = criarRepositorioComRascunho('EDITOR', { estado: 'PUBLICADA' })
    const atualizar = new AtualizarRascunhoDoMomento({ repositorio })

    await expect(
      atualizar.executar({
        contexto: { negocioId, utilizadorId },
        dados: { titulo: 'Tarde demais' },
        momentoId,
      }),
    ).rejects.toBeInstanceOf(ErroDeTransicaoDeEstado)
  })
})
