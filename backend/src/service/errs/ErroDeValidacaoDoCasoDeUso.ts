export type CampoInvalido = Readonly<{
  caminho: string
  codigo: string
}>

export class ErroDeValidacaoDoCasoDeUso extends Error {
  readonly codigo = 'VALIDACAO_FALHOU'

  constructor(readonly campos: readonly CampoInvalido[]) {
    super('Os dados informados não são válidos.')
    this.name = 'ErroDeValidacaoDoCasoDeUso'
  }
}
