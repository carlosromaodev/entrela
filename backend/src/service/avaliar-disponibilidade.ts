import { z } from 'zod'

import { validarEntrada } from './utils/validar-entrada.js'
import { fusoHorarioIanaExiste } from './utils/validar-fuso-horario.js'

const instanteIso = z.iso.datetime({ offset: true })

const esquemaDaAvaliacao = z
  .strictObject({
    estadoDaExperiencia: z.enum([
      'RASCUNHO',
      'PUBLICADA',
      'PAUSADA',
      'ARQUIVADA',
    ]),
    pontoDeAcesso: z.strictObject({
      estado: z.enum(['ATIVO', 'REVOGADO', 'EXPIRADO']),
      iniciaEm: instanteIso.nullable(),
      maximoDeUsos: z.number().int().positive().nullable(),
      terminaEm: instanteIso.nullable(),
      usos: z.number().int().nonnegative(),
    }),
    politica: z.strictObject({
      abreEm: instanteIso.nullable(),
      expiraEm: instanteIso.nullable(),
      fusoHorario: z
        .string()
        .trim()
        .min(1)
        .refine(fusoHorarioIanaExiste, 'Fuso horário IANA inválido.'),
      modo: z.enum(['IMEDIATA', 'JANELA']),
    }),
  })
  .superRefine((entrada, contexto) => {
    if (entrada.politica.modo === 'JANELA' && entrada.politica.abreEm === null) {
      contexto.addIssue({
        code: 'custom',
        message: 'A abertura é obrigatória no modo JANELA.',
        path: ['politica', 'abreEm'],
      })
    }

    if (
      entrada.politica.abreEm !== null &&
      entrada.politica.expiraEm !== null &&
      Date.parse(entrada.politica.expiraEm) <= Date.parse(entrada.politica.abreEm)
    ) {
      contexto.addIssue({
        code: 'custom',
        message: 'A expiração deve ocorrer depois da abertura.',
        path: ['politica', 'expiraEm'],
      })
    }
  })

type DependenciasDaDisponibilidade = Readonly<{
  obterInstanteAtual: () => Date
}>

export type ResultadoDaDisponibilidade =
  | Readonly<{ estadoDaSessao: 'ATIVA' }>
  | Readonly<{ abreEm: string; estadoDaSessao: 'EM_ESPERA' }>
  | Readonly<{ estadoDaSessao: 'EXPIRADA' }>
  | Readonly<{
      estadoDaSessao: 'NEGADA'
      motivo:
        | 'EXPERIENCIA_INDISPONIVEL'
        | 'PONTO_DE_ACESSO_INVALIDO'
        | 'LIMITE_DE_USOS_ATINGIDO'
    }>

export class AvaliarDisponibilidade {
  constructor(private readonly dependencias: DependenciasDaDisponibilidade) {}

  executar(entrada: unknown): ResultadoDaDisponibilidade {
    const comando = validarEntrada(esquemaDaAvaliacao, entrada)
    const agora = this.dependencias.obterInstanteAtual().getTime()

    if (comando.estadoDaExperiencia !== 'PUBLICADA') {
      return {
        estadoDaSessao: 'NEGADA',
        motivo: 'EXPERIENCIA_INDISPONIVEL',
      }
    }

    if (comando.pontoDeAcesso.estado !== 'ATIVO') {
      return {
        estadoDaSessao: 'NEGADA',
        motivo: 'PONTO_DE_ACESSO_INVALIDO',
      }
    }

    if (
      comando.pontoDeAcesso.maximoDeUsos !== null &&
      comando.pontoDeAcesso.usos >= comando.pontoDeAcesso.maximoDeUsos
    ) {
      return {
        estadoDaSessao: 'NEGADA',
        motivo: 'LIMITE_DE_USOS_ATINGIDO',
      }
    }

    const fimDoPonto = comando.pontoDeAcesso.terminaEm
    if (fimDoPonto !== null && agora >= Date.parse(fimDoPonto)) {
      return { estadoDaSessao: 'EXPIRADA' }
    }

    const expiraEm = comando.politica.expiraEm
    if (expiraEm !== null && agora >= Date.parse(expiraEm)) {
      return { estadoDaSessao: 'EXPIRADA' }
    }

    const possiveisAberturas = [
      comando.pontoDeAcesso.iniciaEm,
      comando.politica.abreEm,
    ].filter((valor): valor is string => valor !== null)
    const aberturaEfetiva = possiveisAberturas.sort(
      (primeiro, segundo) => Date.parse(segundo) - Date.parse(primeiro),
    )[0]

    if (aberturaEfetiva !== undefined && agora < Date.parse(aberturaEfetiva)) {
      return {
        abreEm: aberturaEfetiva,
        estadoDaSessao: 'EM_ESPERA',
      }
    }

    return { estadoDaSessao: 'ATIVA' }
  }
}
