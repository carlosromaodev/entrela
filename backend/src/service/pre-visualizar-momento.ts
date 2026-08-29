import { z } from 'zod'

import type { RepositorioDeConsultaDeMomentos } from '../repository/contratos/repositorio-de-consulta-de-momentos.js'
import { ErroDeAcessoAoNegocio } from './errs/ErroDeAcessoAoNegocio.js'
import { ErroDeContinuacaoDoMomento } from './errs/ErroDeContinuacaoDoMomento.js'
import { PoliticaDeAcessoAoNegocio } from './politica-de-acesso-ao-negocio.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  contexto: z.strictObject({ negocioId: z.uuid(), utilizadorId: z.uuid() }),
  momentoId: z.uuid(),
  simulacao: z.discriminatedUnion('estado', [
    z.strictObject({ estado: z.literal('EM_ESPERA') }),
    z.strictObject({ estado: z.literal('ATIVA'), ordemDaEtapa: z.number().int().min(1).max(6) }),
  ]),
})

export class PreVisualizarMomento {
  private readonly politica = new PoliticaDeAcessoAoNegocio()

  constructor(
    private readonly dependencias: Readonly<{
      repositorio: RepositorioDeConsultaDeMomentos
    }>,
  ) {}

  async executar(entrada: unknown) {
    const comando = validarEntrada(esquema, entrada)
    const [papel, momento] = await Promise.all([
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
      momento === null ||
      !this.politica.podeExecutar({ acao: 'VER_CONTEUDO_PRIVADO', papel })
    ) {
      throw new ErroDeAcessoAoNegocio()
    }
    const identidade = {
      capa: momento.capa,
      modeloEditorial: momento.modeloEditorial,
      titulo: momento.titulo,
    }
    if (comando.simulacao.estado === 'EM_ESPERA') {
      return {
        ...identidade,
        abreEm:
          momento.abertura.modo === 'AGENDAR_ABERTURA'
            ? momento.abertura.abreEm
            : null,
        estado: 'EM_ESPERA' as const,
      }
    }
    const ordemDaEtapa = comando.simulacao.ordemDaEtapa
    const etapa = momento.etapas.find(({ ordem }) => ordem === ordemDaEtapa)
    if (etapa === undefined) throw new ErroDeContinuacaoDoMomento()
    return { ...identidade, estado: 'ATIVA' as const, etapa }
  }
}
