export type ResultadoDaSaudeDoBackend = Readonly<{
  estado: 'SAUDAVEL'
  instante: string
  servico: 'entrela-backend'
  versao: string
}>

type DependenciasDaVerificacaoDeSaude = Readonly<{
  obterInstanteAtual: () => Date
  versaoDaAplicacao: string
}>

export class VerificarSaudeDoBackend {
  constructor(
    private readonly dependencias: DependenciasDaVerificacaoDeSaude,
  ) {}

  executar(): ResultadoDaSaudeDoBackend {
    return {
      estado: 'SAUDAVEL',
      instante: this.dependencias.obterInstanteAtual().toISOString(),
      servico: 'entrela-backend',
      versao: this.dependencias.versaoDaAplicacao,
    }
  }
}
