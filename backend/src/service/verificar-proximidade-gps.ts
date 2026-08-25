import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  dados: z.strictObject({
    perfilId: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number(),
  }),
})

export class VerificarProximidadeGPS {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { contexto, dados } = validarEntrada(esquema, e)
    // RN-EXP-01: só desbloqueia se proximidade real confirmada
    const paragens = await this.d.repositorio.listarParagens(dados.perfilId)
    const atual = paragens.find((p: any) => p.ordem === 1) // simplificado
    if (!atual) throw new Error('Percurso sem paragens.')
    const dist = Math.hypot(dados.latitude - atual.latitude, dados.longitude - atual.longitude)
    if (dist > atual.raioProximidadeMetros / 111320) throw new Error('Fora do raio de proximidade.')
    return { desbloqueado: true, paragem: atual.ordem }
  }
}
