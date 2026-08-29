export const EVENTO_DE_ABERTURA_HUMANA = 'EXPERIENCIA_ABERTA'
export const EVENTO_DE_CONCLUSAO = 'EXPERIENCIA_CONCLUIDA'
export const ORIGENS_HUMANAS = ['URL', 'QR'] as const

export function contaComoAberturaHumana(evento: Readonly<{
  origem: string
  sessaoDeInteracaoId: string | null
  tipo: string
}>): boolean {
  return (
    evento.tipo === EVENTO_DE_ABERTURA_HUMANA &&
    evento.sessaoDeInteracaoId !== null &&
    ORIGENS_HUMANAS.some((origem) => origem === evento.origem)
  )
}
