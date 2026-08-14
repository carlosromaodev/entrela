import type {
  RascunhoDoMomento,
  RepositorioDeMomentos,
} from '../contratos/repositorio-de-momentos.js'
import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'

function criarChaveDeAutorizacao(
  negocioId: string,
  utilizadorId: string,
): string {
  return `${negocioId}:${utilizadorId}`
}

export class RepositorioDeMomentosEmMemoria
  implements RepositorioDeMomentos
{
  private readonly membros = new Map<string, PapelDoNegocio>()
  private readonly rascunhosGuardados: RascunhoDoMomento[] = []
  quantidadeDeConsultasDeAcesso = 0

  get rascunhos(): readonly RascunhoDoMomento[] {
    return structuredClone(this.rascunhosGuardados)
  }

  autorizarCriacao(negocioId: string, utilizadorId: string): void {
    this.definirPapel(negocioId, utilizadorId, 'EDITOR')
  }

  definirPapel(
    negocioId: string,
    utilizadorId: string,
    papel: PapelDoNegocio,
  ): void {
    this.membros.set(criarChaveDeAutorizacao(negocioId, utilizadorId), papel)
  }

  async criarRascunho(rascunho: RascunhoDoMomento): Promise<void> {
    this.rascunhosGuardados.push(structuredClone(rascunho))
  }

  async obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null> {
    this.quantidadeDeConsultasDeAcesso += 1
    return (
      this.membros.get(criarChaveDeAutorizacao(negocioId, utilizadorId)) ??
      null
    )
  }
}
