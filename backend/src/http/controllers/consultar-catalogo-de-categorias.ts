import type { FastifyRequest } from 'fastify'

import type { ObterCatalogoDeCategorias } from '../../service/obter-catalogo-de-categorias.js'

export function criarControladorDoCatalogoDeCategorias(
  obterCatalogoDeCategorias: ObterCatalogoDeCategorias,
) {
  return async (requisicao: FastifyRequest) => ({
    dados: [...obterCatalogoDeCategorias.executar()],
    metadados: {
      idDaRequisicao: requisicao.id,
      versaoDaAPI: 'v1' as const,
    },
  })
}
