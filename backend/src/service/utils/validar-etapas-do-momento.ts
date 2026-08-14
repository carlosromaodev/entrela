import type { EtapaDoMomento } from '../../repository/contratos/repositorio-de-publicacao-de-momentos.js'

const limitePorTipoDeMedia = {
  AUDIO: 20 * 1024 * 1024,
  IMAGEM: 10 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
} as const

/**
 * Valida apenas a estrutura das etapas (ordem, chaves, limites de formato e
 * revelação final): regras que se aplicam tanto ao guardar um rascunho como
 * ao publicá-lo. Não valida completude de conteúdo nem estado de media —
 * isso é responsabilidade exclusiva da publicação (RN-MOM-02).
 */
export function validarEstruturaDasEtapas(
  etapas: readonly EtapaDoMomento[],
): string[] {
  const problemas: string[] = []

  if (etapas.length < 1 || etapas.length > 6) {
    problemas.push('QUANTIDADE_DE_ETAPAS_INVALIDA')
  }

  const chavesVistas = new Set<string>()
  etapas.forEach((etapa, indice) => {
    if (etapa.ordem !== indice + 1) problemas.push('ORDEM_DE_ETAPAS_INVALIDA')
    if (etapa.chave.trim().length === 0) {
      problemas.push('CHAVE_DE_ETAPA_INVALIDA')
    } else if (chavesVistas.has(etapa.chave)) {
      problemas.push('CHAVE_DE_ETAPA_DUPLICADA')
    }
    chavesVistas.add(etapa.chave)

    if (etapa.texto !== undefined && etapa.texto.length > 1_600) {
      problemas.push('TEXTO_DA_ETAPA_EXCEDE_LIMITE')
    }

    if (etapa.media !== undefined) {
      const limite = limitePorTipoDeMedia[etapa.media.tipo]
      if (etapa.media.tamanhoEmBytes <= 0 || etapa.media.tamanhoEmBytes > limite) {
        problemas.push('MEDIA_EXCEDE_LIMITE')
      }
    }
  })

  const etapasFinais = etapas.filter(({ final }) => final)
  if (etapasFinais.length !== 1 || etapas.at(-1)?.final !== true) {
    problemas.push('REVELACAO_FINAL_INVALIDA')
  }

  return [...new Set(problemas)]
}
