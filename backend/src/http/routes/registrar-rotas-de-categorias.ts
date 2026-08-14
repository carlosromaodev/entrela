import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import type { ObterCatalogoDeCategorias } from '../../service/obter-catalogo-de-categorias.js'
import { criarControladorDoCatalogoDeCategorias } from '../controllers/consultar-catalogo-de-categorias.js'
import { esquemaDaRespostaDoCatalogoDeCategorias } from '../schemas/esquemas-das-categorias.js'

type DependenciasDasRotasDeCategorias = Readonly<{
  obterCatalogoDeCategorias: ObterCatalogoDeCategorias
}>

export async function registrarRotasDeCategorias(
  aplicacao: FastifyInstance,
  dependencias: DependenciasDasRotasDeCategorias,
): Promise<void> {
  aplicacao.withTypeProvider<ZodTypeProvider>().get(
    '/v1/categorias',
    {
      schema: {
        description:
          'Devolve as submarcas da Entrela e o estado real da implementação de cada uma.',
        response: { 200: esquemaDaRespostaDoCatalogoDeCategorias },
        summary: 'Consultar catálogo de categorias',
        tags: ['Catálogo'],
      },
    },
    criarControladorDoCatalogoDeCategorias(
      dependencias.obterCatalogoDeCategorias,
    ),
  )
}
