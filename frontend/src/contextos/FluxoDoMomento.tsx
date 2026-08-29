import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import {
  maximoDeEtapasDoMomento,
  tipoDeMediaDoFicheiro,
  validarFicheiroDoMomento,
  validarRascunhoParaPublicacao,
  type RascunhoDoMomentoNoFrontend,
} from '../dominio/regras-do-momento'
import { enviarFicheiroParaArmazenamentoPrivado } from '../lib/cliente-http'

const chaveDaSessao = 'entrela:rascunho-do-momento:v1'

const etapasDeDemonstracao = [
  { chave: 'uma-pequena-pausa', final: false, ordem: 1, titulo: 'Uma pequena pausa', texto: 'Antes de continuares, quero que saibas que esta história foi feita a pensar em ti.' },
  { chave: 'o-que-guardo-de-nos', final: false, ordem: 2, titulo: 'O que guardo de nós', texto: 'Há memórias que não ocupam espaço, mas mudam a casa inteira.' },
  { chave: 'para-levares-contigo', final: true, ordem: 3, titulo: 'Para levares contigo', texto: 'Que encontres aqui um lugar onde possas voltar sempre que precisares.' },
]

export const rascunhoDeDemonstracao: RascunhoDoMomentoNoFrontend = {
  abertura: { fusoHorario: 'Africa/Luanda', modo: 'ABRIR_AGORA' },
  capa: { corHexadecimal: '#D8BFD8', tipo: 'COR' },
  destinatario: 'uma pessoa especial',
  estado: 'RASCUNHO',
  etapas: etapasDeDemonstracao,
  idioma: 'pt-AO',
  modeloEditorial: 'CARTA_INTIMA',
  titulo: 'Uma carta para quando precisares',
}

type DadosDaCriacao = Pick<RascunhoDoMomentoNoFrontend, 'abertura' | 'capa' | 'destinatario' | 'idioma' | 'modeloEditorial' | 'momentoId' | 'titulo'>

type ValorDoFluxo = {
  rascunho: RascunhoDoMomentoNoFrontend | null
  adicionarEtapa: () => string | null
  anexarMedia: (chave: string, ficheiro: File) => Promise<string | null>
  atualizarEtapa: (chave: string, campo: 'texto' | 'titulo', valor: string) => void
  criarRascunho: (dados: DadosDaCriacao) => void
  garantirDemonstracao: () => RascunhoDoMomentoNoFrontend
  publicar: () => ReturnType<typeof validarRascunhoParaPublicacao>
}

const ContextoDoFluxo = createContext<ValorDoFluxo | null>(null)

function lerRascunhoGuardado(): RascunhoDoMomentoNoFrontend | null {
  try {
    const valor = window.sessionStorage.getItem(chaveDaSessao)
    return valor ? JSON.parse(valor) as RascunhoDoMomentoNoFrontend : null
  } catch {
    return null
  }
}

function criarChave(titulo: string, ordem: number) {
  const base = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base || 'etapa'}-${ordem}`.slice(0, 80)
}

export function ProvedorDoFluxoDoMomento({ children }: { children: ReactNode }) {
  const [rascunho, definirRascunho] = useState<RascunhoDoMomentoNoFrontend | null>(lerRascunhoGuardado)

  useEffect(() => {
    if (rascunho === null) window.sessionStorage.removeItem(chaveDaSessao)
    else window.sessionStorage.setItem(chaveDaSessao, JSON.stringify(rascunho))
  }, [rascunho])

  const valor = useMemo<ValorDoFluxo>(() => ({
    rascunho,
    criarRascunho(dados) {
      definirRascunho({
        ...dados,
        estado: 'RASCUNHO',
        etapas: etapasDeDemonstracao.map((etapa) => ({ ...etapa })),
      })
    },
    garantirDemonstracao() {
      if (rascunho !== null) return rascunho
      const demonstracao = structuredClone(rascunhoDeDemonstracao)
      definirRascunho(demonstracao)
      return demonstracao
    },
    atualizarEtapa(chave, campo, valorDoCampo) {
      definirRascunho((atual) => {
        const base = atual ?? structuredClone(rascunhoDeDemonstracao)
        return { ...base, etapas: base.etapas.map((etapa) => etapa.chave === chave ? { ...etapa, [campo]: valorDoCampo } : etapa) }
      })
    },
    adicionarEtapa() {
      const base = rascunho ?? structuredClone(rascunhoDeDemonstracao)
      if (base.etapas.length >= maximoDeEtapasDoMomento) return null
      const ordem = base.etapas.length + 1
      const chave = criarChave('nova-etapa', ordem)
      const anteriores = base.etapas.map((etapa) => ({ ...etapa, final: false }))
      definirRascunho({ ...base, etapas: [...anteriores, { chave, final: true, ordem, texto: '', titulo: 'Nova etapa' }] })
      return chave
    },
    async anexarMedia(chave, ficheiro) {
      const problema = validarFicheiroDoMomento(ficheiro)
      if (problema !== null) return problema
      const tipo = tipoDeMediaDoFicheiro(ficheiro)
      if (tipo === null) return 'Formato não permitido.'
      const base = rascunho ?? structuredClone(rascunhoDeDemonstracao)
      definirRascunho({ ...base, etapas: base.etapas.map((etapa) => etapa.chave === chave ? { ...etapa, media: { estado: 'PROCESSANDO', nome: ficheiro.name, tamanhoEmBytes: ficheiro.size, tipo } } : etapa) })
      try {
        if (base.momentoId !== undefined) {
          const resultado = await enviarFicheiroParaArmazenamentoPrivado(base.momentoId, ficheiro, tipo, (estado) => {
            definirRascunho((atual) => atual === null ? atual : { ...atual, etapas: atual.etapas.map((etapa) => etapa.chave === chave && etapa.media ? { ...etapa, media: { ...etapa.media, estado } } : etapa) })
          })
          definirRascunho((atual) => atual === null ? atual : { ...atual, etapas: atual.etapas.map((etapa) => etapa.chave === chave && etapa.media ? { ...etapa, media: { ...etapa.media, estado: 'PRONTO', ficheiroId: resultado.ficheiroId } } : etapa) })
        } else {
          await new Promise((resolver) => window.setTimeout(resolver, 1400))
          definirRascunho((atual) => atual === null ? atual : { ...atual, etapas: atual.etapas.map((etapa) => etapa.chave === chave && etapa.media ? { ...etapa, media: { ...etapa.media, estado: 'PRONTO' } } : etapa) })
        }
        return null
      } catch {
        definirRascunho((atual) => atual === null ? atual : { ...atual, etapas: atual.etapas.map((etapa) => etapa.chave === chave && etapa.media ? { ...etapa, media: { ...etapa.media, estado: 'FALHOU' } } : etapa) })
        return 'O ficheiro não passou pelo fluxo de upload e inspeção. Tenta novamente.'
      }
    },
    publicar() {
      const base = rascunho ?? rascunhoDeDemonstracao
      const problemas = validarRascunhoParaPublicacao(base)
      if (problemas.length === 0) definirRascunho({ ...base, estado: 'PUBLICADA' })
      return problemas
    },
  }), [rascunho])

  return <ContextoDoFluxo.Provider value={valor}>{children}</ContextoDoFluxo.Provider>
}

export function useFluxoDoMomento() {
  const contexto = useContext(ContextoDoFluxo)
  if (contexto === null) throw new Error('useFluxoDoMomento requer ProvedorDoFluxoDoMomento.')
  return contexto
}
