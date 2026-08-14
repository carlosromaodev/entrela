import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url:
      process.env.URL_DA_BASE_DE_DADOS ??
      'postgresql://entrela:entrela@localhost:5432/entrela',
  },
  dialect: 'postgresql',
  out: './drizzle/migrations',
  schema: './drizzle/schema.ts',
  strict: true,
  verbose: true,
})
