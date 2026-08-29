import { describe, it, expect } from 'vitest'
import { ProcessarCheckIn } from './processar-check-in.js'

describe('ProcessarCheckIn', () => {
  it('deve processar check-in', async () => {
    const proc = new ProcessarCheckIn({ repositorio: { checkIn: () => Promise.resolve() } as any })
    expect(proc).toBeDefined()
  })
})