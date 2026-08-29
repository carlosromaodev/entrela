import { describe, expect, it } from 'vitest'

import { TokenPublico } from '../lib/seguranca/token-publico.js'
import type { RepositorioDeAcessoPublicoAMomentos } from '../repository/contratos/repositorio-de-acesso-publico-a-momentos.js'
import { ContinuarNarrativaDoMomento } from './continuar-narrativa-do-momento.js'
import { ErroDeContinuacaoDoMomento } from './errs/ErroDeContinuacaoDoMomento.js'

const porta = {
  abreEm: null, capa: null, estadoDaExperiencia: 'PUBLICADA' as const,
  estadoDaPorta: 'ATIVO' as const, expiraEm: null, fusoHorario: 'Africa/Luanda',
  iniciaEm: null, maximoDeUsos: null, modeloEditorial: 'CARTA_INTIMA',
  negocioId: crypto.randomUUID(), pontoDeAcessoId: crypto.randomUUID(),
  quantidadeDeUsos: 1, terminaEm: null, tipo: 'URL' as const,
  titulo: 'Momento', versaoId: crypto.randomUUID(),
}

function preparar() {
  const chamadas: Parameters<RepositorioDeAcessoPublicoAMomentos['continuar']>[0][] = []
  let divergente = false
  const repositorio: RepositorioDeAcessoPublicoAMomentos = {
    async abrir() { throw new Error('não usado') },
    async continuar(entrada) {
      chamadas.push(entrada)
      if (divergente) throw new Error('CONTINUACAO_IDEMPOTENCIA_DIVERGENTE')
      return {
        estado: 'ATIVA',
        etapa: { chave: 'segunda', final: true, ordem: 2, texto: 'Fim' },
        repetida: chamadas.length > 1,
      }
    },
    async resolver() { return porta },
  }
  const servico = new ContinuarNarrativaDoMomento({
    gerarId: () => crypto.randomUUID(),
    obterInstanteAtual: () => new Date('2026-08-14T12:00:00Z'),
    repositorio,
    tokenPublico: new TokenPublico({ chaveDeHmac: 'chave-segura-com-mais-de-trinta-e-dois-bytes' }),
  })
  return { chamadas, repositorio, servico, tornarDivergente: () => { divergente = true } }
}

const entrada = {
  chaveDaEtapaAtual: 'primeira',
  chaveDeIdempotencia: 'toque-idempotente-0001',
  identificadorAnonimo: 'cookie-anonimo-opaco-comprido',
  token: 'token-publico-opaco-comprido',
}

describe('ContinuarNarrativaDoMomento', () => {
  it('exige etapa actual e entrega somente a etapa seguinte', async () => {
    const { chamadas, servico } = preparar()
    const resultado = await servico.executar(entrada)
    expect(resultado).toMatchObject({ estado: 'ATIVA', etapa: { chave: 'segunda', ordem: 2 } })
    expect(chamadas[0]).toMatchObject({ chaveDaEtapaAtual: 'primeira', chaveDeIdempotencia: 'toque-idempotente-0001' })
  })

  it('preserva a chave para repetição idempotente', async () => {
    const { chamadas, servico } = preparar()
    await servico.executar(entrada)
    const repetida = await servico.executar(entrada)
    expect(repetida.repetida).toBe(true)
    expect(chamadas[0]?.chaveDeIdempotencia).toBe(chamadas[1]?.chaveDeIdempotencia)
  })

  it('traduz reutilização da chave com corpo divergente em conflito neutro', async () => {
    const { servico, tornarDivergente } = preparar()
    tornarDivergente()
    await expect(servico.executar({ ...entrada, chaveDaEtapaAtual: 'forjada' }))
      .rejects.toBeInstanceOf(ErroDeContinuacaoDoMomento)
  })
})
