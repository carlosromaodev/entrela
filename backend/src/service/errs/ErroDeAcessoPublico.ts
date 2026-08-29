export class ErroDeAcessoPublico extends Error {
  readonly codigo = 'MOMENTO_INDISPONIVEL'

  constructor() {
    super('Este Momento não está disponível.')
    this.name = 'ErroDeAcessoPublico'
  }
}
