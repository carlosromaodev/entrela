import { describe, expect, it } from 'vitest'

import { SessaoDoCriador } from '../../lib/seguranca/sessao-do-criador.js'
import { ErroDeAcessoAoNegocio } from '../../service/errs/ErroDeAcessoAoNegocio.js'
import { RepositorioDeAutenticacaoEmMemoria } from './doubles.js'
import { ResolvedorDeSessaoPersistidaComLegado } from './resolvedor-de-sessao.js'
import { SegredosDeAutenticacao } from './segredos.js'
import { ValidarSessao } from './servicos.js'

const contexto = {
  negocioId: crypto.randomUUID(), sessaoId: crypto.randomUUID(),
  utilizadorId: crypto.randomUUID(),
}

function preparar() {
  const agora = new Date('2026-08-14T12:00:00Z')
  const repositorio = new RepositorioDeAutenticacaoEmMemoria()
  const segredos = new SegredosDeAutenticacao('chave-persistida-segura-com-mais-de-32-bytes')
  const sessao = segredos.gerar('sessao')
  const csrf = segredos.gerar('csrf')
  repositorio.sessoes.set(sessao.hmac, {
    contexto,
    dados: {
      expiraEm: new Date('2026-09-14T12:00:00Z'), hmacCsrf: csrf.hmac,
      hmacToken: sessao.hmac, id: contexto.sessaoId,
    },
    revogada: false,
  })
  return {
    csrf: csrf.token,
    resolvedor: new ResolvedorDeSessaoPersistidaComLegado({
      validarSessao: new ValidarSessao({
        agora: () => agora, gerarId: crypto.randomUUID, repositorio, segredos,
      }),
    }),
    sessao: sessao.token,
  }
}

describe('ResolvedorDeSessaoPersistidaComLegado', () => {
  it('resolve cookie persistido com CSRF de duplo envio numa mutação', async () => {
    const { csrf, resolvedor, sessao } = preparar()
    await expect(resolvedor.resolver({
      cookie: `__Host-entrela=${sessao}; __Host-entrela-csrf=${csrf}`,
      exigirCsrf: true, tokenCsrf: csrf,
    })).resolves.toEqual(contexto)
  })

  it('nega cookie mutável sem CSRF mesmo que a sessão seja válida', async () => {
    const { csrf, resolvedor, sessao } = preparar()
    await expect(resolvedor.resolver({
      cookie: `__Host-entrela=${sessao}; __Host-entrela-csrf=${csrf}`,
      exigirCsrf: true,
    })).rejects.toBeInstanceOf(ErroDeAcessoAoNegocio)
  })

  it('mantém Bearer legado apenas quando não há cookie persistido', async () => {
    const agora = new Date('2026-08-14T12:00:00Z')
    const legado = new SessaoDoCriador({
      chaveDeSessao: 'chave-legada-segura-com-mais-de-trinta-e-dois-bytes',
      obterInstanteAtual: () => agora,
    })
    const token = legado.emitir({ ...contexto, duracaoEmSegundos: 300 })
    const base = preparar()
    const resolvedor = new ResolvedorDeSessaoPersistidaComLegado({
      legado,
      validarSessao: (base.resolvedor as never),
    })
    await expect(resolvedor.resolver({
      authorization: `Bearer ${token}`, exigirCsrf: true,
    })).resolves.toEqual(contexto)
  })
})
