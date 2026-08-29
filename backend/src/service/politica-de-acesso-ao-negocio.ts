export const papeisDoNegocio = [
  'PROPRIETARIO',
  'ADMINISTRADOR',
  'EDITOR',
  'OPERADOR',
  'ANALISTA',
  'FATURACAO',
] as const

export type PapelDoNegocio = (typeof papeisDoNegocio)[number]

const acoesConhecidas = [
  'GERIR_NEGOCIO',
  'GERIR_MEMBROS',
  'TRANSFERIR_PROPRIEDADE',
  'CRIAR_EXPERIENCIA',
  'EDITAR_RASCUNHO',
  'PUBLICAR_EXPERIENCIA',
  'PAUSAR_EXPERIENCIA',
  'ARQUIVAR_EXPERIENCIA',
  'REVOGAR_ACESSO',
  'OPERAR_EVENTO',
  'VER_ANALISES',
  'GERIR_FATURACAO',
  'VER_CONTEUDO_PRIVADO',
  'CRIAR_CONVITE',
  'CONFIRMAR_PRESENCA',
] as const

export type AcaoNoNegocio = (typeof acoesConhecidas)[number]

const permissoes: Readonly<Record<PapelDoNegocio, ReadonlySet<AcaoNoNegocio>>> = {
  ADMINISTRADOR: new Set(
    acoesConhecidas.filter((acao) => acao !== 'TRANSFERIR_PROPRIEDADE'),
  ),
  ANALISTA: new Set(['VER_ANALISES']),
  EDITOR: new Set([
    'CRIAR_EXPERIENCIA',
    'EDITAR_RASCUNHO',
    'PUBLICAR_EXPERIENCIA',
    'PAUSAR_EXPERIENCIA',
    'ARQUIVAR_EXPERIENCIA',
    'REVOGAR_ACESSO',
    'VER_CONTEUDO_PRIVADO',
    'CRIAR_CONVITE',
    'CONFIRMAR_PRESENCA',
  ]),
  FATURACAO: new Set(['GERIR_FATURACAO']),
  OPERADOR: new Set(['OPERAR_EVENTO']),
  PROPRIETARIO: new Set(acoesConhecidas),
}

export class PoliticaDeAcessoAoNegocio {
  readonly acoesConhecidas: readonly AcaoNoNegocio[] = acoesConhecidas

  podeExecutar(entrada: Readonly<{
    acao: AcaoNoNegocio
    papel: PapelDoNegocio | null
  }>): boolean {
    if (entrada.papel === null) {
      return false
    }

    return permissoes[entrada.papel].has(entrada.acao)
  }
}
