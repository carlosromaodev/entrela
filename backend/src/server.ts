import {
  iniciarBackend,
  obterMensagemDaFalhaNoArranque,
} from './lib/iniciar-backend.js'

try {
  await iniciarBackend()
} catch (erro: unknown) {
  console.error(obterMensagemDaFalhaNoArranque(erro))
  process.exitCode = 1
}
