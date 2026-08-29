import type { ContextoAutenticado } from './contratos.js'
import type { ValidarSessao } from './servicos.js'
import { ErroDeCredencialInvalida } from './servicos.js'
import type { SessaoDoCriador } from '../../lib/seguranca/sessao-do-criador.js'
import { ErroDeAcessoAoNegocio } from '../../service/errs/ErroDeAcessoAoNegocio.js'
import { ErroDeAutenticacao } from '../../service/errs/ErroDeAutenticacao.js'

export type PedidoDeResolucaoDeSessao = Readonly<{
  authorization?: string
  cookie?: string
  exigirCsrf: boolean
  tokenCsrf?: string | readonly string[]
}>

export interface ResolvedorDeSessaoDoCriador {
  resolver(pedido: PedidoDeResolucaoDeSessao): Promise<ContextoAutenticado>
}

function lerCookie(cabecalho: string | undefined, nome: string) {
  return cabecalho?.split(';').map((item) => item.trim())
    .find((item) => item.startsWith(`${nome}=`))?.slice(nome.length + 1)
}

export class ResolvedorDeSessaoPersistidaComLegado
  implements ResolvedorDeSessaoDoCriador
{
  constructor(
    private readonly dependencias: Readonly<{
      legado?: SessaoDoCriador
      validarSessao: ValidarSessao
    }>,
  ) {}

  async resolver(pedido: PedidoDeResolucaoDeSessao) {
    const sessaoPersistida = lerCookie(pedido.cookie, '__Host-entrela')
    if (sessaoPersistida !== undefined) {
      const csrfDoCookie = lerCookie(pedido.cookie, '__Host-entrela-csrf')
      if (
        pedido.exigirCsrf &&
        (csrfDoCookie === undefined ||
          typeof pedido.tokenCsrf !== 'string' ||
          pedido.tokenCsrf !== csrfDoCookie)
      ) {
        throw new ErroDeAcessoAoNegocio()
      }
      try {
        return await this.dependencias.validarSessao.executar(
          sessaoPersistida,
          pedido.exigirCsrf ? csrfDoCookie : undefined,
        )
      } catch (erro) {
        if (erro instanceof ErroDeCredencialInvalida) {
          throw new ErroDeAutenticacao()
        }
        throw erro
      }
    }

    if (this.dependencias.legado !== undefined) {
      const { expiraEm: _expiraEm, ...contexto } = this.dependencias.legado.validar(
        pedido.authorization,
      )
      return contexto
    }
    throw new ErroDeAutenticacao()
  }
}

export function adaptarResolvedorLegado(
  sessao: SessaoDoCriador | ResolvedorDeSessaoDoCriador,
): ResolvedorDeSessaoDoCriador {
  if ('resolver' in sessao) return sessao
  return {
    resolver: async (pedido) => sessao.validar(pedido.authorization),
  }
}

export function pedidoDeSessao(
  cabecalhos: Readonly<{
    authorization?: string | undefined
    cookie?: string | undefined
    'x-csrf-token'?: string | readonly string[] | undefined
  }>,
  exigirCsrf: boolean,
): PedidoDeResolucaoDeSessao {
  return {
    ...(cabecalhos.authorization === undefined
      ? {}
      : { authorization: cabecalhos.authorization }),
    ...(cabecalhos.cookie === undefined ? {} : { cookie: cabecalhos.cookie }),
    exigirCsrf,
    ...(cabecalhos['x-csrf-token'] === undefined
      ? {}
      : { tokenCsrf: cabecalhos['x-csrf-token'] }),
  }
}
