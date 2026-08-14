import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      exclude: [
        'drizzle/**',
        'src/server.ts',
        'src/lib/iniciar-backend.ts',
        'src/lib/base-de-dados/**',
        'src/repository/drizzle/repositorio-de-momentos-drizzle.ts'
      ],
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'cobertura',
      thresholds: {
        branches: 35,
        functions: 75,
        lines: 80,
        statements: 80
      }
    }
  }
})
