import { randomUUID } from 'node:crypto'

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { EntregadorDeDesafioEmMemoria, LimitadorDeAutenticacaoEmMemoria } from './doubles.js'
import { RepositorioDeAutenticacaoPostgresql } from './repositorio-postgresql.js'
import { SegredosDeAutenticacao } from './segredos.js'
import { ConfirmarDesafio, SolicitarDesafio } from './servicos.js'

const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO

describe.skipIf(url === undefined)('autenticação concorrente em PostgreSQL 18', () => {
  const schema = `autenticacao_${randomUUID().replaceAll('-', '')}`
  const pool = new Pool({ connectionString: url })

  beforeAll(async () => {
    await pool.query(`CREATE SCHEMA "${schema}"`)
    await pool.query(`
      CREATE TABLE "${schema}".utilizadores (
        id uuid PRIMARY KEY, email text NOT NULL UNIQUE,
        nome_de_apresentacao text NOT NULL
      );
      CREATE TABLE "${schema}".negocios (
        id uuid PRIMARY KEY, identificador_publico text NOT NULL UNIQUE,
        nome_de_apresentacao text NOT NULL, tipo text NOT NULL,
        codigo_do_pais char(2) NOT NULL
      );
      CREATE TABLE "${schema}".membros_do_negocio (
        id uuid PRIMARY KEY, negocio_id uuid NOT NULL REFERENCES "${schema}".negocios,
        utilizador_id uuid NOT NULL REFERENCES "${schema}".utilizadores,
        papel text NOT NULL, estado text NOT NULL,
        UNIQUE (negocio_id, utilizador_id)
      );
      CREATE TABLE "${schema}".contas_pessoais (
        utilizador_id uuid PRIMARY KEY REFERENCES "${schema}".utilizadores,
        negocio_id uuid NOT NULL UNIQUE REFERENCES "${schema}".negocios
      );
      CREATE TABLE "${schema}".desafios_de_autenticacao (
        id uuid PRIMARY KEY, email_normalizado text NOT NULL,
        hmac_token char(64) NOT NULL UNIQUE, expira_em timestamptz NOT NULL,
        consumido_em timestamptz
      );
      CREATE TABLE "${schema}".sessoes_do_criador (
        id uuid PRIMARY KEY, utilizador_id uuid NOT NULL REFERENCES "${schema}".utilizadores,
        negocio_id uuid NOT NULL REFERENCES "${schema}".negocios,
        hmac_token char(64) NOT NULL UNIQUE, hmac_csrf char(64) NOT NULL,
        expira_em timestamptz NOT NULL, revogada_em timestamptz,
        substituida_por_id uuid REFERENCES "${schema}".sessoes_do_criador
      );
    `)
  })

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    await pool.end()
  })

  it('vinte confirmações criam uma sessão, um utilizador e um PESSOAL', async () => {
    const repositorio = new RepositorioDeAutenticacaoPostgresql({
      gerarId: randomUUID,
      pool,
      schema,
    })
    const segredos = new SegredosDeAutenticacao(
      'chave-de-integracao-de-autenticacao-com-mais-de-32-bytes',
    )
    const entregador = new EntregadorDeDesafioEmMemoria()
    const base = {
      agora: () => new Date('2026-08-14T12:00:00Z'),
      gerarId: randomUUID,
      repositorio,
      segredos,
    }
    await new SolicitarDesafio({
      ...base,
      entregador,
      limitador: new LimitadorDeAutenticacaoEmMemoria(),
    }).executar({ email: 'concorrencia@entrela.invalid' }, '127.0.0.1')

    const confirmar = new ConfirmarDesafio(base)
    const resultados = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        confirmar.executar({ token: entregador.entregas[0]!.token }),
      ),
    )
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(resultados.filter((r) => r.status === 'rejected')).toHaveLength(19)

    for (const tabela of [
      'utilizadores',
      'negocios',
      'membros_do_negocio',
      'contas_pessoais',
      'sessoes_do_criador',
    ]) {
      const contagem = await pool.query<{ total: string }>(
        `SELECT count(*) AS total FROM "${schema}".${tabela}`,
      )
      expect(Number(contagem.rows[0]!.total)).toBe(1)
    }
  })
})
