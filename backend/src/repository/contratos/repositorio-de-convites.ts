import type { PapelDoNegocio } from '../../service/politica-de-acesso-ao-negocio.js'

export interface RepositorioDeConvites {
  criarConvite(convite: Convite): Promise<void>
  confirmarPresenca(
    conviteId: string,
    dados: Readonly<{ acompanhantes?: number; respostas?: Readonly<Record<string, string>> }>,
  ): Promise<Readonly<{ estado: 'CONFIRMADO'; acompanhantes: number }>>
  obterPapelDoUtilizador(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>
}

// Defina o tipo Convite conforme necessário
export type Convite = Readonly<{
  experiencia: Readonly<{
    id: string
    titulo: string
    estado: 'RASCUNHO' | 'PUBLICADA' | 'PAUSADA' | 'ARQUIVADA'
    negocioId: string
  }>
}>
