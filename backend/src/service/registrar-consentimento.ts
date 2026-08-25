import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid() }),
  dados: z.strictObject({
    participanteId: z.string().uuid(),
    finalidade: z.string().min(1),
    versaoPolitica: z.string().min(1),
  }),
})

export class RegistrarConsentimento {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { dados } = validarEntrada(esquema, e)
    return this.d.repositorio.criar({
      sujeito: dados.participanteId,
      finalidade: dados.finalidade,
      versaoPolitica: dados.versaoPolitica,
      concedidoEm: new Date().toISOString(),
    })
  }
}
