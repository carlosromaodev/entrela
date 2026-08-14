import type { FastifyInstance } from 'fastify'

import { criarAplicacao } from '../app.js'
import { RepositorioDeMomentosDrizzle } from '../repository/drizzle/repositorio-de-momentos-drizzle.js'
import { RepositorioEditorialDeMomentosDrizzle } from '../repository/drizzle/repositorio-editorial-de-momentos-drizzle.js'
import { AtualizarRascunhoDoMomento } from '../service/atualizar-rascunho-do-momento.js'
import { CriarMomento } from '../service/criar-momento.js'
import { PublicarMomento } from '../service/publicar-momento.js'
import { RevogarAcessoDoMomento } from '../service/revogar-acesso-do-momento.js'
import { criarBaseDeDados } from './base-de-dados/criar-base-de-dados.js'
import {
  ErroDeConfiguracao,
  carregarConfiguracao,
} from './configuracao/carregar-configuracao.js'
import { GeradorDeUuidV7 } from './identificadores/gerador-de-uuid-v7.js'
import { SessaoDoCriador } from './seguranca/sessao-do-criador.js'
import { TokenPublico } from './seguranca/token-publico.js'

export async function iniciarBackend(
  variaveis: Readonly<Record<string, string | undefined>> = process.env,
): Promise<FastifyInstance> {
  const configuracao = carregarConfiguracao(variaveis)
  const ligacao = criarBaseDeDados(configuracao.urlDaBaseDeDados)
  const geradorDeUuid = new GeradorDeUuidV7()
  const gerarId = () => geradorDeUuid.gerar()

  const repositorioDeCriacao = new RepositorioDeMomentosDrizzle(
    ligacao.baseDeDados,
  )
  const criarMomento = new CriarMomento({
    gerarId,
    repositorio: repositorioDeCriacao,
  })

  const repositorioEditorial = new RepositorioEditorialDeMomentosDrizzle(
    ligacao.baseDeDados,
    { gerarId },
  )
  const atualizarRascunhoDoMomento = new AtualizarRascunhoDoMomento({
    repositorio: repositorioEditorial,
  })
  const tokenPublico = new TokenPublico({ chaveDeHmac: configuracao.chaveDeHmac })
  const publicarMomento = new PublicarMomento({
    gerarId,
    obterInstanteAtual: () => new Date(),
    repositorio: repositorioEditorial,
    tokenPublico,
  })
  const revogarAcessoDoMomento = new RevogarAcessoDoMomento({
    gerarId,
    repositorio: repositorioEditorial,
    tokenPublico,
  })

  const sessaoDoCriador = new SessaoDoCriador({
    chaveDeSessao: configuracao.chaveDeSessao,
    obterInstanteAtual: () => new Date(),
  })
  const aplicacao = await criarAplicacao({
    aoEncerrar: ligacao.encerrar,
    atualizarRascunhoDoMomento,
    configuracao,
    criarMomento,
    publicarMomento,
    revogarAcessoDoMomento,
    sessaoDoCriador,
  })

  const encerrar = async (sinal: NodeJS.Signals): Promise<void> => {
    aplicacao.log.info({ sinal }, 'A encerrar o backend.')
    await aplicacao.close()
    process.exit(0)
  }

  process.once('SIGINT', () => void encerrar('SIGINT'))
  process.once('SIGTERM', () => void encerrar('SIGTERM'))

  await aplicacao.listen({
    host: configuracao.hospede,
    port: configuracao.porta,
  })

  return aplicacao
}

export function obterMensagemDaFalhaNoArranque(erro: unknown): string {
  if (erro instanceof ErroDeConfiguracao) {
    return erro.message
  }

  return 'Não foi possível iniciar o backend.'
}
