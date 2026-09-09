import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import SimboloEntrela from '../componentes/SimboloEntrela'
import ModalEntrela from '../componentes/ModalEntrela'

type Bilhete = {
  id: string
  nome: string
  descricao: string
  preco: string
  disponiveis: number
}

const bilhetesDemonstracao: Bilhete[] = [
  {
    id: 'early-bird',
    nome: 'Early Bird',
    descricao: 'Acesso completo ao recinto principal e sessões gerais.',
    preco: 'Grátis',
    disponiveis: 12,
  },
  {
    id: 'standard',
    nome: 'Standard',
    descricao: 'Entrada geral, kit de boas-vindas e acesso à área de networking.',
    preco: '5.000 Kz',
    disponiveis: 45,
  },
  {
    id: 'vip',
    nome: 'VIP / Parceiro',
    descricao: 'Acesso reservado à zona VIP, sessões exclusivas com oradores e jantar de networking.',
    preco: '15.000 Kz',
    disponiveis: 8,
  },
]

const agendaDemonstracao = [
  { hora: '09:00', titulo: 'Abertura de portas e credenciação', orador: 'Equipa de Acolhimento' },
  { hora: '10:00', titulo: 'Painel Principal: O futuro dos momentos físicos e digitais', orador: 'Carlos Romão & Convidados' },
  { hora: '11:30', titulo: 'Sessão Interactiva: Criar experiências memoráveis com Entrela', orador: 'Equipa de Design Entrela' },
  { hora: '13:00', titulo: 'Almoço e Networking no Lounge VIP', orador: 'Todos os Participantes' },
]

