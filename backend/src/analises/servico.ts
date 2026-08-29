import { z } from 'zod'

import { ErroDeAcessoAoNegocio } from '../service/errs/ErroDeAcessoAoNegocio.js'
import { PoliticaDeAcessoAoNegocio } from '../service/politica-de-acesso-ao-negocio.js'
import { validarEntrada } from '../service/utils/validar-entrada.js'
import type { RepositorioDeAnalisesDeMomentos } from './contratos.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.uuid(), utilizadorId: z.uuid() }),
  momentoId: z.uuid(),
  pontoDeAcessoId: z.uuid().optional(),
})

export class ConsultarEstadoAgregadoDoMomento {
  private readonly politica = new PoliticaDeAcessoAoNegocio()

  constructor(
    private readonly dependencias: Readonly<{
      repositorio: RepositorioDeAnalisesDeMomentos
    }>,
  ) {}

  async executar(entrada: unknown) {
    const comando = validarEntrada(esquema, entrada)
    const [papel, estado] = await Promise.all([
      this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      ),
      this.dependencias.repositorio.obterEstadoAgregado(
        comando.contexto.negocioId,
        comando.momentoId,
        comando.pontoDeAcessoId,
      ),
    ])
    if (
      estado === null ||
      !this.politica.podeExecutar({ acao: 'VER_ANALISES', papel })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }
    return estado
  }
}
