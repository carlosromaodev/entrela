import { z } from 'zod'

import type { CamposEditaveisDoMomento } from '../repository/contratos/repositorio-de-edicao-de-momentos.js'
import type { RepositorioDeEdicaoDeMomentos } from '../repository/contratos/repositorio-de-edicao-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDePublicacaoDoMomento } from './errs/ErroDePublicacaoDoMomento.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'
import { validarEstruturaDasEtapas } from './utils/validar-etapas-do-momento.js'
import { fusoHorarioIanaExiste } from './utils/validar-fuso-horario.js'

const esquemaDaCapa = z.union([
  z.strictObject({
    corHexadecimal: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    tipo: z.literal('COR'),
  }),
  z.strictObject({ ficheiroId: z.uuid(), tipo: z.literal('IMAGEM') }),
])

const esquemaDaAbertura = z.union([
  z.strictObject({
    fusoHorario: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .refine(fusoHorarioIanaExiste, 'Fuso horário IANA inválido.'),
    modo: z.literal('ABRIR_AGORA'),
  }),
  z.strictObject({
    abreEm: z
      .string()
      .trim()
      .min(1)
      .refine((valor) => Number.isFinite(Date.parse(valor)), 'Data inválida.'),
    fusoHorario: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .refine(fusoHorarioIanaExiste, 'Fuso horário IANA inválido.'),
    modo: z.literal('AGENDAR_ABERTURA'),
  }),
])

const esquemaDaEtapa = z.strictObject({
  chave: z.string().trim().min(1).max(80),
  final: z.boolean(),
  media: z
    .strictObject({
      estado: z.enum(['PENDENTE', 'PRONTO', 'FALHOU']),
      ficheiroId: z.uuid(),
      tamanhoEmBytes: z.number().int().positive(),
      tipo: z.enum(['IMAGEM', 'AUDIO', 'VIDEO']),
    })
    .optional(),
  ordem: z.number().int().positive(),
  texto: z.string().max(1_600).optional(),
})

const esquemaDosDadosParaAtualizar = z
  .strictObject({
    abertura: esquemaDaAbertura.optional(),
    capa: esquemaDaCapa.nullable().optional(),
    etapas: z.array(esquemaDaEtapa).min(1).max(6).optional(),
    idioma: z.enum(['pt-AO', 'en']).optional(),
    modeloEditorial: z.enum(['CARTA_INTIMA', 'MEMORIAS', 'CELEBRACAO']).optional(),
    nomeDoDestinatario: z.string().trim().min(1).max(80).optional(),
    titulo: z.string().trim().min(1).max(100).optional(),
  })
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Pelo menos um campo deve ser enviado para actualizar o rascunho.',
  )

const esquemaDaEntrada = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.uuid(),
    utilizadorId: z.uuid(),
  }),
  dados: esquemaDosDadosParaAtualizar,
  momentoId: z.uuid(),
})

type DependenciasDoAtualizarRascunhoDoMomento = Readonly<{
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDeEdicaoDeMomentos
}>

export type ResultadoDaAtualizacaoDoMomento = Readonly<{
  estado: 'RASCUNHO'
  momentoId: string
  versaoId: string
}>

export class AtualizarRascunhoDoMomento {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(
    private readonly dependencias: DependenciasDoAtualizarRascunhoDoMomento,
  ) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<ResultadoDaAtualizacaoDoMomento> {
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
        acao: 'EDITAR_RASCUNHO',
        papel,
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    if (rascunho.estado !== 'RASCUNHO') {
      throw new ErroDeTransicaoDeEstado(rascunho.estado, 'EDITAR_RASCUNHO')
    }

    const etapasNormalizadas = comando.dados.etapas?.map((etapa) => ({
      chave: etapa.chave,
      final: etapa.final,
      ordem: etapa.ordem,
      ...(etapa.media === undefined ? {} : { media: etapa.media }),
      ...(etapa.texto === undefined ? {} : { texto: etapa.texto }),
    }))

    if (etapasNormalizadas !== undefined) {
      const problemas = validarEstruturaDasEtapas(etapasNormalizadas)
      if (problemas.length > 0) throw new ErroDePublicacaoDoMomento(problemas)
    }

    const edicao: CamposEditaveisDoMomento = {
      ...(comando.dados.abertura === undefined
        ? {}
        : { abertura: comando.dados.abertura }),
      ...(comando.dados.capa === undefined ? {} : { capa: comando.dados.capa }),
      ...(etapasNormalizadas === undefined
        ? {}
        : { etapas: etapasNormalizadas }),
      ...(comando.dados.idioma === undefined
        ? {}
        : { idioma: comando.dados.idioma }),
      ...(comando.dados.modeloEditorial === undefined
        ? {}
        : { modeloEditorial: comando.dados.modeloEditorial }),
      ...(comando.dados.nomeDoDestinatario === undefined
        ? {}
        : { nomeDoDestinatario: comando.dados.nomeDoDestinatario }),
      ...(comando.dados.titulo === undefined
        ? {}
        : { titulo: comando.dados.titulo }),
    }
    await this.dependencias.repositorio.atualizarRascunho(
      comando.contexto.negocioId,
      comando.momentoId,
      edicao,
    )

    return {
      estado: 'RASCUNHO',
      momentoId: rascunho.momentoId,
      versaoId: rascunho.versaoId,
    }
  }
}
