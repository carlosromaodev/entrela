import { z } from 'zod'

import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquemaDaMudanca = z.strictObject({
  acao: z.enum(['PUBLICAR', 'PAUSAR', 'RETOMAR', 'ARQUIVAR']),
  estadoAtual: z.enum(['RASCUNHO', 'PUBLICADA', 'PAUSADA', 'ARQUIVADA']),
})

type EstadoDaExperiencia = z.output<
  typeof esquemaDaMudanca
>['estadoAtual']
type AcaoSobreExperiencia = z.output<typeof esquemaDaMudanca>['acao']

const transicoes: Readonly<
  Partial<Record<EstadoDaExperiencia, Partial<Record<AcaoSobreExperiencia, EstadoDaExperiencia>>>>
> = {
  PAUSADA: { ARQUIVAR: 'ARQUIVADA', RETOMAR: 'PUBLICADA' },
  PUBLICADA: { ARQUIVAR: 'ARQUIVADA', PAUSAR: 'PAUSADA' },
  RASCUNHO: { ARQUIVAR: 'ARQUIVADA', PUBLICAR: 'PUBLICADA' },
}

export class MudarEstadoDaExperiencia {
  executar(entrada: unknown): Readonly<{
    estadoAnterior: EstadoDaExperiencia
    estadoAtual: EstadoDaExperiencia
  }> {
    const comando = validarEntrada(esquemaDaMudanca, entrada)
    const proximoEstado = transicoes[comando.estadoAtual]?.[comando.acao]

    if (proximoEstado === undefined) {
      throw new ErroDeTransicaoDeEstado(
        comando.estadoAtual,
        comando.acao,
      )
    }

    return {
      estadoAnterior: comando.estadoAtual,
      estadoAtual: proximoEstado,
    }
  }
}
