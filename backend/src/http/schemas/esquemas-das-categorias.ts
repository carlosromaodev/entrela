import { z } from 'zod'

import { esquemaDosMetadadosHttp } from './esquemas-de-resposta-http.js'

export const esquemaDaCategoria = z.strictObject({
  codigo: z.enum([
    'EMPRESAS',
    'EVENTOS',
    'MOMENTOS',
    'PRESENTES',
    'CONVITES',
    'EXPERIENCIAS',
  ]),
  disponibilidade: z.enum(['EM_IMPLEMENTACAO', 'PLANEADA']),
  nome: z.string().min(1),
  primeiraFatia: z.boolean(),
})

export const esquemaDaRespostaDoCatalogoDeCategorias = z.strictObject({
  dados: z.array(esquemaDaCategoria).length(6),
  metadados: esquemaDosMetadadosHttp,
})
