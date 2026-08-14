import { z } from 'zod'

export const esquemaDosMetadadosHttp = z.object({
  idDaRequisicao: z.uuid(),
  versaoDaAPI: z.literal('v1'),
})

export const esquemaDoErroHttp = z.object({
  erro: z.object({
    campos: z
      .array(
        z.object({
          caminho: z.string(),
          codigo: z.string(),
        }),
      )
      .optional(),
    codigo: z.string(),
    idDaRequisicao: z.uuid(),
    mensagem: z.string(),
  }),
})
