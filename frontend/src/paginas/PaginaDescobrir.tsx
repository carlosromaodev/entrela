import { useState } from 'react'
import { Link } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import SimboloEntrela from '../componentes/SimboloEntrela'

type CategoriaEvento = 'todos' | 'tecnologia' | 'design' | 'encontros' | 'cultura'

type EventoDescobrir = {
  id: string
  titulo: string
  categoria: CategoriaEvento
  categoriaRotulo: string
  dataDia: string
  dataMes: string
  horario: string
  local: string
  anfitriao: string
  anfitriaoAvatar: string
  inscritos: number
  preco: string
  emDestaque?: boolean
  imagemBg?: string
}

const eventosLista: EventoDescobrir[] = [
  {
    id: 'encontro-anual-2026',
    titulo: 'Encontro Anual Entrela 2026',
    categoria: 'tecnologia',
    categoriaRotulo: 'Tecnologia & Produto',
    dataDia: '28',
    dataMes: 'OUT',
    horario: '09:00',
    local: 'Centro de Convenções, Talatona · Luanda',
    anfitriao: 'Entrela & Ponte Eventos',
    anfitriaoAvatar: 'E',
    inscritos: 287,
    preco: 'Grátis / 5.000 Kz',
    emDestaque: true,
  },
  {
    id: 'design-product-luanda',
    titulo: 'Design & Product Meetup Luanda',
    categoria: 'design',
    categoriaRotulo: 'Design & UX',
    dataDia: '05',
    dataMes: 'NOV',
    horario: '18:00',
    local: 'Hub de Inovação, Miramar · Luanda',
    anfitriao: 'Luanda Design Community',
    anfitriaoAvatar: 'D',
    inscritos: 94,
    preco: 'Grátis',
  },
  {
    id: 'ai-innovation-forum',
    titulo: 'AI & Innovation Forum Angola',
    categoria: 'tecnologia',
    categoriaRotulo: 'Tecnologia',
    dataDia: '12',
    dataMes: 'NOV',
    horario: '14:00',
    local: 'Hotel Epic Sana · Luanda',
    anfitriao: 'TechAngola & Parceiros',
    anfitriaoAvatar: 'T',
    inscritos: 180,
    preco: '10.000 Kz',
  },
  {
    id: 'noite-de-poesia-e-musica',
    titulo: 'Noite de Poesia & Música ao Vivo',
    categoria: 'cultura',
    categoriaRotulo: 'Cultura & Arte',
    dataDia: '19',
    dataMes: 'NOV',
    horario: '19:30',
    local: 'Espaço Cultural Camões · Luanda',
    anfitriao: 'Colectivo Arte Viva',
    anfitriaoAvatar: 'A',
    inscritos: 65,
    preco: '3.000 Kz',
  },
  {
    id: 'workshop-marcas-com-proposito',
    titulo: 'Workshop: Marcas com Propósito',
    categoria: 'encontros',
    categoriaRotulo: 'Networking',
    dataDia: '26',
    dataMes: 'NOV',
    horario: '10:00',
    local: 'Edifício Kilamba · Luanda',
    anfitriao: 'Cavinova Brand Studio',
    anfitriaoAvatar: 'C',
    inscritos: 42,
    preco: 'Grátis',
  },
]

