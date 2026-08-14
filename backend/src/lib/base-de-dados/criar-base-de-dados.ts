import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as esquema from '../../../drizzle/schema.js'

export type BaseDeDados = NodePgDatabase<typeof esquema>

export type LigacaoComBaseDeDados = Readonly<{
  baseDeDados: BaseDeDados
  encerrar: () => Promise<void>
}>

export function criarBaseDeDados(urlDaBaseDeDados: string): LigacaoComBaseDeDados {
  const pool = new Pool({
    application_name: 'entrela-backend',
    connectionString: urlDaBaseDeDados,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: 10,
    statement_timeout: 10_000,
  })
  const baseDeDados = drizzle(pool, { schema: esquema })

  return {
    baseDeDados,
    encerrar: async () => pool.end(),
  }
}
