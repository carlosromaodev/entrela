import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { RepositorioDeConvites } from '../repository/contratos/repositorio-de-convites.js'
import { ConfirmarPresencaConvite } from './confirmar-presenca-convite.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'

const UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

describe('ConfirmarPresencaConvite', () => {
  let repositorio: RepositorioDeConvites
  let politica: PoliticaDeAcessoAoNegocio
  let confirmar: ConfirmarPresencaConvite

  beforeEach(() => {
    repositorio = {
      criarConvite: vi.fn(),
      obterPapelDoUtilizador: vi.fn().mockResolvedValue('PROPRIETARIO'),
      confirmarPresenca: vi.fn().mockResolvedValue({ estado: 'CONFIRMADO', acompanhantes: 2 })
    } as unknown as RepositorioDeConvites
    politica = new PoliticaDeAcessoAoNegocio()
    confirmar = new ConfirmarPresencaConvite({ repositorio, politicaDeAcessoAoNegocio: politica })
  })

  it('deve confirmar presença com acompanhantes', async () => {
    const entrada = {
      contexto: { negocioId: UUID, utilizadorId: UUID },
      conviteId: UUID,
      dados: { acompanhantes: 2, respostas: { restricaoAlimentar: 'Vegetariano' } }
    }
    const resultado = await confirmar.executar(entrada)
    expect(resultado.estado).toBe('CONFIRMADO')
    expect(repositorio.confirmarPresenca).toHaveBeenCalled()
  })
})
