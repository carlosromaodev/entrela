export class ErroDePublicacaoDoMomento extends Error {
  readonly codigo = 'MOMENTO_NAO_PUBLICAVEL'

  constructor(readonly problemas: readonly string[]) {
    super('O Momento ainda não cumpre os critérios de publicação.')
    this.name = 'ErroDePublicacaoDoMomento'
  }
}
