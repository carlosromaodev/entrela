export class ErroDeDireitoInativo extends Error {
  readonly codigo = 'DIREITO_INATIVO'

  constructor(readonly capacidade: string) {
    super(`O negócio não possui um direito activo para ${capacidade}.`)
    this.name = 'ErroDeDireitoInativo'
  }
}
