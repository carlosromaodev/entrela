const METODOS_HTTP = new Set([
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
])

const CODIGO_SEGURO = /^[A-Z][A-Z0-9_]{0,63}$/
const ID_SEGURO = /^[A-Za-z0-9._:-]{1,128}$/
const ROTA_SEGURA = /^\/[A-Za-z0-9._~{}/:-]{0,255}$/
const TIPO_SEGURO = /^[A-Za-z][A-Za-z0-9]{0,63}$/

type EntradaDoEventoHttp = Readonly<{
  duracaoEmMilissegundos: number
  idDaRequisicao: string
  metodo: string
  rota: string
  statusHttp: number
}>

type EntradaDoEventoDeErroHttp = EntradaDoEventoHttp &
  Readonly<{ erro: unknown }>

export type EventoHttpSeguro = Readonly<{
  duracaoEmMilissegundos: number
  evento: 'REQUISICAO_HTTP_CONCLUIDA'
  idDaRequisicao: string
  metodo: string
  rota: string
  statusHttp: number
}>

export type EventoDeErroHttpSeguro = Omit<EventoHttpSeguro, 'evento'> &
  Readonly<{
    erro: Readonly<{
      codigo: string
      tipo: string
    }>
    evento: 'REQUISICAO_HTTP_FALHOU'
  }>

function validarMetadadosHttp(entrada: EntradaDoEventoHttp): void {
  if (!ID_SEGURO.test(entrada.idDaRequisicao)) {
    throw new TypeError('O identificador da requisição não é seguro para log.')
  }
  if (!METODOS_HTTP.has(entrada.metodo)) {
    throw new TypeError('O método HTTP não é permitido no evento de log.')
  }
  if (!ROTA_SEGURA.test(entrada.rota)) {
    throw new TypeError('A rota deve ser um padrão sem query string ou fragmento.')
  }
  if (
    !Number.isInteger(entrada.statusHttp) ||
    entrada.statusHttp < 100 ||
    entrada.statusHttp > 599
  ) {
    throw new TypeError('O estado HTTP não é válido.')
  }
  if (
    !Number.isFinite(entrada.duracaoEmMilissegundos) ||
    entrada.duracaoEmMilissegundos < 0
  ) {
    throw new TypeError('A duração da requisição não é válida.')
  }
}

function obterCodigoSeguro(erro: unknown): string {
  if (
    typeof erro === 'object' &&
    erro !== null &&
    'codigo' in erro &&
    typeof erro.codigo === 'string' &&
    CODIGO_SEGURO.test(erro.codigo)
  ) {
    return erro.codigo
  }
  return 'ERRO_NAO_CLASSIFICADO'
}

function obterTipoSeguro(erro: unknown): string {
  if (erro instanceof Error && TIPO_SEGURO.test(erro.name)) {
    return erro.name
  }
  return 'ErroDesconhecido'
}

function criarBaseDoEventoHttp(
  entrada: EntradaDoEventoHttp,
): Omit<EventoHttpSeguro, 'evento'> {
  validarMetadadosHttp(entrada)
  return {
    duracaoEmMilissegundos: entrada.duracaoEmMilissegundos,
    idDaRequisicao: entrada.idDaRequisicao,
    metodo: entrada.metodo,
    rota: entrada.rota,
    statusHttp: entrada.statusHttp,
  }
}

export function criarEventoHttpSeguro(
  entrada: EntradaDoEventoHttp,
): EventoHttpSeguro {
  return Object.freeze({
    ...criarBaseDoEventoHttp(entrada),
    evento: 'REQUISICAO_HTTP_CONCLUIDA' as const,
  })
}

export function criarEventoDeErroHttpSeguro(
  entrada: EntradaDoEventoDeErroHttp,
): EventoDeErroHttpSeguro {
  return Object.freeze({
    ...criarBaseDoEventoHttp(entrada),
    erro: Object.freeze({
      codigo: obterCodigoSeguro(entrada.erro),
      tipo: obterTipoSeguro(entrada.erro),
    }),
    evento: 'REQUISICAO_HTTP_FALHOU' as const,
  })
}
