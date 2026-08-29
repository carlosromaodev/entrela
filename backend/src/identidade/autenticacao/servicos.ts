import { z } from 'zod'
import type { ContextoAutenticado, EntregadorDeDesafio, LimitadorDeAutenticacao, NovaSessao, RepositorioDeAutenticacao } from './contratos.js'
import { SegredosDeAutenticacao } from './segredos.js'

export class ErroDeCredencialInvalida extends Error {}

type Dependencias = Readonly<{
  agora: () => Date
  gerarId: () => string
  repositorio: RepositorioDeAutenticacao
  segredos: SegredosDeAutenticacao
}>

const email = z.preprocess(
  (v) => typeof v === 'string' ? v.trim().toLowerCase() : v,
  z.email().max(254),
)
const token = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

function novaSessao(d: Dependencias, agora: Date): Readonly<{ csrf: string; sessao: string; dados: NovaSessao }> {
  const sessao = d.segredos.gerar('sessao')
  const csrf = d.segredos.gerar('csrf')
  return {
    csrf: csrf.token,
    sessao: sessao.token,
    dados: { id: d.gerarId(), hmacToken: sessao.hmac, hmacCsrf: csrf.hmac, expiraEm: new Date(agora.getTime() + 30 * 86400_000) },
  }
}

export class SolicitarDesafio {
  constructor(private readonly d: Dependencias & Readonly<{ entregador: EntregadorDeDesafio; limitador: LimitadorDeAutenticacao }>) {}
  async executar(entrada: unknown, ip: string): Promise<Readonly<{ aceite: true }>> {
    const emailNormalizado = z.object({ email }).strict().parse(entrada).email
    const [porIp, porEmail] = await Promise.all([
      this.d.limitador.permitir({ chave: `ip:${ip}`, limite: 10, janelaEmSegundos: 900 }),
      this.d.limitador.permitir({ chave: `email:${emailNormalizado}`, limite: 5, janelaEmSegundos: 900 }),
    ])
    if (porIp && porEmail) {
      const segredo = this.d.segredos.gerar('desafio')
      await this.d.repositorio.guardarDesafio({ id: this.d.gerarId(), emailNormalizado, hmacToken: segredo.hmac, expiraEm: new Date(this.d.agora().getTime() + 15 * 60_000) })
      await this.d.entregador.entregar({ email: emailNormalizado, token: segredo.token })
    }
    return { aceite: true }
  }
}

export class ConfirmarDesafio {
  constructor(private readonly d: Dependencias) {}
  async executar(entrada: unknown): Promise<Readonly<{ contexto: ContextoAutenticado; csrf: string; sessao: string }>> {
    const valor = token.parse(z.object({ token }).strict().parse(entrada).token)
    const agora = this.d.agora()
    const criada = novaSessao(this.d, agora)
    const contexto = await this.d.repositorio.consumirDesafioEProvisionar({ agora, hmacDoDesafio: this.d.segredos.calcular('desafio', valor), novaSessao: criada.dados })
    if (contexto === null) throw new ErroDeCredencialInvalida()
    return { contexto, csrf: criada.csrf, sessao: criada.sessao }
  }
}

export class ValidarSessao {
  constructor(private readonly d: Dependencias) {}
  async executar(sessao: string | undefined, csrf?: string): Promise<ContextoAutenticado> {
    if (!sessao || !token.safeParse(sessao).success) throw new ErroDeCredencialInvalida()
    const hmacCsrf = csrf === undefined ? undefined : this.d.segredos.calcular('csrf', csrf)
    const contexto = await this.d.repositorio.obterSessaoAtiva(this.d.segredos.calcular('sessao', sessao), this.d.agora(), hmacCsrf)
    if (contexto === null) throw new ErroDeCredencialInvalida()
    return contexto
  }
}

export class RotacionarSessao {
  constructor(private readonly d: Dependencias) {}
  async executar(sessaoAtual: string, csrfAtual: string): Promise<Readonly<{ contexto: ContextoAutenticado; csrf: string; sessao: string }>> {
    const agora = this.d.agora(); const criada = novaSessao(this.d, agora)
    const contexto = await this.d.repositorio.rotacionarSessao({ agora, hmacAtual: this.d.segredos.calcular('sessao', token.parse(sessaoAtual)), hmacCsrfAtual: this.d.segredos.calcular('csrf', token.parse(csrfAtual)), novaSessao: criada.dados })
    if (contexto === null) throw new ErroDeCredencialInvalida()
    return { contexto, csrf: criada.csrf, sessao: criada.sessao }
  }
}

export class RevogarSessao {
  constructor(private readonly d: Dependencias) {}
  async executar(sessaoAtual: string, csrfAtual: string): Promise<void> {
    const revogada = await this.d.repositorio.revogarSessao(
      this.d.segredos.calcular('sessao', token.parse(sessaoAtual)),
      this.d.segredos.calcular('csrf', token.parse(csrfAtual)),
      this.d.agora(),
    )
    if (!revogada) throw new ErroDeCredencialInvalida()
  }
}
