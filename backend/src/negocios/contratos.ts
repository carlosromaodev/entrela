import type { Papel, Relacao } from './modelo.js'
export interface RepositorioDeNegocios {
  papel(negocioId: string, utilizadorId: string): Promise<Papel | null>
  convidar(e: { id: string; negocioId: string; email: string; papel: Exclude<Papel, 'PROPRIETARIO'> }): Promise<void>
  aceitarConviteAtomico(e: { conviteId: string; email: string; membroId: string; utilizadorId: string; agora: Date }): Promise<string | null>
  expirarConvites(agora: Date): Promise<number>
  alterarMembroAtomico(e: { negocioId: string; membroId: string; papel?: Papel; estado?: 'ATIVO' | 'REVOGADO' }): Promise<boolean>
  criarRelacao(e: { id: string; concedenteId: string; beneficiarioId: string; tipo: Relacao }): Promise<void>
  revogarRelacao(id: string, concedenteId: string): Promise<boolean>
}
