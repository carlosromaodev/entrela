import { z } from 'zod'

const esquemaDasVariaveisDoProcesso = z.object({
  AMBIENTE: z
    .enum(['desenvolvimento', 'teste', 'producao'])
    .default('desenvolvimento'),
  CHAVE_DE_HMAC: z.string().min(32),
  CHAVE_DE_MEDIA: z.string().min(32),
  CHAVE_DE_SESSAO: z.string().min(32),
  DIRETORIO_DE_MEDIA: z.string().trim().min(1),
  HOSPEDE: z.string().trim().min(1).default('0.0.0.0'),
  NIVEL_DE_LOG: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional(),
  ORIGEM_PUBLICA: z.url(),
  PORTA: z.coerce.number().int().min(1).max(65_535).default(3333),
  URL_DA_BASE_DE_DADOS: z
    .url()
    .refine(
      (valor) =>
        valor.startsWith('postgresql://') || valor.startsWith('postgres://'),
      'Deve usar o protocolo PostgreSQL.',
    ),
  VERSAO_DA_APLICACAO: z.string().trim().min(1).default('0.1.0'),
})

export type Ambiente = 'desenvolvimento' | 'teste' | 'producao'

export type NivelDeLog =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'silent'

export type Configuracao = Readonly<{
  ambiente: Ambiente
  chaveDeHmac: string
  chaveDeMedia: string
  chaveDeSessao: string
  diretorioDeMedia: string
  hospede: string
  nivelDeLog: NivelDeLog
  origemPublica: string
  porta: number
  urlDaBaseDeDados: string
  versaoDaAplicacao: string
}>

export class ErroDeConfiguracao extends Error {
  readonly campos: readonly string[]

  constructor(campos: readonly string[]) {
    super(`Configuração inválida nos campos: ${campos.join(', ')}.`)
    this.name = 'ErroDeConfiguracao'
    this.campos = campos
  }
}

export function carregarConfiguracao(
  variaveis: Readonly<Record<string, string | undefined>> = process.env,
): Configuracao {
  const resultado = esquemaDasVariaveisDoProcesso.safeParse(variaveis)

  if (!resultado.success) {
    const campos = [
      ...new Set(
        resultado.error.issues.map((questao) =>
          String(questao.path[0] ?? 'CONFIGURACAO'),
        ),
      ),
    ].sort()

    throw new ErroDeConfiguracao(campos)
  }

  const variaveisValidadas = resultado.data

  return Object.freeze({
    ambiente: variaveisValidadas.AMBIENTE,
    chaveDeHmac: variaveisValidadas.CHAVE_DE_HMAC,
    chaveDeMedia: variaveisValidadas.CHAVE_DE_MEDIA,
    chaveDeSessao: variaveisValidadas.CHAVE_DE_SESSAO,
    diretorioDeMedia: variaveisValidadas.DIRETORIO_DE_MEDIA,
    hospede: variaveisValidadas.HOSPEDE,
    nivelDeLog:
      variaveisValidadas.NIVEL_DE_LOG ??
      (variaveisValidadas.AMBIENTE === 'teste' ? 'silent' : 'info'),
    origemPublica: variaveisValidadas.ORIGEM_PUBLICA,
    porta: variaveisValidadas.PORTA,
    urlDaBaseDeDados: variaveisValidadas.URL_DA_BASE_DE_DADOS,
    versaoDaAplicacao: variaveisValidadas.VERSAO_DA_APLICACAO,
  })
}
