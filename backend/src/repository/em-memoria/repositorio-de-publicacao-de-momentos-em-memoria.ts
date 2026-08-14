import type {
  PublicacaoDoMomento,
  RascunhoEditorialDoMomento,
  RepositorioDePublicacaoDeMomentos,
} from '../contratos/repositorio-de-publicacao-de-momentos.js'
import type {
  CamposEditaveisDoMomento,
  RepositorioDeEdicaoDeMomentos,
} from '../contratos/repositorio-de-edicao-de-momentos.js'
import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'
import type { RepositorioDeConsultaDeMomentos } from '../contratos/repositorio-de-consulta-de-momentos.js'

function chaveDeMembro(negocioId: string, utilizadorId: string): string {
  return `${negocioId}:${utilizadorId}`
}

function chaveDeDireito(negocioId: string, capacidade: string): string {
  return `${negocioId}:${capacidade}`
}

export class RepositorioDePublicacaoDeMomentosEmMemoria
  implements
    RepositorioDeConsultaDeMomentos,
    RepositorioDePublicacaoDeMomentos,
    RepositorioDeEdicaoDeMomentos
{
  private readonly direitos = new Set<string>()
  private readonly membros = new Map<string, PapelDoNegocio>()
  private readonly publicacoesGuardadas: PublicacaoDoMomento[] = []
  private readonly rascunhos = new Map<string, RascunhoEditorialDoMomento>()

  get publicacoes(): readonly PublicacaoDoMomento[] {
    return structuredClone(this.publicacoesGuardadas)
  }

  adicionarRascunho(rascunho: RascunhoEditorialDoMomento): void {
    this.rascunhos.set(rascunho.momentoId, structuredClone(rascunho))
  }

  concederDireito(
    negocioId: string,
    capacidade: 'PUBLICAR_MOMENTO',
  ): void {
    this.direitos.add(chaveDeDireito(negocioId, capacidade))
  }

  definirPapel(
    negocioId: string,
    utilizadorId: string,
    papel: PapelDoNegocio,
  ): void {
    this.membros.set(chaveDeMembro(negocioId, utilizadorId), papel)
  }

  async obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null> {
    return this.membros.get(chaveDeMembro(negocioId, utilizadorId)) ?? null
  }

  async obterRascunho(
    negocioId: string,
    momentoId: string,
  ): Promise<RascunhoEditorialDoMomento | null> {
    const rascunho = this.rascunhos.get(momentoId)
    if (rascunho === undefined || rascunho.negocioId !== negocioId) {
      return null
    }

    return structuredClone(rascunho)
  }

  async possuiDireitoAtivo(
    negocioId: string,
    capacidade: 'PUBLICAR_MOMENTO',
  ): Promise<boolean> {
    return this.direitos.has(chaveDeDireito(negocioId, capacidade))
  }

  async publicarAtomico(publicacao: PublicacaoDoMomento): Promise<void> {
    const rascunho = this.rascunhos.get(publicacao.momentoId)
    if (rascunho === undefined || rascunho.estado !== 'RASCUNHO') {
      throw new Error('CONFLITO_DE_PUBLICACAO')
    }

    this.rascunhos.set(publicacao.momentoId, {
      ...rascunho,
      estado: 'PUBLICADA',
    })
    this.publicacoesGuardadas.push(structuredClone(publicacao))
  }

  async atualizarRascunho(
    negocioId: string,
    momentoId: string,
    edicao: CamposEditaveisDoMomento,
  ): Promise<void> {
    const rascunho = this.rascunhos.get(momentoId)
    if (rascunho === undefined || rascunho.negocioId !== negocioId) {
      throw new Error('RASCUNHO_INEXISTENTE')
    }

    this.rascunhos.set(momentoId, {
      ...rascunho,
      ...structuredClone(edicao),
    })
  }
}
