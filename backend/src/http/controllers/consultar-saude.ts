import type { FastifyRequest } from 'fastify'

import type { VerificarSaudeDoBackend } from '../../service/verificar-saude-do-backend.js'

export function criarControladorDaSaude(
  verificarSaudeDoBackend: VerificarSaudeDoBackend,
) {
  return async (requisicao: FastifyRequest) => ({
    dados: verificarSaudeDoBackend.executar(),
    metadados: {
      idDaRequisicao: requisicao.id,
      versaoDaAPI: 'v1' as const,
    },
  })
}