export default function PaginaDeEvento() {
  const { id } = useParams<{ id: string }>()
  const [bilheteSelecionado, definirBilheteSelecionado] = useState<string>('standard')
  const [quantidade, definirQuantidade] = useState<number>(1)
  const [nome, definirNome] = useState<string>('')
  const [email, definirEmail] = useState<string>('')
  const [modalAberto, definirModalAberto] = useState<boolean>(false)
  const [sucesso, definirSucesso] = useState<boolean>(false)

  const bilheteAtual = bilhetesDemonstracao.find((b) => b.id === bilheteSelecionado) ?? bilhetesDemonstracao[1]

  const submeterInscricao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !email) return
    definirSucesso(true)
  }

  return (
    <div className="event-public-page">
      <header className="event-header">
        <div className="event-header__inner">
          <Link to="/" aria-label="Entrela — Início"><SimboloEntrela /></Link>
          <div className="event-header__actions">
            <Link to="/entrar" className="soft-button">Entrar</Link>
            <Link to="/rascunho" className="dark-button">Criar evento</Link>
          </div>
        </div>
      </header>

      <main className="event-main">
        <div className="event-hero">
          <div className="event-hero__cover">
            <span className="event-hero__badge">Entrela Eventos · {id ? `ID: ${id.slice(0, 8)}` : 'Edição Especial'}</span>
            <h1>Encontro Anual Entrela 2026</h1>
            <p className="event-hero__subtitle">Transformar momentos físicos em experiências digitais vivas em Angola e no mundo.</p>
          </div>
        </div>

        <div className="event-layout">
          <section className="event-content">
            <div className="event-meta-card">
              <div className="event-meta-item">
                <IconeEntrela nome="relogio" />
                <div>
                  <strong>Quarta-feira, 28 de Outubro de 2026</strong>
                  <span>09:00 — 17:00 (Fuso de Luanda, Africa/Luanda)</span>
                </div>
              </div>
              <div className="event-meta-item">
                <IconeEntrela nome="globo" />
                <div>
                  <strong>Centro de Convenções de Luanda</strong>
                  <span>Talatona, Luanda · Angola</span>
                </div>
              </div>
              <div className="event-meta-item">
                <IconeEntrela nome="seguranca" />
                <div>
                  <strong>Organizado por</strong>
                  <span>Ponte Eventos & Entrela Tecnologia</span>
                </div>
              </div>
            </div>

            <div className="event-section">
              <h2>Sobre este evento</h2>
              <p>
                O Encontro Anual Entrela reúne criadores, agências, parceiros e organizadores para explorar a interseção entre o mundo físico e digital.
                Durante um dia intensivo de apresentações, sessões práticas e networking, vais descobrir como a camada de tempo, regras e resposta do motor Entrela
                revoluciona convites, presentes, marcas e eventos.
              </p>
            </div>

            <div className="event-section">
              <h2>Programa e Agenda</h2>
              <div className="event-agenda">
                {agendaDemonstracao.map((item, index) => (
                  <div key={index} className="event-agenda__item">
                    <span className="event-agenda__time">{item.hora}</span>
                    <div className="event-agenda__info">
                      <strong>{item.titulo}</strong>
                      <small>{item.orador}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="event-sidebar">
            <div className="event-ticket-card">
              <div className="event-ticket-card__header">
                <span className="status-pill status-pill--active">Inscrições Abertas</span>
                <span className="price-tag">{bilheteAtual.preco}</span>
              </div>

              <h3>Garante o teu bilhete</h3>
              <p className="ticket-desc">{bilheteAtual.descricao}</p>

              <div className="ticket-selector">
                <label className="field-label">Tipo de Ingresso</label>
                <div className="ticket-options">
                  {bilhetesDemonstracao.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`ticket-option ${bilheteSelecionado === b.id ? 'is-selected' : ''}`}
                      onClick={() => definirBilheteSelecionado(b.id)}
                    >
                      <div>
                        <strong>{b.nome}</strong>
                        <small>{b.disponiveis} vagas restantes</small>
                      </div>
                      <span>{b.preco}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ticket-quantity">
                <label className="field-label" htmlFor="qtd">Quantidade</label>
                <select
                  id="qtd"
                  className="select-input"
                  value={quantidade}
                  onChange={(e) => definirQuantidade(Number(e.target.value))}
                >
                  <option value={1}>1 bilhete</option>
                  <option value={2}>2 bilhetes</option>
                  <option value={3}>3 bilhetes</option>
                  <option value={5}>5 bilhetes</option>
                </select>
              </div>

              <button
                type="button"
                className="primary-wide-button"
                onClick={() => definirModalAberto(true)}
              >
                Garantir inscrição ({bilheteAtual.preco})
              </button>
            </div>
          </aside>
        </div>
      </main>

      <ModalEntrela
        aberto={modalAberto}
        titulo={sucesso ? 'Inscrição Confirmada! 🎉' : 'Confirmar Inscrição no Evento'}
        descricao={
          sucesso
            ? `Enviámos a tua credencial com QR Code para ${email}.`
            : `A reservar ${quantidade}x ${bilheteAtual.nome} (${bilheteAtual.preco}).`
        }
        onFechar={() => {
          definirModalAberto(false)
          definirSucesso(false)
        }}
      >
        {sucesso ? (
          <div className="ticket-success-view">
            <div className="publish-qr" role="img" aria-label="Credencial QR"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <p><strong>A tua credencial digital foi emitida.</strong> Apresenta este QR Code à entrada do recinto para check-in instantâneo.</p>
            <button type="button" className="dark-button" onClick={() => definirModalAberto(false)}>Concluído</button>
          </div>
        ) : (
          <form className="event-checkout-form" onSubmit={submeterInscricao}>
            <label className="form-field">
              <span>Nome completo</span>
              <input
                type="text"
                required
                placeholder="Ex: Ana Maria Silva"
                value={nome}
                onChange={(e) => definirNome(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Endereço de e-mail</span>
              <input
                type="email"
                required
                placeholder="ana@exemplo.ao"
                value={email}
                onChange={(e) => definirEmail(e.target.value)}
              />
            </label>
            <div className="checkout-summary">
              <div><span>Total:</span><strong>{bilheteAtual.preco}</strong></div>
              <small>Check-in por QR Code no dia do evento. Política de cancelamento flexível.</small>
            </div>
            <button type="submit" className="dark-button full-width">Concluir inscrição →</button>
          </form>
        )}
      </ModalEntrela>
    </div>
  )
}
