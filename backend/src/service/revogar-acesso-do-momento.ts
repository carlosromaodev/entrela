import { z } from 'zod'

import type { TokenPublico } from '../lib/seguranca/token-publico.js'
import type { RepositorioDeRevogacaoDeMomentos } from '../repository/contratos/repositorio-de-revogacao-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeTransicaoDeEstado } from './errs/ErroDeTransicaoDeEstado.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquemaDaEntrada = z.strictObject({
  acao: z.enum(['REVOGAR', 'REGENERAR']),
  contexto: z.strictObject({
    negocioId: z.uuid(),
    utilizadorId: z.uuid(),
  }),
  momentoId: z.uuid(),
})

type DependenciasDoRevogarAcessoDoMomento = Readonly<{
  gerarId: () => string
  politicaDeAcessoAoNegocio?: PoliticaDeAcessoAoNegocio
  repositorio: RepositorioDeRevogacaoDeMomentos
  tokenPublico: TokenPublico
}>

export type ResultadoDaRevogacaoDoMomento = Readonly<{
  acao: 'REVOGAR' | 'REGENERAR'
  momentoId: string
  portas?: readonly Readonly<{ tipo: 'URL' | 'QR'; token: string }>[]
}>

export class RevogarAcessoDoMomento {
  private readonly politicaDeAcessoAoNegocio: PoliticaDeAcessoAoNegocio

  constructor(
    private readonly dependencias: DependenciasDoRevogarAcessoDoMomento,
  ) {
    this.politicaDeAcessoAoNegocio =
      dependencias.politicaDeAcessoAoNegocio ??
      new PoliticaDeAcessoAoNegocio()
  }

  async executar(entrada: unknown): Promise<ResultadoDaRevogacaoDoMomento> {
    const comando = validarEntrada(esquemaDaEntrada, entrada)

    const [papel, experiencia] = await Promise.all([
      this.dependencias.repositorio.obterPapelDoUtilizador(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      ),
      this.dependencias.repositorio.obterExperiencia(
        comando.contexto.negocioId,
        comando.momentoId,
      ),
    ])

    if (
      experiencia === null ||
      !this.politicaDeAcessoAoNegocio.podeExecutar({
        acao: 'REVOGAR_ACESSO',
        papel,
      })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }

    if (experiencia.estado !== 'PUBLICADA' && experiencia.estado !== 'PAUSADA') {
      throw new ErroDeTransicaoDeEstado(experiencia.estado, comando.acao)
    }

    if (comando.acao === 'REVOGAR') {
      await this.dependencias.repositorio.substituirPontosDeAcessoAtomico(
        comando.contexto.negocioId,
        comando.momentoId,
        [],
      )
      return { acao: 'REVOGAR', momentoId: comando.momentoId }
    }

    const versaoId = experiencia.versaoPublicadaId
    if (versaoId === null) {
      throw new ErroDeTransicaoDeEstado(experiencia.estado, comando.acao)
    }

    const portaUrl = this.dependencias.tokenPublico.gerar()
    const portaQr = this.dependencias.tokenPublico.gerar()

    await this.dependencias.repositorio.substituirPontosDeAcessoAtomico(
      comando.contexto.negocioId,
      comando.momentoId,
      [
        {
          canalDeOrigem: 'LINK',
          estado: 'ATIVO',
          hmacDoToken: portaUrl.hmacDoToken,
          id: this.dependencias.gerarId(),
          momentoId: comando.momentoId,
          tipo: 'URL',
          versaoId,
        },
        {
          canalDeOrigem: 'QR',
          estado: 'ATIVO',
          hmacDoToken: portaQr.hmacDoToken,
          id: this.dependencias.gerarId(),
          momentoId: comando.momentoId,
          tipo: 'QR',
          versaoId,
        },
      ],
    )

    return {
      acao: 'REGENERAR',
      momentoId: comando.momentoId,
      portas: [
        { tipo: 'URL', token: portaUrl.token },
        { tipo: 'QR', token: portaQr.token },
      ],
    }
  }
}
