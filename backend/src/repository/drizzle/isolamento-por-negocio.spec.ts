import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const tabelasIsoladas = [
  'negocios',
  'membros_do_negocio',
  'experiencias',
  'versoes_da_experiencia',
  'traducoes_da_experiencia',
  'blocos',
  'traducoes_do_bloco',
  'politicas_de_disponibilidade',
  'pontos_de_acesso',
  'sessoes_de_interacao',
  'regras',
  'eventos_de_interacao',
  'direitos',
  'registos_de_auditoria',
] as const

describe('migração de isolamento por negócio', () => {
  const migracao = readFileSync(
    new URL('../../../drizzle/migrations/0002_isolamento_por_negocio.sql', import.meta.url),
    'utf8',
  )

  it.each(tabelasIsoladas)('activa e força RLS em %s', (tabela) => {
    expect(migracao).toContain(
      `ALTER TABLE ${tabela} ENABLE ROW LEVEL SECURITY;`,
    )
    expect(migracao).toContain(
      `ALTER TABLE ${tabela} FORCE ROW LEVEL SECURITY;`,
    )
  })

  it('nega por omissão quando o contexto de negócio não foi definido', () => {
    expect(migracao).toContain(
      "NULLIF(current_setting('app.negocio_id', true), '')::uuid",
    )
    expect(migracao).not.toContain('USING (true)')
  })
})
