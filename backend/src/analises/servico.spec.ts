import { describe, expect, it } from 'vitest'

import type { RepositorioDeAnalisesDeMomentos } from './contratos.js'
import { ConsultarEstadoAgregadoDoMomento } from './servico.js'
import { ErroDeAcessoAoNegocio } from '../service/errs/ErroDeAcessoAoNegocio.js'

const negocioId = crypto.randomUUID()
const utilizadorId = crypto.randomUUID()
const momentoId = crypto.randomUUID()

function repositorio(papel: 'PROPRIETARIO' | 'ANALISTA' | 'OPERADOR' | null = 'ANALISTA') {
  const filtros: (string | undefined)[] = []
  const adaptador: RepositorioDeAnalisesDeMomentos = {
    async obterEstadoAgregado(_negocio, _momento, porta) {
      filtros.push(porta)
      return {
        conclusoes: 1,
        primeiraAberturaEm: '2026-08-14T10:00:00.000Z',
        primeiraConclusaoEm: '2026-08-14T10:05:00.000Z',
        origens: [{ aberturas: 2, conclusoes: 1, tipo: 'URL' }],
        sessoesAbertas: 2,
        ultimaAberturaEm: '2026-08-14T11:00:00.000Z',
      }
    },
    async obterPapelDoUtilizador() { return papel },
  }
  return { adaptador, filtros }
}

describe('ConsultarEstadoAgregadoDoMomento', () => {
  it('devolve somente agregados anónimos e permite filtro futuro por porta', async () => {
    const { adaptador, filtros } = repositorio()
    const servico = new ConsultarEstadoAgregadoDoMomento({ repositorio: adaptador })
    const pontoDeAcessoId = crypto.randomUUID()
    const resultado = await servico.executar({
      contexto: { negocioId, utilizadorId }, momentoId, pontoDeAcessoId,
    })
    expect(resultado).toMatchObject({ sessoesAbertas: 2, conclusoes: 1 })
    expect(resultado).not.toHaveProperty('sessaoId')
    expect(resultado).not.toHaveProperty('identificadorAnonimo')
    expect(filtros).toEqual([pontoDeAcessoId])
  })

  it('nega papel operacional sem permissão analítica', async () => {
    const { adaptador } = repositorio('OPERADOR')
    await expect(new ConsultarEstadoAgregadoDoMomento({ repositorio: adaptador }).executar({
      contexto: { negocioId, utilizadorId }, momentoId,
    })).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })
})
