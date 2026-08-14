import { z } from 'zod'

import { esquemaDosMetadadosHttp } from './esquemas-de-resposta-http.js'

export const esquemaDaRespostaDeSaude = z.object({
  dados: z.object({
    estado: z.literal('SAUDAVEL'),
    instante: z.iso.datetime(),
    servico: z.literal('entrela-backend'),
    versao: z.string(),
  }),
  metadados: esquemaDosMetadadosHttp,
})
