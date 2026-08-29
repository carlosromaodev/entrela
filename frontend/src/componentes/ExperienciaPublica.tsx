import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import IconeEntrela from './IconeEntrela'
import SimboloEntrela from './SimboloEntrela'
import { useFluxoDoMomento } from '../contextos/FluxoDoMomento'
import { abrirMomentoPublico, continuarMomentoPublico, resolverMomentoPublico, type EtapaPublicaDaApi } from '../lib/cliente-http'

type EstadoPublico = 'carregando' | 'disponivel' | 'espera' | 'ativa' | 'concluida' | 'expirada'
type IdiomaPublico = 'pt-AO' | 'en'

type PropriedadesDaExperiencia = {
  modoPreVisualizacao?: boolean
}

const etapasDemonstracao = [
  {
    numero: '01',
    titulo: { 'pt-AO': 'Uma pequena pausa', en: 'A small pause' },
    texto: {
      'pt-AO': 'Antes de continuares, quero que saibas que esta história foi feita a pensar em ti.',
      en: 'Before you continue, I want you to know this story was made with you in mind.',
    },
  },
  {
    numero: '02',
    titulo: { 'pt-AO': 'O que guardo de nós', en: 'What I keep from us' },
    texto: {
      'pt-AO': 'Há memórias que não ocupam espaço, mas mudam a casa inteira. Esta é uma delas.',
      en: 'Some memories take up no space, yet change the whole house. This is one of them.',
    },
  },
  {
    numero: '03',
    titulo: { 'pt-AO': 'Para levares contigo', en: 'Something to carry with you' },
    texto: {
      'pt-AO': 'Que encontres aqui um lugar onde possas voltar sempre que precisares.',
      en: 'May you find here a place you can return to whenever you need it.',
    },
  },
]

const textos = {
  'pt-AO': {
    para: 'Para Ana',
    de: 'Com carinho, Carlos',
    continuar: 'Continuar',
    concluir: 'Guardar este momento',
    espera: 'Há algo à tua espera',
    esperaDescricao: (data: string, hora: string) => `Este momento poderá ser aberto em ${data}, às ${hora}.`,
    expirada: 'Esta ligação já não está disponível',
    expiradaDescricao: 'Pede uma nova ligação à pessoa que preparou este momento.',
  },
  en: {
    para: 'For Ana',
    de: 'With care, Carlos',
    continuar: 'Continue',
    concluir: 'Keep this moment',
    espera: 'Something is waiting for you',
    esperaDescricao: (data: string, hora: string) => `This moment can be opened on ${data} at ${hora}.`,
    expirada: 'This link is no longer available',
    expiradaDescricao: 'Ask the person who prepared this moment for a new link.',
  },
}

