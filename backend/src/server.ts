import { existsSync } from 'node:fs'

import {
  iniciarBackend,
  obterMensagemDaFalhaNoArranque,
} from './lib/iniciar-backend.js'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

if (process.env.AMBIENTE !== 'producao') {
  process.env.CHAVE_DE_MEDIA ??= process.env.STORAGE_SECRET
  process.env.DIRETORIO_DE_MEDIA ??= './dados/media'
  process.env.ORIGEM_PUBLICA ??= `http://localhost:${process.env.PORTA ?? '3333'}`
}

try {
  await iniciarBackend()
} catch (erro: unknown) {
  console.error(obterMensagemDaFalhaNoArranque(erro))
  process.exitCode = 1
}
