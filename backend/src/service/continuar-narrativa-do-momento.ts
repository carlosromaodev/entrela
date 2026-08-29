import { z } from 'zod'

import type { TokenPublico } from '../lib/seguranca/token-publico.js'
import type { RepositorioDeAcessoPublicoAMomentos } from '../repository/contratos/repositorio-de-acesso-publico-a-momentos.js'
import { ErroDeAcessoPublico } from './errs/ErroDeAcessoPublico.js'
import { ErroDeContinuacaoDoMomento } from './errs/ErroDeContinuacaoDoMomento.js'
import { validarEntrada } from './utils/validar-entrada.js'

const esquema = z.strictObject({
  chaveDaEtapaAtual: z.string().trim().min(1).max(80),
  chaveDeIdempotencia: z.string().trim().min(16).max(80),
  identificadorAnonimo: z.string().min(20).max(200),
  token: z.string().min(20).max(200),
})

export class ContinuarNarrativaDoMomento {
  constructor(
    private readonly dependencias: Readonly<{
      gerarId: () => string
      obterInstanteAtual: () => Date
      repositorio: RepositorioDeAcessoPublicoAMomentos
      tokenPublico: TokenPublico
    }>,
  ) {}

  async executar(entrada: unknown) {
    const comando = validarEntrada(esquema, entrada)
    const porta = await this.dependencias.repositorio.resolver(
      this.dependencias.tokenPublico.calcularHmac(comando.token),
    )
    if (
      porta === null ||
      porta.estadoDaExperiencia !== 'PUBLICADA' ||
      porta.estadoDaPorta !== 'ATIVO'
    ) {
      throw new ErroDeAcessoPublico()
    }
    try {
      return await this.dependencias.repositorio.continuar({
        chaveDaEtapaAtual: comando.chaveDaEtapaAtual,
        chaveDeIdempotencia: comando.chaveDeIdempotencia,
        hmacAnonimo: this.dependencias.tokenPublico.calcularHmac(
          `sessao:${comando.identificadorAnonimo}`,
        ),
        idDoEvento: this.dependencias.gerarId(),
        ocorreuEm: this.dependencias.obterInstanteAtual().toISOString(),
        porta,
      })
    } catch (erro) {
      if (erro instanceof Error && erro.message.startsWith('CONTINUACAO_')) {
        throw new ErroDeContinuacaoDoMomento()
      }
      throw erro
    }
  }
}
