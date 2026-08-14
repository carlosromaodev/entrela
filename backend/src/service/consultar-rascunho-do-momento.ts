import { z } from 'zod'

import type { RepositorioDeConsultaDeMomentos } from '../repository/contratos/repositorio-de-consulta-de-momentos.js'
import type { RascunhoEditorialDoMomento } from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquemaDaEntrada = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.uuid(),
    utilizadorId: z.uuid(),
  }),
  momentoId: z.uuid(),
})

type DependenciasDaConsulta = Readonly<{
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDeConsultaDeMomentos
}>

export type ResultadoDaConsultaDoRascunho = Readonly<
  Pick<
    RascunhoEditorialDoMomento,
    | 'abertura'
    | 'capa'
    | 'etapas'
    | 'idioma'
    | 'modeloEditorial'
    | 'momentoId'
    | 'nomeDoDestinatario'
    | 'titulo'
    | 'versaoId'
  > & { estado: 'RASCUNHO' }
>

export class ConsultarRascunhoDoMomento {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(private readonly dependencias: DependenciasDaConsulta) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<ResultadoDaConsultaDoRascunho> {
    const comando = validarEntrada(esquemaDaEntrada, entrada)
    const [papel, rascunho] = await Promise.all([
      this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      ),
      this.dependencias.repositorio.obterRascunho(
        comando.contexto.negocioId,
        comando.momentoId,
      ),
    ])

    if (
      rascunho === null ||
      !this.politicaDeAcessoAoNegocio.podeExecutar({
        acao: 'VER_CONTEUDO_PRIVADO',
        papel,
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    if (rascunho.estado !== 'RASCUNHO') {
      throw new ErroDeTransicaoDeEstado(rascunho.estado, 'EDITAR_RASCUNHO')
    }

    return {
      abertura: rascunho.abertura,
      capa: rascunho.capa,
      estado: 'RASCUNHO',
      etapas: rascunho.etapas,
      idioma: rascunho.idioma,
      modeloEditorial: rascunho.modeloEditorial,
      momentoId: rascunho.momentoId,
      ...(rascunho.nomeDoDestinatario === undefined
        ? {}
        : { nomeDoDestinatario: rascunho.nomeDoDestinatario }),
      titulo: rascunho.titulo,
      versaoId: rascunho.versaoId,
    }
  }
}
