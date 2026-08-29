import { z } from 'zod'

import { esquemaDosMetadadosHttp } from './esquemas-de-resposta-http.js'

export const esquemaDoCorpoParaCriarMomento = z.strictObject({
  fusoHorario: z.string().trim().min(1).max(64),
  idioma: z.enum(['pt-AO', 'en']),
  nomeDoDestinatario: z.string().trim().min(1).max(80).optional(),
  titulo: z.string().trim().min(1).max(100),
})

export const esquemaDaRespostaDaCriacaoDoMomento = z.strictObject({
  dados: z.strictObject({
    estado: z.literal('RASCUNHO'),
    momentoId: z.uuid(),
    versaoDeRascunhoId: z.uuid(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

export const esquemaDosParametrosDoMomento = z.strictObject({
  momentoId: z.uuid(),
})

export const esquemaDaRespostaDaPublicacaoDoMomento = z.strictObject({
  dados: z.strictObject({
    abreEm: z.string(),
    estado: z.literal('PUBLICADA'),
    momentoId: z.uuid(),
    portas: z.array(
      z.strictObject({
        tipo: z.enum(['URL', 'QR']),
        token: z.string(),
      }),
    ),
    versaoId: z.uuid(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

const esquemaDaCapaDoMomento = z.union([
  z.strictObject({
    corHexadecimal: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    tipo: z.literal('COR'),
  }),
  z.strictObject({ ficheiroId: z.uuid(), tipo: z.literal('IMAGEM') }),
])

const esquemaDaAberturaDoMomento = z.union([
  z.strictObject({
    fusoHorario: z.string().trim().min(1).max(64),
    modo: z.literal('ABRIR_AGORA'),
  }),
  z.strictObject({
    abreEm: z.string().trim().min(1),
    fusoHorario: z.string().trim().min(1).max(64),
    modo: z.literal('AGENDAR_ABERTURA'),
  }),
])

const esquemaDaEtapaDoMomento = z.strictObject({
  chave: z.string().trim().min(1).max(80),
  final: z.boolean(),
  media: z
    .strictObject({
      estado: z.enum(['PENDENTE', 'PRONTO', 'FALHOU']),
      ficheiroId: z.uuid(),
      tamanhoEmBytes: z.number().int().positive(),
      tipo: z.enum(['IMAGEM', 'AUDIO', 'VIDEO']),
    })
    .optional(),
  ordem: z.number().int().positive(),
  texto: z.string().max(1_600).optional(),
})

export const esquemaDoCorpoParaAtualizarMomento = z
  .strictObject({
    abertura: esquemaDaAberturaDoMomento.optional(),
    capa: esquemaDaCapaDoMomento.nullable().optional(),
    etapas: z.array(esquemaDaEtapaDoMomento).min(1).max(6).optional(),
    idioma: z.enum(['pt-AO', 'en']).optional(),
    modeloEditorial: z
      .enum(['CARTA_INTIMA', 'MEMORIAS', 'CELEBRACAO'])
      .optional(),
    nomeDoDestinatario: z.string().trim().min(1).max(80).optional(),
    titulo: z.string().trim().min(1).max(100).optional(),
  })
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Pelo menos um campo deve ser enviado para actualizar o rascunho.',
  )

export const esquemaDaRespostaDaAtualizacaoDoMomento = z.strictObject({
  dados: z.strictObject({
    estado: z.literal('RASCUNHO'),
    momentoId: z.uuid(),
    versaoId: z.uuid(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

export const esquemaDaRespostaDaConsultaDoRascunho = z.strictObject({
  dados: z.strictObject({
    abertura: esquemaDaAberturaDoMomento,
    capa: esquemaDaCapaDoMomento.nullable(),
    estado: z.literal('RASCUNHO'),
    etapas: z.array(esquemaDaEtapaDoMomento).max(6),
    idioma: z.enum(['pt-AO', 'en']),
    modeloEditorial: z.enum(['CARTA_INTIMA', 'MEMORIAS', 'CELEBRACAO']),
    momentoId: z.uuid(),
    nomeDoDestinatario: z.string().min(1).max(80).optional(),
    titulo: z.string().min(1).max(100),
    versaoId: z.uuid(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

export const esquemaDoCorpoParaRevogarAcesso = z.strictObject({
  acao: z.enum(['REVOGAR', 'REGENERAR']),
})

export const esquemaDaRespostaDaRevogacaoDoMomento = z.strictObject({
  dados: z.strictObject({
    acao: z.enum(['REVOGAR', 'REGENERAR']),
    momentoId: z.uuid(),
    portas: z
      .array(
        z.strictObject({
          tipo: z.enum(['URL', 'QR']),
          token: z.string(),
        }),
      )
      .optional(),
  }),
  metadados: esquemaDosMetadadosHttp,
})

export const esquemaDoCorpoDaPreVisualizacao = z.discriminatedUnion('estado', [
  z.strictObject({ estado: z.literal('EM_ESPERA') }),
  z.strictObject({
    estado: z.literal('ATIVA'),
    ordemDaEtapa: z.number().int().min(1).max(6),
  }),
])

export const esquemaDaRespostaDaPreVisualizacao = z.strictObject({
  dados: z.union([
    z.strictObject({
      abreEm: z.string().nullable(),
      capa: esquemaDaCapaDoMomento.nullable(),
      estado: z.literal('EM_ESPERA'),
      modeloEditorial: z.enum(['CARTA_INTIMA', 'MEMORIAS', 'CELEBRACAO']),
      titulo: z.string(),
    }),
    z.strictObject({
      capa: esquemaDaCapaDoMomento.nullable(),
      estado: z.literal('ATIVA'),
      etapa: esquemaDaEtapaDoMomento,
      modeloEditorial: z.enum(['CARTA_INTIMA', 'MEMORIAS', 'CELEBRACAO']),
      titulo: z.string(),
    }),
  ]),
  metadados: esquemaDosMetadadosHttp,
})
