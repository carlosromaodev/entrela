import { z } from 'zod'

import type {
  RascunhoDoMomento,
  RepositorioDeMomentos,
} from '../repository/contratos/repositorio-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'
import { fusoHorarioIanaExiste } from './utils/validar-fuso-horario.js'

const esquemaParaCriarMomento = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.uuid(),
    utilizadorId: z.uuid(),
  }),
  dados: z.strictObject({
    fusoHorario: z
      .string()
      .trim()
      .min(1)
      .refine(fusoHorarioIanaExiste, 'Fuso horário IANA inválido.'),
    idioma: z.enum(['pt-AO', 'en']),
    nomeDoDestinatario: z.string().trim().min(1).max(80).optional(),
    titulo: z.string().trim().min(1).max(100),
  }),
})

type DependenciasDoCriarMomento = Readonly<{
  gerarId: () => string
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDeMomentos
}>

export type ResultadoDaCriacaoDoMomento = Readonly<{
  estado: 'RASCUNHO'
  momentoId: string
  versaoDeRascunhoId: string
}>

export class CriarMomento {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(private readonly dependencias: DependenciasDoCriarMomento) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<ResultadoDaCriacaoDoMomento> {
    const comando = validarEntrada(esquemaParaCriarMomento, entrada)
    const papel =
      await this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      )

    if (
      !this.politicaDeAcessoAoNegocio.podeExecutar({
        acao: 'CRIAR_EXPERIENCIA',
        papel,
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    const momentoId = this.dependencias.gerarId()
    const versaoDeRascunhoId = this.dependencias.gerarId()
    const rascunho: RascunhoDoMomento = {
      conteudo: {
        idioma: comando.dados.idioma,
        ...(comando.dados.nomeDoDestinatario === undefined
          ? {}
          : { nomeDoDestinatario: comando.dados.nomeDoDestinatario }),
        titulo: comando.dados.titulo,
      },
      experiencia: {
        categoria: 'MOMENTOS',
        criadoPorUtilizadorId: comando.contexto.utilizadorId,
        estado: 'RASCUNHO',
        fusoHorario: comando.dados.fusoHorario,
        id: momentoId,
        idiomaPredefinido: comando.dados.idioma,
        negocioId: comando.contexto.negocioId,
        versaoDeRascunhoAtualId: versaoDeRascunhoId,
        versaoPublicadaId: null,
      },
      versao: {
        criadoPorUtilizadorId: comando.contexto.utilizadorId,
        estado: 'RASCUNHO',
        experienciaId: momentoId,
        id: versaoDeRascunhoId,
        numero: 1,
      },
    }

    await this.dependencias.repositorio.criarRascunho(rascunho)

    return {
      estado: 'RASCUNHO',
      momentoId,
      versaoDeRascunhoId,
    }
  }
}
