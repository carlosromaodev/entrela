import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type { PontoDeAcessoPublicado } from '../contratos/repositorio-de-publicacao-de-momentos.js'
import type {
  ExperienciaPublicavel,
  RepositorioDeRevogacaoDeMomentos,
} from '../contratos/repositorio-de-revogacao-de-momentos.js'

type PontoComEstado = Omit<PontoDeAcessoPublicado, 'estado'> &
  Readonly<{ estado: 'ATIVO' | 'REVOGADO' }>

function chaveDeMembro(negocioId: string, utilizadorId: string): string {
  return `${negocioId}:${utilizadorId}`
}

export class RepositorioDeRevogacaoDeMomentosEmMemoria
  implements RepositorioDeRevogacaoDeMomentos
{
  private readonly experiencias = new Map<
    string,
    ExperienciaPublicavel & { negocioId: string }
  >()
  private readonly membros = new Map<string, PapelDoNegocio>()
  private readonly portas = new Map<string, PontoComEstado[]>()

  get portasPorMomento(): ReadonlyMap<string, readonly PontoComEstado[]> {
    return this.portas
  }

  adicionarExperiencia(
    experiencia: ExperienciaPublicavel & { negocioId: string },
  ): void {
    this.experiencias.set(experiencia.momentoId, experiencia)
  }

  adicionarPortaAtiva(porta: PontoDeAcessoPublicado): void {
    const existentes = this.portas.get(porta.momentoId) ?? []
    this.portas.set(porta.momentoId, [...existentes, porta])
  }

  definirPapel(
    negocioId: string,
    utilizadorId: string,
    papel: PapelDoNegocio,
  ): void {
    this.membros.set(chaveDeMembro(negocioId, utilizadorId), papel)
  }

  async criarNovasPortas(
    _negocioId: string,
    portas: readonly PontoDeAcessoPublicado[],
  ): Promise<void> {
    for (const porta of portas) {
      this.adicionarPortaAtiva(porta)
    }
  }

  async obterExperiencia(
    negocioId: string,
    momentoId: string,
  ): Promise<ExperienciaPublicavel | null> {
    const experiencia = this.experiencias.get(momentoId)
    if (experiencia === undefined || experiencia.negocioId !== negocioId) {
      return null
    }

    return experiencia
  }

  async obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null> {
    return this.membros.get(chaveDeMembro(negocioId, utilizadorId)) ?? null
  }

  async revogarPontosAtivos(
    _negocioId: string,
    momentoId: string,
  ): Promise<void> {
    const existentes = this.portas.get(momentoId) ?? []
    this.portas.set(
      momentoId,
      existentes.map((porta) => ({ ...porta, estado: 'REVOGADO' as const })),
    )
  }
}
