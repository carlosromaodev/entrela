export class ErroDeContinuacaoDoMomento extends Error {
  readonly codigo = 'CONTINUACAO_INVALIDA'

  constructor() {
    super('Não foi possível continuar a partir desta etapa.')
    this.name = 'ErroDeContinuacaoDoMomento'
  }
}
