export class ErroDeRestauracaoIndisponivel extends Error {
  readonly codigo = 'RESTAURACAO_INDISPONIVEL'

  constructor() {
    super('Não existe nenhum ponto de restauro disponível para este Momento.')
    this.name = 'ErroDeRestauracaoIndisponivel'
  }
}
