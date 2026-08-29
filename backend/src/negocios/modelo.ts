export const papeis = ['PROPRIETARIO', 'ADMINISTRADOR', 'EDITOR', 'OPERADOR', 'ANALISTA', 'FATURACAO'] as const
export type Papel = typeof papeis[number]
export const acoes = ['GERIR_NEGOCIO', 'GERIR_MEMBROS', 'TRANSFERIR_PROPRIEDADE', 'CRIAR_EXPERIENCIA', 'EDITAR_RASCUNHO', 'PUBLICAR_EXPERIENCIA', 'PAUSAR_EXPERIENCIA', 'ARQUIVAR_EXPERIENCIA', 'REVOGAR_ACESSO', 'OPERAR_EVENTO', 'VER_ANALISES', 'GERIR_FATURACAO', 'VER_CONTEUDO_PRIVADO'] as const
export type Acao = typeof acoes[number]
const matriz: Record<Papel, ReadonlySet<Acao>> = {
  PROPRIETARIO: new Set(acoes),
  ADMINISTRADOR: new Set(acoes.filter((a) => a !== 'TRANSFERIR_PROPRIEDADE')),
  EDITOR: new Set(['CRIAR_EXPERIENCIA', 'EDITAR_RASCUNHO', 'PUBLICAR_EXPERIENCIA', 'PAUSAR_EXPERIENCIA', 'ARQUIVAR_EXPERIENCIA', 'REVOGAR_ACESSO', 'VER_CONTEUDO_PRIVADO']),
  OPERADOR: new Set(['OPERAR_EVENTO']), ANALISTA: new Set(['VER_ANALISES']), FATURACAO: new Set(['GERIR_FATURACAO']),
}
export function pode(papel: Papel | null, acao: Acao): boolean { return papel !== null && matriz[papel].has(acao) }
export type Relacao = 'AGENCIA_CLIENTE' | 'PARCEIRO_CLIENTE'
