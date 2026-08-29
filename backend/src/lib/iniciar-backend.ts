import type { FastifyInstance, FastifyRequest } from 'fastify'

import { criarAplicacao } from '../app.js'
import { adaptarResolvedorLegado, pedidoDeSessao } from '../identidade/autenticacao/resolvedor-de-sessao.js'
import { ArmazenamentoLocalPrivado } from '../media/armazenamento-local-privado.js'
import { RepositorioDeMediaPostgresql, FilaDeMediaPostgresql } from '../media/repositorio-postgresql.js'
import { AssociarMediaAoBloco, ConfirmarUploadDeMedia, ObterDownloadTemporarioDeMedia, SolicitarUploadDeMedia } from '../media/servicos.js'
import { RepositorioDeMomentosDrizzle } from '../repository/drizzle/repositorio-de-momentos-drizzle.js'
import { RepositorioDeAcessoPublicoAMomentosDrizzle } from '../repository/drizzle/repositorio-de-acesso-publico-a-momentos-drizzle.js'
import { RepositorioEditorialDeMomentosDrizzle } from '../repository/drizzle/repositorio-editorial-de-momentos-drizzle.js'
import { AtualizarRascunhoDoMomento } from '../service/atualizar-rascunho-do-momento.js'
import { AcederMomentoPublico } from '../service/aceder-momento-publico.js'
import { ContinuarNarrativaDoMomento } from '../service/continuar-narrativa-do-momento.js'
import { ConsultarRascunhoDoMomento } from '../service/consultar-rascunho-do-momento.js'
import { CriarMomento } from '../service/criar-momento.js'
import { PublicarMomento } from '../service/publicar-momento.js'
import { PreVisualizarMomento } from '../service/pre-visualizar-momento.js'
import { RevogarAcessoDoMomento } from '../service/revogar-acesso-do-momento.js'
import { criarBaseDeDados } from './base-de-dados/criar-base-de-dados.js'
import {
  ErroDeConfiguracao,
  carregarConfiguracao,
} from './configuracao/carregar-configuracao.js'
import { GeradorDeUuidV7 } from './identificadores/gerador-de-uuid-v7.js'
import { SessaoDoCriador } from './seguranca/sessao-do-criador.js'
import { TokenPublico } from './seguranca/token-publico.js'
import { RateLimitMemoria } from './rate-limit-memoria.js'

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
  const consultarRascunhoDoMomento = new ConsultarRascunhoDoMomento({
    repositorio: repositorioEditorial,
  })
  const tokenPublico = new TokenPublico({ chaveDeHmac: configuracao.chaveDeHmac })
  const repositorioPublico = new RepositorioDeAcessoPublicoAMomentosDrizzle(
    ligacao.baseDeDados,
  )
  const acederMomentoPublico = new AcederMomentoPublico({
    gerarId,
    obterInstanteAtual: () => new Date(),
    repositorio: repositorioPublico,
    tokenPublico,
  })
  const continuarNarrativaDoMomento = new ContinuarNarrativaDoMomento({
    gerarId,
    obterInstanteAtual: () => new Date(),
    repositorio: repositorioPublico,
    tokenPublico,
  })
  const publicarMomento = new PublicarMomento({
    gerarId,
    obterInstanteAtual: () => new Date(),
    repositorio: repositorioEditorial,
    tokenPublico,
  })
  const preVisualizarMomento = new PreVisualizarMomento({
    repositorio: repositorioEditorial,
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
  const armazenamentoLocalDeMedia = new ArmazenamentoLocalPrivado(
    configuracao.diretorioDeMedia,
    configuracao.chaveDeMedia,
    configuracao.origemPublica,
  )
  await armazenamentoLocalDeMedia.preparar()
  const repositorioDeMedia = new RepositorioDeMediaPostgresql(ligacao.pool)
  const filaDeMedia = new FilaDeMediaPostgresql(ligacao.pool)
  const resolvedorDeSessao = adaptarResolvedorLegado(sessaoDoCriador)
  const obterContextoDeMedia = async (requisicao: FastifyRequest) => {
    const sessao = await resolvedorDeSessao.resolver(
      pedidoDeSessao(requisicao.headers, true),
    )
    return { negocioId: sessao.negocioId, utilizadorId: sessao.utilizadorId }
  }
  const aplicacao = await criarAplicacao({
    acederMomentoPublico,
    continuarNarrativaDoMomento,
    aoEncerrar: ligacao.encerrar,
    atualizarRascunhoDoMomento,
    consultarRascunhoDoMomento,
    configuracao,
    criarMomento,
    armazenamentoLocalDeMedia,
    limiteDeMedia: {
      janelaEmSegundos: 60,
      maximoPorIp: 30,
      rateLimit: new RateLimitMemoria(),
    },
    media: {
      associarAoBloco: new AssociarMediaAoBloco(repositorioDeMedia),
      confirmarUpload: new ConfirmarUploadDeMedia({ fila: filaDeMedia, repositorio: repositorioDeMedia }),
      obterContexto: obterContextoDeMedia,
      obterDownload: new ObterDownloadTemporarioDeMedia({ armazenamento: armazenamentoLocalDeMedia, obterInstanteAtual: () => new Date(), repositorio: repositorioDeMedia }),
      solicitarUpload: new SolicitarUploadDeMedia({ armazenamento: armazenamentoLocalDeMedia, gerarId, obterInstanteAtual: () => new Date(), repositorio: repositorioDeMedia }),
    },
    publicarMomento,
    preVisualizarMomento,
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
