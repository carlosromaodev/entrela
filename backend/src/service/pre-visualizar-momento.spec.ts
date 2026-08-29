import { describe, expect, it } from 'vitest'

import { RepositorioDePublicacaoDeMomentosEmMemoria } from '../repository/em-memoria/repositorio-de-publicacao-de-momentos-em-memoria.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { PreVisualizarMomento } from './pre-visualizar-momento.js'

const negocioId = '0198f9a0-8b75-7000-8000-000000000001'
const utilizadorId = '0198f9a0-8b75-7000-8000-000000000002'
const momentoId = '0198f9a0-8b75-7000-8000-000000000003'

function preparar(negocioDoMomento = negocioId) {
  const repositorio = new RepositorioDePublicacaoDeMomentosEmMemoria()
  repositorio.definirPapel(negocioId, utilizadorId, 'EDITOR')
  repositorio.adicionarRascunho({
    abertura: { abreEm: '2026-12-24T20:00:00Z', fusoHorario: 'Africa/Luanda', modo: 'AGENDAR_ABERTURA' },
    capa: { corHexadecimal: '#654321', tipo: 'COR' }, estado: 'RASCUNHO',
    etapas: [
      { chave: 'inicio', final: false, ordem: 1, texto: 'Primeira' },
      { chave: 'fim', final: true, ordem: 2, texto: 'Segunda' },
    ],
    idioma: 'pt-AO', modeloEditorial: 'CARTA_INTIMA', momentoId,
    negocioId: negocioDoMomento, titulo: 'Prévia privada',
    versaoId: '0198f9a0-8b75-7000-8000-000000000004',
  })
  return new PreVisualizarMomento({ repositorio })
}

describe('PreVisualizarMomento', () => {
  it('simula espera sem criar sessão nem ocultar o relógio configurado do criador', async () => {
    const resultado = await preparar().executar({
      contexto: { negocioId, utilizadorId }, momentoId,
      simulacao: { estado: 'EM_ESPERA' },
    })
    expect(resultado).toMatchObject({
      abreEm: '2026-12-24T20:00:00Z', estado: 'EM_ESPERA', titulo: 'Prévia privada',
    })
  })

  it('projecta somente a etapa explicitamente simulada', async () => {
    const resultado = await preparar().executar({
      contexto: { negocioId, utilizadorId }, momentoId,
      simulacao: { estado: 'ATIVA', ordemDaEtapa: 2 },
    })
    expect(resultado).toMatchObject({ estado: 'ATIVA', etapa: { chave: 'fim', ordem: 2 } })
    expect(resultado).not.toHaveProperty('etapas')
  })

  it('não lê conteúdo de outro negócio', async () => {
    await expect(preparar('0198f9a0-8b75-7000-8000-000000000099').executar({
      contexto: { negocioId, utilizadorId }, momentoId,
      simulacao: { estado: 'ATIVA', ordemDaEtapa: 1 },
    })).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })
})
