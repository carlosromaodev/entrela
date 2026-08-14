import { z } from 'zod'

import { ErroDeValidacaoDoCasoDeUso } from './errs/ErroDeValidacaoDoCasoDeUso.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquemaDoValor = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.null(),
])
type Valor = z.output<typeof esquemaDoValor>
const esquemaDoValorDoFacto = z.union([
  esquemaDoValor,
  z.array(esquemaDoValor).max(100),
])
type ValorDoFacto = z.output<typeof esquemaDoValorDoFacto>

const esquemaDoFacto = z.enum([
  'agora',
  'disponibilidade.estaAberta',
  'sessao.segundosDeVida',
  'evento.tipo',
  'evento.chaveDoBloco',
  'evento.tipoDePontoDeAcesso',
  'sessao.estado',
  'sessao.idioma',
  'sessao.blocosDesbloqueados',
  'participante.tipo',
  'participante.segmento',
  'pagamento.estado',
  'pedido.tipo',
  'direito.ativo',
  'pontoDeAcesso.tipo',
  'pontoDeAcesso.tipoDeAncora',
  'pontoDeAcesso.canalDeOrigem',
])

const esquemaDoOperador = z.enum([
  'IGUAL',
  'DIFERENTE',
  'ESTA_EM',
  'EXISTE',
  'MAIOR_QUE',
  'MAIOR_OU_IGUAL',
  'MENOR_QUE',
  'MENOR_OU_IGUAL',
  'FOI_RESPONDIDA',
  'CONTEM',
])

type Condicao =
  | Readonly<{
      facto: z.output<typeof esquemaDoFacto>
      operador: z.output<typeof esquemaDoOperador>
      valor?: Valor | readonly Valor[] | undefined
    }>
  | Readonly<{ todas: readonly Condicao[] }>
  | Readonly<{ qualquer: readonly Condicao[] }>
  | Readonly<{ nao: Condicao }>

const esquemaDaCondicao: z.ZodType<Condicao> = z.lazy(() =>
  z.union([
    z.strictObject({
      facto: esquemaDoFacto,
      operador: esquemaDoOperador,
      valor: z.union([esquemaDoValor, z.array(esquemaDoValor).max(50)]).optional(),
    }),
    z.strictObject({ todas: z.array(esquemaDaCondicao).min(1).max(50) }),
    z.strictObject({ qualquer: z.array(esquemaDaCondicao).min(1).max(50) }),
    z.strictObject({ nao: esquemaDaCondicao }),
  ]),
)

const esquemaDaAcao = z.discriminatedUnion('tipo', [
  z.strictObject({
    chaveDoBloco: z.string().trim().min(1).max(100),
    tipo: z.literal('DESBLOQUEAR_BLOCO'),
  }),
  z.strictObject({
    chaveDoBloco: z.string().trim().min(1).max(100),
    tipo: z.literal('BLOQUEAR_BLOCO'),
  }),
  z.strictObject({
    chave: z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/),
    tipo: z.literal('DEFINIR_VARIAVEL'),
    valor: esquemaDoValor,
  }),
  z.strictObject({
    chaveDoNo: z.string().trim().min(1).max(100),
    tipo: z.literal('MARCAR_NO_COMO_CONCLUIDO'),
  }),
  z.strictObject({ tipo: z.literal('MARCAR_EXPERIENCIA_COMO_CONCLUIDA') }),
  z.strictObject({
    chaveDoEvento: z.string().regex(/^[A-Z][A-Z0-9_]{0,79}$/),
    tipo: z.literal('EMITIR_EVENTO_INTERNO'),
  }),
  z.strictObject({
    capacidade: z.string().regex(/^[A-Z][A-Z0-9_]{0,79}$/),
    tipo: z.literal('CONCEDER_DIREITO'),
  }),
  z.strictObject({
    modelo: z.string().trim().min(1).max(100),
    tipo: z.literal('EMITIR_CERTIFICADO'),
  }),
  z.strictObject({
    campanhaId: z.uuid(),
    tipo: z.literal('CRIAR_CUPAO'),
  }),
])

type Acao = z.output<typeof esquemaDaAcao>
const esquemaDoTipoDeAcao = z.enum([
  'DESBLOQUEAR_BLOCO',
  'BLOQUEAR_BLOCO',
  'DEFINIR_VARIAVEL',
  'MARCAR_NO_COMO_CONCLUIDO',
  'MARCAR_EXPERIENCIA_COMO_CONCLUIDA',
  'EMITIR_EVENTO_INTERNO',
  'CONCEDER_DIREITO',
  'EMITIR_CERTIFICADO',
  'CRIAR_CUPAO',
])

