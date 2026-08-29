import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'
import type { RepositorioDeConvites } from '../repository/contratos/repositorio-de-convites.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.string().uuid(), utilizadorId: z.string().uuid() }),
  conviteId: z.string().uuid(),
  dados: z.strictObject({ acompanhantes: z.number().int().min(0).max(10).optional(), respostas: z.record(z.string(), z.string()).optional() })
})

type Dependencias = Readonly<{ repositorio: RepositorioDeConvites; politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio }>

export class ConfirmarPresencaConvite {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(private readonly dependencias: Dependencias) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ?? new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown) {
    const comando = validarEntrada(esquema, entrada)
    const papel = await this.dependencias.repositorio.obterPapelDoUtilizador(comando.contexto.negocioId, comando.contexto.utilizadorId)
    if (!this.politicaDeAcessoAoNegocio.podeExecutar({ acao: 'CONFIRMAR_PRESENCA', papel })) {
      throw new ErroDeAcessoAoNegocio()
    }
    return this.dependencias.repositorio.confirmarPresenca(comando.conviteId, {
      ...(comando.dados.acompanhantes === undefined
        ? {}
        : { acompanhantes: comando.dados.acompanhantes }),
      ...(comando.dados.respostas === undefined
        ? {}
        : { respostas: comando.dados.respostas }),
    })
  }
}
