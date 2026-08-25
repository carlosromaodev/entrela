import { describe, it, expect } from 'vitest'
import { CriarPercursoGPS } from './criar-percurso-gps.js'

describe('CriarPercursoGPS', () => {
  it('deve criar percurso com paragens sequenciais e GPS válido', async () => {
    const repo = {
      criar: async (dados: any) => ({ id: 'perfil-1', ...dados }),
    }
    const criar = new CriarPercursoGPS({ repositorio: repo })
    const res = await criar.executar({
      contexto: { negocioId: '11111111-1111-1111-1111-111111111111', utilizadorId: '22222222-2222-2222-2222-222222222222' },
      dados: {
        experienciaId: '33333333-3333-3333-3333-333333333333',
        nome: 'Percurso Museu',
        idioma: 'pt-AO',
        paragens: [
          { ordem: 1, localId: '44444444-4444-4444-4444-444444444444', latitude: -8.8, longitude: 13.2, raioProximidadeMetros: 50 },
          { ordem: 2, localId: '55555555-5555-5555-5555-555555555555', latitude: -8.81, longitude: 13.21 },
        ],
      },
    })
    expect(res.perfil.nome).toBe('Percurso Museu')
    expect(res.perfil.idioma).toBe('pt-AO')
    expect(res.progressoInicial.paragemAtual).toBe(1)
  })

  it('deve rejeitar ordem não sequencial (RN-EXP-01)', async () => {
    const criar = new CriarPercursoGPS({ repositorio: { criar: () => Promise.resolve() } })
    await expect(criar.executar({
      contexto: { negocioId: '11111111-1111-1111-1111-111111111111', utilizadorId: '22222222-2222-2222-2222-222222222222' },
      dados: {
        experienciaId: '33333333-3333-3333-3333-333333333333',
        nome: 'X',
        idioma: 'pt-AO',
        paragens: [{ ordem: 2, localId: 'a', latitude: 0, longitude: 0 }],
      },
    })).rejects.toThrow()
  })

  it('deve rejeitar coordenadas GPS inválidas', async () => {
    const criar = new CriarPercursoGPS({ repositorio: { criar: () => Promise.resolve() } })
    await expect(criar.executar({
      contexto: { negocioId: '11111111-1111-1111-1111-111111111111', utilizadorId: '22222222-2222-2222-2222-222222222222' },
      dados: {
        experienciaId: '33333333-3333-3333-3333-333333333333',
        nome: 'X',
        idioma: 'en',
        paragens: [{ ordem: 1, localId: 'a', latitude: 95, longitude: 0 }],
      },
    })).rejects.toThrow('Coordenadas GPS inválidas.')
  })
})