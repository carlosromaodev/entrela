import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  dados: z.strictObject({
    conviteId: z.string().uuid(),
    participanteId: z.string().uuid(),
    tipoLembrete: z.enum(['7_dias', '1_dia', 'manual']),
    canal: z.enum(['email', 'sms', 'whatsapp']),
  }),
})

export class EnviarLembreteConvite {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { contexto, dados } = validarEntrada(esquema, e)
    const convite = await this.d.repositorio.obterConvite(dados.conviteId)
    if (!convite || convite.negocioId !== contexto.negocioId) throw new Error('Convite inválido.')
    return this.d.repositorio.registrarLembrete({
      conviteId: dados.conviteId,
      participanteId: dados.participanteId,
      tipoLembrete: dados.tipoLembrete,
      canal: dados.canal,
      enviadoEm: new Date().toISOString(),
    })
  }
}