export default function PaginaDescobrir() {
  const [categoriaAtiva, definirCategoriaAtiva] = useState<CategoriaEvento>('todos')
  const [busca, definirBusca] = useState<string>('')

  const eventosFiltrados = eventosLista.filter((e) => {
    const combinaCategoria = categoriaAtiva === 'todos' || e.categoria === categoriaAtiva
    const combinaBusca = !busca || e.titulo.toLowerCase().includes(busca.toLowerCase()) || e.local.toLowerCase().includes(busca.toLowerCase())
    return combinaCategoria && combinaBusca
  })

  const eventoEmDestaque = eventosLista.find((e) => e.emDestaque) ?? eventosLista[0]

  return (
    <div className="discover-page">
      <header className="discover-header">
        <div className="discover-header__inner">
          <div className="discover-header__brand">
            <Link to="/" aria-label="Entrela — Início"><SimboloEntrela /></Link>
            <span className="discover-header__title">Descobrir</span>
          </div>
          <nav className="discover-header__nav">
            <Link to="/" className="discover-nav-link">Início</Link>
            <Link to="/descobrir" className="discover-nav-link is-active">Eventos</Link>
            <Link to="/painel" className="discover-nav-link">Painel</Link>
          </nav>
          <div className="discover-header__actions">
            <Link to="/entrar" className="soft-button">Entrar</Link>
            <Link to="/rascunho" className="dark-button">+ Criar evento</Link>
          </div>
        </div>
      </header>

      <main className="discover-main">
        <section className="discover-hero">
          <div className="discover-hero__copy">
            <span className="discover-eyebrow">Descobrir experiências · Inspirado por Luma</span>
            <h1>Encontra eventos memoráveis perto de ti.</h1>
            <p>Conecta-te com comunidades, workshops, conferências e encontros culturais em Luanda e online.</p>

            <div className="discover-search-bar">
              <IconeEntrela nome="olho" />
              <input
                type="text"
                placeholder="Pesquisar eventos, tópicos ou locais..."
                value={busca}
                onChange={(e) => definirBusca(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Featured Spotlight Card */}
        <section className="discover-featured-section">
          <span className="discover-section-title">⭐ Em Destaque</span>
          <div className="featured-card">
            <div className="featured-card__visual">
              <div className="date-badge">
                <strong className="date-badge__day">{eventoEmDestaque.dataDia}</strong>
                <span className="date-badge__month">{eventoEmDestaque.dataMes}</span>
              </div>
              <span className="category-chip">{eventoEmDestaque.categoriaRotulo}</span>
            </div>

            <div className="featured-card__info">
              <div className="featured-card__host">
                <span className="host-avatar">{eventoEmDestaque.anfitriaoAvatar}</span>
                <span>Organizado por <strong>{eventoEmDestaque.anfitriao}</strong></span>
              </div>
              <h2>{eventoEmDestaque.titulo}</h2>
              <p className="featured-card__location"><IconeEntrela nome="globo" /> {eventoEmDestaque.local}</p>
              <div className="featured-card__footer">
                <span className="attendee-count">🔥 {eventoEmDestaque.inscritos} pessoas inscritas</span>
                <Link to={`/eventos/${eventoEmDestaque.id}`} className="dark-button">
                  Ver evento e bilhetes →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="discover-grid-section">
          <div className="discover-filters">
            <button
              type="button"
              className={`filter-btn ${categoriaAtiva === 'todos' ? 'is-active' : ''}`}
              onClick={() => definirCategoriaAtiva('todos')}
            >
              Todos os eventos
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaAtiva === 'tecnologia' ? 'is-active' : ''}`}
              onClick={() => definirCategoriaAtiva('tecnologia')}
            >
              Tecnologia & AI
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaAtiva === 'design' ? 'is-active' : ''}`}
              onClick={() => definirCategoriaAtiva('design')}
            >
              Design & UX
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaAtiva === 'encontros' ? 'is-active' : ''}`}
              onClick={() => definirCategoriaAtiva('encontros')}
            >
              Networking
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaAtiva === 'cultura' ? 'is-active' : ''}`}
              onClick={() => definirCategoriaAtiva('cultura')}
            >
              Cultura & Arte
            </button>
          </div>

          <div className="discover-grid">
            {eventosFiltrados.map((evento) => (
              <Link to={`/eventos/${evento.id}`} key={evento.id} className="event-grid-card">
                <div className="event-grid-card__top">
                  <div className="date-badge date-badge--small">
                    <strong className="date-badge__day">{evento.dataDia}</strong>
                    <span className="date-badge__month">{evento.dataMes}</span>
                  </div>
                  <span className="price-badge">{evento.preco}</span>
                </div>

                <div className="event-grid-card__body">
                  <span className="category-tag">{evento.categoriaRotulo}</span>
                  <h3>{evento.titulo}</h3>
                  <p className="event-grid-card__time">{evento.horario} · {evento.local}</p>
                </div>

                <div className="event-grid-card__footer">
                  <div className="host-mini">
                    <span className="host-avatar host-avatar--small">{evento.anfitriaoAvatar}</span>
                    <small>{evento.anfitriao}</small>
                  </div>
                  <span className="attendee-mini">{evento.inscritos} inscritos</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="discover-footer">
        <div className="discover-footer__inner">
          <div>
            <strong>Entrela Descobrir</strong>
            <p>Experiências que conectam momentos, pessoas e comunidades.</p>
          </div>
          <div className="discover-footer__links">
            <Link to="/">Início</Link>
            <Link to="/descobrir">Eventos</Link>
            <Link to="/painel">Painel de Criador</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
