import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  dados: z.strictObject({
    experienciaId: z.string().uuid(),
    tipo: z.enum(['destinatario', 'convidado', 'visitante', 'lead']),
    contactoId: z.string().uuid().optional(),
    utilizadorId: z.string().uuid().optional(),
    atributos: z.record(z.unknown()).optional(),
  }),
})

export class RegistrarParticipante {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { contexto, dados } = validarEntrada(esquema, e)
    // Invariante 4.4: contacto/utilizador opcional, tipo definido
    return this.d.repositorio.criar({
      experienciaId: dados.experienciaId,
      tipo: dados.tipo,
      contactoId: dados.contactoId,
      utilizadorId: dados.utilizadorId,
      atributos: dados.atributos ?? {},
    })
  }
}
