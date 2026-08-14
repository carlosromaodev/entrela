export class ErroDeTransicaoDeEstado extends Error {
  readonly codigo = 'TRANSICAO_DE_ESTADO_INVALIDA'

  constructor(
    readonly estadoAtual: string,
    readonly acao: string,
  ) {
    super(`A acção ${acao} não é permitida no estado ${estadoAtual}.`)
    this.name = 'ErroDeTransicaoDeEstado'
  }
}
