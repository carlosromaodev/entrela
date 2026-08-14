import { z } from 'zod'

import { ErroDeValidacaoDoCasoDeUso } from '../errs/ErroDeValidacaoDoCasoDeUso.js'

export function validarEntrada<Esquema extends z.ZodType>(
  esquema: Esquema,
  entrada: unknown,
): z.output<Esquema> {
  const resultado = esquema.safeParse(entrada)

  if (!resultado.success) {
    throw new ErroDeValidacaoDoCasoDeUso(
      resultado.error.issues.map((questao) => ({
        caminho: questao.path.join('.'),
        codigo: questao.code,
      })),
    )
  }

  return resultado.data
}
