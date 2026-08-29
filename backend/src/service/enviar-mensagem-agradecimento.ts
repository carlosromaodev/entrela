import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  dados: z.strictObject({
    experienciaId: z.string().uuid(),
    participanteId: z.string().uuid(),
    mensagem: z.string().trim().min(1).max(500),
    canal: z.enum(['email', 'sms', 'whatsapp']),
  }),
})

export class EnviarMensagemAgradecimento {
  constructor(private readonly d: any) {}
  async executar(e: unknown) {
    const { contexto, dados } = validarEntrada(esquema, e)
    // Regra: agradecimento só após conclusão do percurso/participação
    const progresso = await this.d.repositorio.obterProgresso(dados.participanteId, dados.experienciaId)
    if (!progresso || !progresso.concluido) throw new Error('Participante ainda não concluiu.')
    return this.d.repositorio.registrarMensagem({
      negocioId: contexto.negocioId,
      experienciaId: dados.experienciaId,
      participanteId: dados.participanteId,
      mensagem: dados.mensagem,
      canal: dados.canal,
      enviadoEm: new Date().toISOString(),
    })
  }
}
