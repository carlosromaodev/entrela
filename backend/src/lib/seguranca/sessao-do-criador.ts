import { createHmac, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { ErroDeAutenticacao } from '../../service/errs/ErroDeAutenticacao.js'

const esquemaDaEmissao = z.strictObject({
  duracaoEmSegundos: z.number().int().min(60).max(3_600),
  negocioId: z.uuid(),
  sessaoId: z.uuid(),
  utilizadorId: z.uuid(),
})

const esquemaDoConteudo = z.strictObject({
  expiraEm: z.number().int().positive(),
  emitidoEm: z.number().int().nonnegative(),
  negocioId: z.uuid(),
  sessaoId: z.uuid(),
  utilizadorId: z.uuid(),
  versao: z.literal(1),
})

type DependenciasDaSessao = Readonly<{
  chaveDeSessao: string
  obterInstanteAtual: () => Date
}>

export class SessaoDoCriador {
  constructor(private readonly dependencias: DependenciasDaSessao) {
    if (Buffer.byteLength(dependencias.chaveDeSessao, 'utf8') < 32) {
      throw new Error('A chave de sessão precisa de pelo menos 32 bytes.')
    }
  }

  emitir(entrada: z.input<typeof esquemaDaEmissao>): string {
    const comando = esquemaDaEmissao.parse(entrada)
    const emitidoEm = this.dependencias.obterInstanteAtual().getTime()
    const conteudo = Buffer.from(
      JSON.stringify({
        emitidoEm,
        expiraEm: emitidoEm + comando.duracaoEmSegundos * 1_000,
        negocioId: comando.negocioId,
        sessaoId: comando.sessaoId,
        utilizadorId: comando.utilizadorId,
        versao: 1,
      }),
    ).toString('base64url')
    const assinatura = this.assinar(conteudo).toString('base64url')

    return `${conteudo}.${assinatura}`
  }

  validar(autorizacao: string | undefined): Readonly<{
    expiraEm: string
    negocioId: string
    sessaoId: string
    utilizadorId: string
  }> {
    try {
      if (autorizacao === undefined || !autorizacao.startsWith('Bearer ')) {
        throw new Error('FORMATO')
      }

      const token = autorizacao.slice('Bearer '.length)
      const partes = token.split('.')
      if (partes.length !== 2) throw new Error('FORMATO')
      const [conteudo, assinaturaRecebida] = partes
      if (conteudo === undefined || assinaturaRecebida === undefined) {
        throw new Error('FORMATO')
      }

      const assinatura = Buffer.from(assinaturaRecebida, 'base64url')
      const assinaturaEsperada = this.assinar(conteudo)
      if (
        assinatura.toString('base64url') !== assinaturaRecebida ||
        assinatura.length !== assinaturaEsperada.length ||
        !timingSafeEqual(assinatura, assinaturaEsperada)
      ) {
        throw new Error('ASSINATURA')
      }

      const conteudoValidado = esquemaDoConteudo.parse(
        JSON.parse(Buffer.from(conteudo, 'base64url').toString('utf8')),
      )
      const agora = this.dependencias.obterInstanteAtual().getTime()
      if (
        conteudoValidado.expiraEm <= agora ||
        conteudoValidado.emitidoEm > agora
      ) {
        throw new Error('TEMPO')
      }

      return {
        expiraEm: new Date(conteudoValidado.expiraEm).toISOString(),
        negocioId: conteudoValidado.negocioId,
        sessaoId: conteudoValidado.sessaoId,
        utilizadorId: conteudoValidado.utilizadorId,
      }
    } catch {
      throw new ErroDeAutenticacao()
    }
  }

  private assinar(conteudo: string): Buffer {
    return createHmac('sha256', this.dependencias.chaveDeSessao)
      .update(conteudo)
      .digest()
  }
}