const esquemaDaRegra = z.strictObject({
  acoes: z.array(esquemaDaAcao).min(1).max(20),
  chave: z.string().regex(/^[a-z][a-z0-9-]{0,99}$/),
  condicao: esquemaDaCondicao,
  escopo: z.enum(['SESSAO', 'PARTICIPANTE', 'EXPERIENCIA']),
  estado: z.enum(['ATIVA', 'INATIVA']),
  gatilho: z.enum([
    'PONTO_DE_ACESSO_RESOLVIDO',
    'EXPERIENCIA_ABERTA',
    'BLOCO_CONTINUADO',
    'FORMULARIO_SUBMETIDO',
    'RESPOSTA_DE_PRESENCA_ATUALIZADA',
    'PAGAMENTO_CONFIRMADO',
    'ENTRADA_ACEITE',
    'HORA_DO_SISTEMA_ATINGIDA',
  ]),
  prioridade: z.number().int().min(0).max(10_000),
})

const esquemaDaEntrada = z.strictObject({
  acoesPermitidas: z.array(esquemaDoTipoDeAcao).min(1),
  evento: z.strictObject({
    chave: z.string().trim().min(1).max(150),
    gatilho: esquemaDaRegra.shape.gatilho,
  }),
  execucoesAnteriores: z.array(z.string().trim().min(1).max(400)),
  factos: z.partialRecord(esquemaDoFacto, esquemaDoValorDoFacto),
  chaveDoEscopo: z.string().trim().min(1).max(150),
  regras: z.array(esquemaDaRegra).max(500),
})

function valoresIguais(primeiro: unknown, segundo: unknown): boolean {
  return JSON.stringify(primeiro) === JSON.stringify(segundo)
}

function avaliarCondicao(
  condicao: Condicao,
  factos: Partial<Record<z.output<typeof esquemaDoFacto>, ValorDoFacto>>,
): boolean {
  if ('todas' in condicao) {
    return condicao.todas.every((item) => avaliarCondicao(item, factos))
  }

  if ('qualquer' in condicao) {
    return condicao.qualquer.some((item) => avaliarCondicao(item, factos))
  }

  if ('nao' in condicao) {
    return !avaliarCondicao(condicao.nao, factos)
  }

  const actual = factos[condicao.facto]
  const esperado = condicao.valor

  switch (condicao.operador) {
    case 'IGUAL':
      return valoresIguais(actual, esperado)
    case 'DIFERENTE':
      return !valoresIguais(actual, esperado)
    case 'ESTA_EM':
      return Array.isArray(esperado) && esperado.some((item) => valoresIguais(actual, item))
    case 'EXISTE':
      return actual !== undefined && actual !== null
    case 'MAIOR_QUE':
      return typeof actual === 'number' && typeof esperado === 'number' && actual > esperado
    case 'MAIOR_OU_IGUAL':
      return typeof actual === 'number' && typeof esperado === 'number' && actual >= esperado
    case 'MENOR_QUE':
      return typeof actual === 'number' && typeof esperado === 'number' && actual < esperado
    case 'MENOR_OU_IGUAL':
      return typeof actual === 'number' && typeof esperado === 'number' && actual <= esperado
    case 'FOI_RESPONDIDA':
      return actual !== undefined && actual !== null && actual !== ''
    case 'CONTEM':
      return (
        (typeof actual === 'string' &&
          typeof esperado === 'string' &&
          actual.includes(esperado)) ||
        (Array.isArray(actual) && actual.some((item) => valoresIguais(item, esperado)))
      )
  }
}

export type EfeitoDeRegra = Readonly<{
  chaveDaExecucao: string
  chaveDaRegra: string
  efeito: Acao
}>

export class AvaliarRegras {
  executar(entrada: unknown): Readonly<{ acoes: readonly EfeitoDeRegra[] }> {
    const comando = validarEntrada(esquemaDaEntrada, entrada)
    const permitidas = new Set(comando.acoesPermitidas)
    const execucoesAnteriores = new Set(comando.execucoesAnteriores)
    const acoes: EfeitoDeRegra[] = []

    comando.regras.forEach((regra, indiceDaRegra) => {
      for (const [indiceDaAcao, acao] of regra.acoes.entries()) {
        if (!permitidas.has(acao.tipo)) {
          throw new ErroDeValidacaoDoCasoDeUso([
            {
              caminho: `regras.${indiceDaRegra}.acoes.${indiceDaAcao}.tipo`,
              codigo: 'acao_nao_permitida_pelo_manifesto',
            },
          ])
        }
      }
    })

    const regrasOrdenadas = comando.regras.toSorted(
      (primeira, segunda) =>
        primeira.prioridade - segunda.prioridade ||
        primeira.chave.localeCompare(segunda.chave),
    )

    for (const regra of regrasOrdenadas) {
      if (regra.estado !== 'ATIVA' || regra.gatilho !== comando.evento.gatilho) {
        continue
      }

      const chaveDaExecucao = `${regra.chave}:${comando.evento.chave}:${comando.chaveDoEscopo}`
      if (
        execucoesAnteriores.has(chaveDaExecucao) ||
        !avaliarCondicao(regra.condicao, comando.factos)
      ) {
        continue
      }

      for (const efeito of regra.acoes) {
        acoes.push({ chaveDaExecucao, chaveDaRegra: regra.chave, efeito })
      }
    }

    return { acoes }
  }
}
