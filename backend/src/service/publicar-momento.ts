import { createHash } from 'node:crypto'

import { z } from 'zod'

import type { TokenPublico } from '../lib/seguranca/token-publico.js'
import type {
  RascunhoEditorialDoMomento,
  RepositorioDePublicacaoDeMomentos,
} from '../repository/contratos/repositorio-de-publicacao-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeDireitoInativo } from './errs/ErroDeDireitoInativo.js'
import { ErroDePublicacaoDoMomento } from './errs/ErroDePublicacaoDoMomento.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'
import { validarEstruturaDasEtapas } from './utils/validar-etapas-do-momento.js'
import { fusoHorarioIanaExiste } from './utils/validar-fuso-horario.js'

const esquemaDaEntrada = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.uuid(),
    utilizadorId: z.uuid(),
  }),
  momentoId: z.uuid(),
})

type DependenciasDoPublicarMomento = Readonly<{
  gerarId: () => string
  obterInstanteAtual: () => Date
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDePublicacaoDeMomentos
  tokenPublico: TokenPublico
}>

function validarRascunho(rascunho: RascunhoEditorialDoMomento): string[] {
  const problemas: string[] = [...validarEstruturaDasEtapas(rascunho.etapas)]

  if (rascunho.estado !== 'RASCUNHO') problemas.push('ESTADO_INVALIDO')
  if (rascunho.titulo.trim().length < 1 || rascunho.titulo.length > 100) {
    problemas.push('TITULO_INVALIDO')
  }
  if (rascunho.capa === null) problemas.push('SEM_CAPA')

  let totalDeMedia = 0
  rascunho.etapas.forEach((etapa) => {
    const temTexto = etapa.texto !== undefined && etapa.texto.trim().length > 0
    if (!temTexto && etapa.media === undefined) {
      problemas.push('ETAPA_SEM_CONTEUDO')
    }

    if (etapa.media !== undefined) {
      totalDeMedia += etapa.media.tamanhoEmBytes
      if (etapa.media.estado !== 'PRONTO') problemas.push('MEDIA_NAO_PRONTA')
    }
  })

  if (totalDeMedia > 300 * 1024 * 1024) problemas.push('MEDIA_TOTAL_EXCEDE_LIMITE')
  if (!fusoHorarioIanaExiste(rascunho.abertura.fusoHorario)) {
    problemas.push('FUSO_HORARIO_INVALIDO')
  }
  if (
    rascunho.abertura.modo === 'AGENDAR_ABERTURA' &&
    !Number.isFinite(Date.parse(rascunho.abertura.abreEm))
  ) {
    problemas.push('ABERTURA_INVALIDA')
  }

  return [...new Set(problemas)]
}

function calcularSomaDeVerificacao(
  rascunho: RascunhoEditorialDoMomento,
): string {
  return createHash('sha256').update(JSON.stringify(rascunho)).digest('hex')
}

export class PublicarMomento {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(private readonly dependencias: DependenciasDoPublicarMomento) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<
    Readonly<{
      abreEm: string
      estado: 'PUBLICADA'
      momentoId: string
      portas: readonly Readonly<{ tipo: 'URL' | 'QR'; token: string }>[]
      versaoId: string
    }>
  > {
    const comando = validarEntrada(esquemaDaEntrada, entrada)
    const [papel, rascunho] = await Promise.all([
      this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      ),
      this.dependencias.repositorio.obterRascunho(
        comando.contexto.negocioId,
        comando.momentoId,
      ),
    ])

    if (
      rascunho === null ||
      !this.politicaDeAcessoAoNegocio.podeExecutar({
        acao: 'PUBLICAR_EXPERIENCIA',
        papel,
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    const problemas = validarRascunho(rascunho)
    if (problemas.length > 0) throw new ErroDePublicacaoDoMomento(problemas)

    const possuiDireito = await this.dependencias.repositorio.possuiDireitoAtivo(
      comando.contexto.negocioId,
      'PUBLICAR_MOMENTO',
    )
    if (!possuiDireito) throw new ErroDeDireitoInativo('PUBLICAR_MOMENTO')

    const publicadoEm = this.dependencias.obterInstanteAtual().toISOString()
    const abreEm =
      rascunho.abertura.modo === 'ABRIR_AGORA'
        ? publicadoEm
        : rascunho.abertura.abreEm
    const portaUrl = this.dependencias.tokenPublico.gerar()
    const portaQr = this.dependencias.tokenPublico.gerar()

    await this.dependencias.repositorio.publicarAtomico({
      abreEm,
      estadoDaExperiencia: 'PUBLICADA',
      estadoDaVersao: 'PUBLICADA',
      momentoId: rascunho.momentoId,
      negocioId: comando.contexto.negocioId,
      pontosDeAcesso: [
        {
          canalDeOrigem: 'LINK',
          estado: 'ATIVO',
          hmacDoToken: portaUrl.hmacDoToken,
          id: this.dependencias.gerarId(),
          momentoId: rascunho.momentoId,
          tipo: 'URL',
          versaoId: rascunho.versaoId,
        },
        {
          canalDeOrigem: 'QR',
          estado: 'ATIVO',
          hmacDoToken: portaQr.hmacDoToken,
          id: this.dependencias.gerarId(),
          momentoId: rascunho.momentoId,
          tipo: 'QR',
          versaoId: rascunho.versaoId,
        },
      ],
      publicadoEm,
      somaDeVerificacao: calcularSomaDeVerificacao(rascunho),
      versaoId: rascunho.versaoId,
    })

    return {
      abreEm,
      estado: 'PUBLICADA',
      momentoId: rascunho.momentoId,
      portas: [
        { tipo: 'URL', token: portaUrl.token },
        { tipo: 'QR', token: portaQr.token },
      ],
      versaoId: rascunho.versaoId,
    }
  }
}
