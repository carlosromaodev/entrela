import type { FastifyInstance, FastifyReply } from 'fastify'
import { z } from 'zod'
import type { ConfirmarDesafio, RevogarSessao, RotacionarSessao, SolicitarDesafio } from './servicos.js'
import { ErroDeCredencialInvalida } from './servicos.js'

const email = z.object({ email: z.string().max(254) }).strict()
const token = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict()
const erro = { type: 'object', additionalProperties: false, required: ['erro'], properties: { erro: { type: 'object', additionalProperties: false, required: ['codigo'], properties: { codigo: { type: 'string' } } } } } as const
const contexto = { type: 'object', additionalProperties: false, required: ['dados'], properties: { dados: { type: 'object', additionalProperties: false, required: ['negocioId', 'sessaoId', 'utilizadorId'], properties: { negocioId: { type: 'string', format: 'uuid' }, sessaoId: { type: 'string', format: 'uuid' }, utilizadorId: { type: 'string', format: 'uuid' } } } } } as const

function criarCookie(nome: string, valor: string, maxAge = 2_592_000, httpOnly = true): string {
  return `${nome}=${valor}; Path=/; ${httpOnly ? 'HttpOnly; ' : ''}Secure; SameSite=Lax; Max-Age=${maxAge}`
}
function lerCookie(cabecalho: string | undefined, nome: string): string | undefined {
  return cabecalho?.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${nome}=`))?.slice(nome.length + 1)
}
function csrf(cookies: string | undefined, header: string | string[] | undefined) {
  const sessao = lerCookie(cookies, '__Host-entrela')
  const valor = lerCookie(cookies, '__Host-entrela-csrf')
  return sessao && valor && typeof header === 'string' && header === valor ? { csrf: valor, sessao } : null
}
function negado(res: FastifyReply) { return res.code(403).send({ erro: { codigo: 'ACESSO_NEGADO' } }) }
function sessaoInvalida(res: FastifyReply) { return res.code(401).send({ erro: { codigo: 'CREDENCIAL_INVALIDA' } }) }
function cookiesDaSessao(res: FastifyReply, dados: { csrf: string; sessao: string }) {
  res.header('set-cookie', [criarCookie('__Host-entrela', dados.sessao), criarCookie('__Host-entrela-csrf', dados.csrf, 2_592_000, false)])
}

export async function registrarRotasDeAutenticacao(app: FastifyInstance, d: Readonly<{
  confirmar: ConfirmarDesafio
  revogar: RevogarSessao
  rotacionar: RotacionarSessao
  solicitar: SolicitarDesafio
}>): Promise<void> {
  app.post('/v1/autenticacao/desafios', {
    schema: {
      body: { type: 'object', additionalProperties: false, required: ['email'], properties: { email: { type: 'string', maxLength: 254 } } },
      description: 'Solicita uma ligação de entrada com resposta neutra para contactos novos, existentes ou limitados.',
      response: { 202: { type: 'object', additionalProperties: false, required: ['dados'], properties: { dados: { type: 'object', additionalProperties: false, required: ['aceite'], properties: { aceite: { const: true } } } } }, 400: erro },
      summary: 'Solicitar desafio de autenticação', tags: ['Autenticação'],
    },
  }, async (req, res) => {
    await d.solicitar.executar(email.parse(req.body), req.ip)
    return res.code(202).send({ dados: { aceite: true } })
  })

  app.post('/v1/autenticacao/confirmacoes', {
    schema: {
      body: { type: 'object', additionalProperties: false, required: ['token'], properties: { token: { type: 'string', minLength: 43, maxLength: 43 } } },
      response: { 200: contexto, 400: erro, 401: erro }, summary: 'Confirmar desafio e iniciar sessão', tags: ['Autenticação'],
    },
  }, async (req, res) => {
    try {
      const resultado = await d.confirmar.executar(token.parse(req.body))
      cookiesDaSessao(res, resultado)
      return res.send({ dados: resultado.contexto })
    } catch (e) { if (e instanceof ErroDeCredencialInvalida) return sessaoInvalida(res); throw e }
  })

  app.post('/v1/autenticacao/renovacoes', {
    schema: { response: { 200: contexto, 401: erro, 403: erro }, summary: 'Rotacionar sessão autenticada', tags: ['Autenticação'] },
  }, async (req, res) => {
    const credenciais = csrf(req.headers.cookie, req.headers['x-csrf-token'])
    if (!credenciais) return negado(res)
    try {
      const resultado = await d.rotacionar.executar(credenciais.sessao, credenciais.csrf)
      cookiesDaSessao(res, resultado)
      return res.send({ dados: resultado.contexto })
    } catch (e) { if (e instanceof ErroDeCredencialInvalida) return sessaoInvalida(res); throw e }
  })

  app.delete('/v1/autenticacao/sessao', {
    schema: { response: { 204: { type: 'null' }, 401: erro, 403: erro }, summary: 'Terminar sessão autenticada', tags: ['Autenticação'] },
  }, async (req, res) => {
    const credenciais = csrf(req.headers.cookie, req.headers['x-csrf-token'])
    if (!credenciais) return negado(res)
    try {
      await d.revogar.executar(credenciais.sessao, credenciais.csrf)
      res.header('set-cookie', criarCookie('__Host-entrela', '', 0))
      return res.code(204).send()
    } catch (e) { if (e instanceof ErroDeCredencialInvalida) return sessaoInvalida(res); throw e }
  })
}
