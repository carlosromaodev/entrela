import { describe, expect, it } from 'vitest'

import { contaComoAberturaHumana } from './politica-de-metricas.js'

describe('política de métricas honestas', () => {
  it.each([
    ['GET', 'URL', null],
    ['BOT_PREVIEW', 'BOT', null],
    ['EXPERIENCIA_ABERTA', 'PRE_VISUALIZACAO', crypto.randomUUID()],
    ['EXPERIENCIA_ABERTA', 'URL', null],
  ])('não conta %s de origem %s', (tipo, origem, sessaoDeInteracaoId) => {
    expect(contaComoAberturaHumana({ origem, sessaoDeInteracaoId, tipo })).toBe(false)
  })

  it.each(['URL', 'QR'])('conta gesto explícito com origem %s', (origem) => {
    expect(contaComoAberturaHumana({
      origem, sessaoDeInteracaoId: crypto.randomUUID(), tipo: 'EXPERIENCIA_ABERTA',
    })).toBe(true)
  })
})
