import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import type { RepositorioDeConvites } from '../repository/contratos/repositorio-de-convites.js'
import { CriarConvite } from './criar-convite.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'

describe('CriarConvite', () => {
  let repositorio: RepositorioDeConvites
  let politica: PoliticaDeAcessoAoNegocio
  let criarConvite: CriarConvite
  const gerarId = vi.fn(() => 'test-id')

  beforeEach(() => {
    repositorio = {
      criarConvite: vi.fn(),
      obterPapelDoUtilizador: vi.fn().mockResolvedValue('PROPRIETARIO')
    } as unknown as RepositorioDeConvites
    politica = new PoliticaDeAcessoAoNegocio()
    criarConvite = new CriarConvite({ gerarId, politicaDeAcessoAoNegocio: politica, repositorio })
  })

  it('deve criar um convite quando o usuário tem permissão de PROPRIETARIO', async () => {
    const entrada = {
      contexto: {
        negocioId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        utilizadorId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      },
      dados: {
        experienciaId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        titulo: 'Convite de Teste',
        dataDoEvento: '2026-12-31T20:00:00Z',
        local: 'Local de Teste'
      }
    }

    await criarConvite.executar(entrada)

    expect(repositorio.criarConvite).toHaveBeenCalledWith(
      expect.objectContaining({
        experiencia: expect.objectContaining({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          titulo: 'Convite de Teste',
          estado: 'RASCUNHO',
          negocioId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        })
      })
    )
  })

  it('deve lançar ErroDeAcessoAoNegocio quando usuário não tem permissão', async () => {
    ;(repositorio.obterPapelDoUtilizador as Mock).mockResolvedValueOnce('ANALISTA') // Sem permissão de criar

    const entrada = {
      contexto: {
        negocioId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        utilizadorId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      },
      dados: {
        experienciaId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        titulo: 'Convite de Teste',
        dataDoEvento: '2026-12-31T20:00:00Z',
        local: 'Local de Teste'
      }
    }

    await expect(criarConvite.executar(entrada)).rejects.toThrow(ErroDeAcessoAoNegocio)
  })
})
