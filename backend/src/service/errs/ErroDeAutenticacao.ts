export class ErroDeAutenticacao extends Error {
  readonly codigo = 'AUTENTICACAO_NECESSARIA'

  constructor() {
    super('A sessão não é válida ou já expirou.')
    this.name = 'ErroDeAutenticacao'
  }
}
