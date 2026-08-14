import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import type { VerificarSaudeDoBackend } from '../../service/verificar-saude-do-backend.js'
import { criarControladorDaSaude } from '../controllers/consultar-saude.js'
import { esquemaDaRespostaDeSaude } from '../schemas/esquemas-da-saude.js'

type DependenciasDasRotasDeSaude = Readonly<{
  verificarSaudeDoBackend: VerificarSaudeDoBackend
}>

export async function registrarRotasDeSaude(
  aplicacao: FastifyInstance,
  dependencias: DependenciasDasRotasDeSaude,
): Promise<void> {
  const consultarSaude = criarControladorDaSaude(
    dependencias.verificarSaudeDoBackend,
  )

  aplicacao.withTypeProvider<ZodTypeProvider>().get(
    '/saude',
    {
      schema: {
        description:
          'Confirma que o processo HTTP está disponível sem consultar dados privados.',
        response: {
          200: esquemaDaRespostaDeSaude,
        },
        summary: 'Consultar saúde do backend',
        tags: ['Operação'],
      },
    },
    consultarSaude,
  )
}
