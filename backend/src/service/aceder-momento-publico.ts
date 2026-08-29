import { randomBytes } from 'node:crypto'

import { z } from 'zod'

import type { TokenPublico } from '../lib/seguranca/token-publico.js'
import type { RepositorioDeAcessoPublicoAMomentos } from '../repository/contratos/repositorio-de-acesso-publico-a-momentos.js'
import { AvaliarDisponibilidade } from './avaliar-disponibilidade.js'
import { ErroDeAcessoPublico } from './errs/ErroDeAcessoPublico.js'
import { validarEntrada } from './utils/validar-entrada.js'

const entradaResolver = z.strictObject({ token: z.string().min(20).max(200) })
const entradaAbrir = entradaResolver.extend({
  identificadorAnonimo: z.string().min(20).max(200).optional(),
})

type Dependencias = Readonly<{
  gerarId: () => string
  gerarIdentificadorAnonimo?: () => string
  obterInstanteAtual: () => Date
  repositorio: RepositorioDeAcessoPublicoAMomentos
  tokenPublico: TokenPublico
}>

export class AcederMomentoPublico {
  private readonly disponibilidade: AvaliarDisponibilidade

  constructor(private readonly dependencias: Dependencias) {
    this.disponibilidade = new AvaliarDisponibilidade({
      obterInstanteAtual: dependencias.obterInstanteAtual,
    })
  }

  private async obter(token: string, ignorarLimiteDeUsos = false) {
    const porta = await this.dependencias.repositorio.resolver(
      this.dependencias.tokenPublico.calcularHmac(token),
    )
    if (porta === null) throw new ErroDeAcessoPublico()
    const resultado = this.disponibilidade.executar({
      estadoDaExperiencia: porta.estadoDaExperiencia,
      pontoDeAcesso: {
        estado: porta.estadoDaPorta,
        iniciaEm: porta.iniciaEm,
        maximoDeUsos: ignorarLimiteDeUsos ? null : porta.maximoDeUsos,
        terminaEm: porta.terminaEm,
        usos: porta.quantidadeDeUsos,
      },
      politica: {
        abreEm: porta.abreEm,
        expiraEm: porta.expiraEm,
        fusoHorario: porta.fusoHorario,
        modo: porta.abreEm === null ? 'IMEDIATA' : 'JANELA',
      },
    })
    if (resultado.estadoDaSessao === 'NEGADA' || resultado.estadoDaSessao === 'EXPIRADA') {
      throw new ErroDeAcessoPublico()
    }
    return { porta, resultado }
  }

  async resolver(entrada: unknown) {
    const comando = validarEntrada(entradaResolver, entrada)
    const { porta, resultado } = await this.obter(comando.token)
    if (resultado.estadoDaSessao === 'EM_ESPERA') {
      return { abreEm: resultado.abreEm, estado: 'EM_ESPERA' as const }
    }
    return {
      capa: porta.capa,
      estado: 'DISPONIVEL' as const,
      modeloEditorial: porta.modeloEditorial,
      titulo: porta.titulo,
    }
  }

  async abrir(entrada: unknown) {
    const comando = validarEntrada(entradaAbrir, entrada)
    const { porta, resultado } = await this.obter(
      comando.token,
      comando.identificadorAnonimo !== undefined,
    )
    const identificadorAnonimo =
      comando.identificadorAnonimo ??
      (this.dependencias.gerarIdentificadorAnonimo?.() ??
        randomBytes(32).toString('base64url'))
    const estado = resultado.estadoDaSessao
    let sessao
    try {
      sessao = await this.dependencias.repositorio.abrir({
        estado,
        hmacAnonimo: this.dependencias.tokenPublico.calcularHmac(
          `sessao:${identificadorAnonimo}`,
        ),
        idDoEvento: this.dependencias.gerarId(),
        idDaSessao: this.dependencias.gerarId(),
        ocorreuEm: this.dependencias.obterInstanteAtual().toISOString(),
        porta,
      })
    } catch (erro) {
      if (
        erro instanceof Error &&
        ['LIMITE_DE_USOS_ATINGIDO', 'PONTO_INDISPONIVEL'].includes(erro.message)
      ) {
        throw new ErroDeAcessoPublico()
      }
      throw erro
    }
    return {
      identificadorAnonimo,
      ...(estado === 'EM_ESPERA'
        ? { abreEm: resultado.abreEm, estado: 'EM_ESPERA' as const }
        : { estado: 'ATIVA' as const, etapa: sessao.etapa }),
    }
  }
}
