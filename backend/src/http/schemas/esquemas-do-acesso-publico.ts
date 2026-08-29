import { z } from 'zod'

import { esquemaDosMetadadosHttp } from './esquemas-de-resposta-http.js'

export const esquemaDoTokenPublico = z.strictObject({
  token: z.string().min(20).max(200),
})

const etapa = z.strictObject({
  chave: z.string(),
  final: z.boolean(),
  ordem: z.number().int().positive(),
  texto: z.string().optional(),
  media: z.unknown().optional(),
})

export const respostaDaResolucaoPublica = z.strictObject({
  dados: z.union([
    z.strictObject({ abreEm: z.string(), estado: z.literal('EM_ESPERA') }),
    z.strictObject({
      capa: z.unknown(),
      estado: z.literal('DISPONIVEL'),
      modeloEditorial: z.string(),
      titulo: z.string(),
    }),
  ]),
  metadados: esquemaDosMetadadosHttp,
})

export const respostaDaAberturaPublica = z.strictObject({
  dados: z.union([
    z.strictObject({ abreEm: z.string(), estado: z.literal('EM_ESPERA') }),
    z.strictObject({ estado: z.literal('ATIVA'), etapa: etapa.optional() }),
  ]),
  metadados: esquemaDosMetadadosHttp,
})

export const corpoDaContinuacaoPublica = z.strictObject({
  chaveDaEtapaAtual: z.string().trim().min(1).max(80),
  chaveDeIdempotencia: z.string().trim().min(16).max(80),
})

export const respostaDaContinuacaoPublica = z.strictObject({
  dados: z.union([
    z.strictObject({ estado: z.literal('CONCLUIDA'), repetida: z.boolean() }),
    z.strictObject({
      estado: z.literal('ATIVA'),
      etapa,
      repetida: z.boolean(),
    }),
  ]),
  metadados: esquemaDosMetadadosHttp,
})
