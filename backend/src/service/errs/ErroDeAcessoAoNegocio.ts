export class ErroDeAcessoAoNegocio extends Error {
  readonly codigo = 'ACESSO_NEGADO'

  constructor() {
    super('O utilizador não pode criar Momentos neste negócio.')
    this.name = 'ErroDeAcessoAoNegocio'
  }
}
