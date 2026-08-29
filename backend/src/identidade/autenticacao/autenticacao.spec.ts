import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import { EntregadorDeDesafioEmMemoria, LimitadorDeAutenticacaoEmMemoria, RepositorioDeAutenticacaoEmMemoria } from './doubles.js'
import { registrarRotasDeAutenticacao } from './http.js'
import { SegredosDeAutenticacao } from './segredos.js'
import { ConfirmarDesafio, ErroDeCredencialInvalida, RevogarSessao, RotacionarSessao, SolicitarDesafio } from './servicos.js'

const agora = new Date('2026-08-14T12:00:00Z')
function montar() {
  let id = 0; let byte = 0
  const repositorio = new RepositorioDeAutenticacaoEmMemoria()
  const entregador = new EntregadorDeDesafioEmMemoria()
  const segredos = new SegredosDeAutenticacao('chave-separada-de-autenticacao-com-mais-de-32-bytes', (n) => new Uint8Array(n).fill(++byte))
  const base = { agora: () => agora, gerarId: () => `00000000-0000-7000-8000-${String(++id).padStart(12, '0')}`, repositorio, segredos }
  return {
    confirmar: new ConfirmarDesafio(base), entregador, repositorio,
    revogar: new RevogarSessao(base), rotacionar: new RotacionarSessao(base),
    solicitar: new SolicitarDesafio({ ...base, entregador, limitador: new LimitadorDeAutenticacaoEmMemoria() }),
  }
}

describe('autenticação real por desafio', () => {
  it('normaliza email e mantém resposta neutra quando o limite bloqueia', async () => {
    const d = montar()
    expect(await d.solicitar.executar({ email: ' Pessoa@Example.COM ' }, '127.0.0.1')).toEqual({ aceite: true })
    expect(d.entregador.entregas[0]?.email).toBe('pessoa@example.com')
  })

  it('consome desafio uma única vez sob concorrência e cria um PESSOAL', async () => {
    const d = montar(); await d.solicitar.executar({ email: 'pessoa@example.com' }, 'ip')
    const token = d.entregador.entregas[0]!.token
    const resultados = await Promise.allSettled([d.confirmar.executar({ token }), d.confirmar.executar({ token })])
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(resultados.filter((r) => r.status === 'rejected' && r.reason instanceof ErroDeCredencialInvalida)).toHaveLength(1)
    expect(d.repositorio.pessoais).toHaveLength(1)

    await d.solicitar.executar({ email: 'pessoa@example.com' }, 'outro-ip')
    await d.confirmar.executar({ token: d.entregador.entregas[1]!.token })
    expect(d.repositorio.pessoais).toHaveLength(1)
  })

  it('rotação revoga a sessão anterior e logout revoga a nova', async () => {
    const d = montar(); await d.solicitar.executar({ email: 'a@b.co' }, 'ip')
    const token = d.entregador.entregas[0]!.token
    const confirmada = await d.confirmar.executar({ token })
    const nova = await d.rotacionar.executar(confirmada.sessao, confirmada.csrf)
    await expect(d.rotacionar.executar(confirmada.sessao, confirmada.csrf)).rejects.toBeInstanceOf(ErroDeCredencialInvalida)
    await expect(
      d.revogar.executar(nova.sessao, confirmada.csrf),
    ).rejects.toBeInstanceOf(ErroDeCredencialInvalida)
    await d.revogar.executar(nova.sessao, nova.csrf)
    await expect(d.rotacionar.executar(nova.sessao, nova.csrf)).rejects.toBeInstanceOf(ErroDeCredencialInvalida)
  })

  it('expõe HTTP isolável com cookie seguro, CSRF e rotação', async () => {
    const d = montar(); const app = Fastify(); await registrarRotasDeAutenticacao(app, d)
    await app.inject({ method: 'POST', url: '/v1/autenticacao/desafios', payload: { email: 'a@b.co' } })
    const confirmacao = await app.inject({ method: 'POST', url: '/v1/autenticacao/confirmacoes', payload: { token: d.entregador.entregas[0]!.token } })
    expect(confirmacao.statusCode).toBe(200)
    const cookies = confirmacao.headers['set-cookie'] as string[]
    expect(cookies.join(';')).toContain('HttpOnly; Secure; SameSite=Lax')
    const cabecalhoCookie = cookies.map((v) => v.split(';')[0]).join('; ')
    const negada = await app.inject({ method: 'POST', url: '/v1/autenticacao/renovacoes', headers: { cookie: cabecalhoCookie } })
    expect(negada.statusCode).toBe(403)
    const csrf = cabecalhoCookie.match(/__Host-entrela-csrf=([^;]+)/)![1]
    const renovada = await app.inject({ method: 'POST', url: '/v1/autenticacao/renovacoes', headers: { cookie: cabecalhoCookie, 'x-csrf-token': csrf } })
    expect(renovada.statusCode).toBe(200)
    await app.close()
  })
})
