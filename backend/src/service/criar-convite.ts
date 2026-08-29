import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'
import type { Convite, RepositorioDeConvites } from '../repository/contratos/repositorio-de-convites.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'

const esquemaParaCriarConvite = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.string().uuid(),
    utilizadorId: z.string().uuid()
  }),
  dados: z.strictObject({
    experienciaId: z.string().uuid(),
    titulo: z.string().trim().min(1).max(100),
    dataDoEvento: z.string().datetime(),
    local: z.string().trim().min(1).max(200)
  })
})

type DependenciasDoCriarConvite = Readonly<{
  gerarId: () => string
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDeConvites
}>

export type ResultadoDaCriacaoDoConvite = Readonly<{
  estado: 'RASCUNHO'
  conviteId: string
}>

export class CriarConvite {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(private readonly dependencias: DependenciasDoCriarConvite) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<ResultadoDaCriacaoDoConvite> {
    const comando = validarEntrada(esquemaParaCriarConvite, entrada)
    const papel =
      await this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId
      )

    if (
      !this.politicaDeAcessoAoNegocio.podeExecutar({
        acao: 'CRIAR_CONVITE',
        papel
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    const conviteId = this.dependencias.gerarId()
    const convite: Convite = {
      experiencia: {
        id: comando.dados.experienciaId,
        titulo: comando.dados.titulo,
        estado: 'RASCUNHO',
        negocioId: comando.contexto.negocioId
      }
    }

    await this.dependencias.repositorio.criarConvite(convite)

    return {
      estado: 'RASCUNHO',
      conviteId
    }
  }
}
