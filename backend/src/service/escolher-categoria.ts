import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  dados: z.strictObject({ experienciaId: z.string().uuid().optional() }),
})

export class EscolherCategoria {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { contexto, dados } = validarEntrada(esquema, e)
    return this.d.repositorio.executar({ contexto, dados })
  }
}