export default function ExperienciaPublica({ modoPreVisualizacao = false }: PropriedadesDaExperiencia) {
  const { rascunho } = useFluxoDoMomento()
  const { token } = useParams<{ token: string }>()
  const [idioma, definirIdioma] = useState<IdiomaPublico>('pt-AO')
  const [estado, definirEstado] = useState<EstadoPublico>(modoPreVisualizacao ? 'ativa' : 'carregando')
  const [etapaAtual, definirEtapaAtual] = useState(0)
  const [etapaDoServidor, definirEtapaDoServidor] = useState<EtapaPublicaDaApi | null>(null)
  const [tituloDoServidor, definirTituloDoServidor] = useState('Um momento para ti')
  const [abreEm, definirAbreEm] = useState(modoPreVisualizacao ? '2026-09-12T09:00:00+01:00' : '')
  const copia = textos[idioma]
  const etapasAtuais = modoPreVisualizacao && rascunho
    ? rascunho.etapas.map((etapa) => ({ numero: String(etapa.ordem).padStart(2, '0'), titulo: { 'pt-AO': etapa.titulo, en: etapa.titulo }, texto: { 'pt-AO': etapa.texto, en: etapa.texto } }))
    : etapasDemonstracao
  const para = modoPreVisualizacao && rascunho?.destinatario ? `Para ${rascunho.destinatario}` : copia.para
  const etapaVisivel = etapaDoServidor
    ? {
        numero: String(etapaDoServidor.ordem).padStart(2, '0'),
        texto: { 'pt-AO': etapaDoServidor.texto ?? '', en: etapaDoServidor.texto ?? '' },
        titulo: { 'pt-AO': etapaDoServidor.chave.replaceAll('-', ' ').replace(/^./, (letra) => letra.toUpperCase()), en: etapaDoServidor.chave.replaceAll('-', ' ').replace(/^./, (letra) => letra.toUpperCase()) },
      }
    : etapasAtuais[etapaAtual]
  const numeroDaEtapa = etapaDoServidor?.ordem ?? etapaAtual + 1
  const quantidadeDeMarcadores = modoPreVisualizacao ? etapasAtuais.length : Math.max(1, numeroDaEtapa)
  const ultimaEtapa = modoPreVisualizacao ? etapaAtual === etapasAtuais.length - 1 : Boolean(etapaDoServidor?.final)
  const dataDeAbertura = Number.isFinite(Date.parse(abreEm)) ? new Date(abreEm) : new Date('2026-09-12T09:00:00+01:00')
  const localidade = idioma === 'pt-AO' ? 'pt-AO' : 'en-GB'
  const dataPorExtenso = new Intl.DateTimeFormat(localidade, { dateStyle: 'long', timeZone: 'Africa/Luanda' }).format(dataDeAbertura)
  const diaDeAbertura = new Intl.DateTimeFormat(localidade, { day: '2-digit', timeZone: 'Africa/Luanda' }).format(dataDeAbertura)
  const mesDeAbertura = new Intl.DateTimeFormat(localidade, { month: 'short', timeZone: 'Africa/Luanda' }).format(dataDeAbertura).replace('.', '').toUpperCase()
  const anoDeAbertura = new Intl.DateTimeFormat(localidade, { year: 'numeric', timeZone: 'Africa/Luanda' }).format(dataDeAbertura)
  const horaDeAbertura = new Intl.DateTimeFormat(localidade, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Luanda' }).format(dataDeAbertura)

  useEffect(() => {
    if (modoPreVisualizacao) return
    if (!token || token.length < 20) {
      definirEstado('expirada')
      return
    }
    let ativo = true
    resolverMomentoPublico(token)
      .then((resposta) => {
        if (!ativo) return
        if (resposta.dados.estado === 'EM_ESPERA') {
          definirAbreEm(resposta.dados.abreEm)
          definirEstado('espera')
        }
        else {
          definirTituloDoServidor(resposta.dados.titulo)
          definirEstado('disponivel')
        }
      })
      .catch(() => { if (ativo) definirEstado('expirada') })
    return () => { ativo = false }
  }, [modoPreVisualizacao, token])

  const abrir = async () => {
    if (!token) return
    definirEstado('carregando')
    try {
      const resposta = await abrirMomentoPublico(token)
      if (resposta.dados.estado === 'EM_ESPERA') {
        definirAbreEm(resposta.dados.abreEm)
        definirEstado('espera')
      }
      else {
        definirEtapaDoServidor(resposta.dados.etapa ?? null)
        definirEstado(resposta.dados.etapa ? 'ativa' : 'concluida')
      }
    } catch {
      definirEstado('expirada')
    }
  }

  const avancar = async () => {
    if (modoPreVisualizacao) {
      if (ultimaEtapa) definirEstado('concluida')
      else definirEtapaAtual((atual) => atual + 1)
      return
    }
    if (!token || !etapaDoServidor) return
    try {
      const resposta = await continuarMomentoPublico(token, etapaDoServidor.chave)
      if (resposta.dados.estado === 'CONCLUIDA') definirEstado('concluida')
      else definirEtapaDoServidor(resposta.dados.etapa)
    } catch {
      definirEstado('expirada')
    }
  }

  return (
    <div className={`public-experience public-experience--${estado}`} lang={idioma}>
      {modoPreVisualizacao ? (
        <header className="preview-bar">
          <Link to="/editar">← <span>Voltar ao editor</span></Link>
          <div>
            <span>Pré-visualização</span>
            <div className="preview-state-control" aria-label="Simular estado">
              <button type="button" className={estado === 'espera' ? 'is-active' : ''} onClick={() => definirEstado('espera')}>Em espera</button>
              <button type="button" className={estado === 'ativa' ? 'is-active' : ''} onClick={() => definirEstado('ativa')}>Ativo</button>
              <button type="button" className={estado === 'expirada' ? 'is-active' : ''} onClick={() => definirEstado('expirada')}>Expirado</button>
            </div>
          </div>
          <Link className="preview-finish" to="/editar">Concluir prévia</Link>
        </header>
      ) : null}

      <main className="public-experience__main">
        <header className="public-experience__header">
          <Link to="/" aria-label="Entrela — início"><SimboloEntrela /></Link>
          <button type="button" onClick={() => definirIdioma((valor) => valor === 'pt-AO' ? 'en' : 'pt-AO')}>
            <IconeEntrela nome="globo" />
            {idioma === 'pt-AO' ? 'PT' : 'EN'}
          </button>
        </header>

        {estado === 'carregando' ? (
          <div className="public-loading" role="status" aria-label="A preparar o momento">
            <span /><span /><span />
          </div>
        ) : null}

        {estado === 'espera' ? (
          <section className="public-message-state" aria-labelledby="waiting-title">
            <div className="public-message-state__seal" aria-hidden="true"><IconeEntrela nome="relogio" /></div>
            <p className="public-kicker">{para}</p>
            <h1 id="waiting-title">{copia.espera}</h1>
            <p>{copia.esperaDescricao(dataPorExtenso, horaDeAbertura)}</p>
            <div className="public-date-card"><strong>{diaDeAbertura}</strong><span>{mesDeAbertura}<small>{anoDeAbertura}</small></span><i>{horaDeAbertura}<br />Luanda</i></div>
          </section>
        ) : null}

        {estado === 'disponivel' ? (
          <section className="public-message-state public-message-state--available" aria-labelledby="available-title">
            <div className="public-message-state__seal" aria-hidden="true"><IconeEntrela nome="seguranca" /></div>
            <p className="public-kicker">{para}</p>
            <h1 id="available-title">{tituloDoServidor}</h1>
            <p>Este conteúdo é privado. Abre-o apenas quando estiveres pronto.</p>
            <button className="public-open-button" type="button" onClick={abrir}>Abrir este momento <span aria-hidden="true">→</span></button>
          </section>
        ) : null}

        {estado === 'expirada' ? (
          <section className="public-message-state" aria-labelledby="expired-title">
            <div className="public-message-state__seal public-message-state__seal--quiet" aria-hidden="true"><IconeEntrela nome="seguranca" /></div>
            <p className="public-kicker">Entrela</p>
            <h1 id="expired-title">{copia.expirada}</h1>
            <p>{copia.expiradaDescricao}</p>
          </section>
        ) : null}

        {estado === 'ativa' && etapaVisivel ? (
          <section className="public-story" aria-labelledby="story-title">
            <div className="public-story__progress" role="img" aria-label={modoPreVisualizacao ? `Etapa ${numeroDaEtapa} de ${etapasAtuais.length}` : `Etapa ${numeroDaEtapa}`}>
              {Array.from({ length: quantidadeDeMarcadores }, (_, indice) => <span className={indice < numeroDaEtapa ? 'is-active' : ''} key={indice} />)}
            </div>

            <div className="public-story__visual" aria-hidden="true">
              <span className="memory-frame memory-frame--back"><i /></span>
              <span className="memory-frame memory-frame--front">
                <i className="memory-sky" />
                <i className="memory-sun" />
                <i className="memory-land" />
                <small>Luanda · 2026</small>
              </span>
              <span className="public-story__thread" />
            </div>

            <article className="public-story__copy" key={`${idioma}-${etapaAtual}`}>
              <p className="public-kicker">{para} · {etapaVisivel.numero}</p>
              <h1 id="story-title">{etapaVisivel.titulo[idioma]}</h1>
              <p>{etapaVisivel.texto[idioma]}</p>
              <small>{copia.de}</small>
            </article>

            <button className="public-story__continue" type="button" onClick={avancar}>
              <span>{ultimaEtapa ? copia.concluir : copia.continuar}</span>
              <i aria-hidden="true">→</i>
            </button>
          </section>
        ) : null}

        {estado === 'concluida' ? (
          <section className="public-message-state" aria-labelledby="completed-title"><div className="public-message-state__seal" aria-hidden="true">♡</div><p className="public-kicker">{para}</p><h1 id="completed-title">Este momento fica contigo</h1><p>Podes fechar esta página com segurança. Obrigado por teres chegado até ao fim.</p></section>
        ) : null}
      </main>
    </div>
  )
}
