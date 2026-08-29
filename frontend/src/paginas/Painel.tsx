import { Link, useSearchParams } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import LayoutInterno from '../componentes/LayoutInterno'
import { useFluxoDoMomento } from '../contextos/FluxoDoMomento'
import type { RascunhoDoMomentoNoFrontend } from '../dominio/regras-do-momento'

type VistaDoPainel = 'momentos' | 'biblioteca' | 'destinatarios'

const modelos = [
  { nome: 'Carta íntima', descricao: 'Uma mensagem que se revela com calma.', cor: 'mauve' },
  { nome: 'Memórias', descricao: 'Fotografias, áudio e pequenos capítulos.', cor: 'violet' },
  { nome: 'Celebração', descricao: 'Uma experiência luminosa para uma data especial.', cor: 'amber' },
]

function EstadoVazio() {
  return (
    <section className="dashboard-empty" aria-labelledby="empty-title">
      <div className="dashboard-empty__illustration" aria-hidden="true">
        <span className="dashboard-empty__thread" />
        <IconeEntrela nome="calendario" />
        <span className="dashboard-empty__count">0</span>
      </div>
      <h2 id="empty-title">O teu primeiro momento começa aqui</h2>
      <p>Cria uma experiência privada para alguém especial e decide quando ela se revela.</p>
      <Link className="soft-button" to="/rascunho">
        <IconeEntrela nome="adicionar" />
        Criar momento
      </Link>
    </section>
  )
}

function MomentoGuardado({ momento }: { momento: RascunhoDoMomentoNoFrontend }) {
  return (
    <section className="moment-list" aria-labelledby="moment-list-title">
      <div className="section-heading">
        <div><p className="eyebrow">Mais recente</p><h2 id="moment-list-title">Continua de onde paraste</h2></div>
        <p>O conteúdo permanece privado enquanto preparas a experiência.</p>
      </div>
      <article className="moment-card">
        <Link className="moment-card__cover" to="/editar" style={{ backgroundColor: momento.capa?.tipo === 'COR' ? momento.capa.corHexadecimal : '#D8BFD8' }}>
          <span>Para</span><strong>{momento.destinatario || 'alguém especial'}</strong><i aria-hidden="true" />
        </Link>
        <div className="moment-card__content">
          <div><span className={`status-pill status-pill--${momento.estado.toLowerCase()}`}>{momento.estado === 'PUBLICADA' ? 'Publicado' : 'Rascunho'}</span><small>Atualizado agora</small></div>
          <h3>{momento.titulo}</h3>
          <p>{momento.etapas.length} etapas · {momento.modeloEditorial === 'CARTA_INTIMA' ? 'Carta íntima' : momento.modeloEditorial === 'MEMORIAS' ? 'Memórias' : 'Celebração'}</p>
          <div className="moment-card__actions"><Link className="dark-button" to="/editar">{momento.estado === 'PUBLICADA' ? 'Gerir momento' : 'Continuar a editar'}</Link><Link className="soft-button" to="/pre-visualizacao"><IconeEntrela nome="olho" /> Pré-visualizar</Link></div>
        </div>
      </article>
    </section>
  )
}

function Biblioteca() {
  return (
    <section className="dashboard-library" aria-labelledby="library-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Pontos de partida</p>
          <h2 id="library-title">Escolhe um ritmo para a história</h2>
        </div>
        <p>Cada modelo pode ser alterado por completo no editor.</p>
      </div>
      <div className="template-grid">
        {modelos.map((modelo, indice) => (
          <Link className={`template-card template-card--${modelo.cor}`} to="/rascunho" key={modelo.nome}>
            <span className="template-card__number">0{indice + 1}</span>
            <span className="template-card__art" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="template-card__copy">
              <strong>{modelo.nome}</strong>
              <small>{modelo.descricao}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Destinatarios() {
  return (
    <section className="recipient-empty" aria-labelledby="recipient-title">
      <span className="recipient-empty__portrait" aria-hidden="true">♡</span>
      <div>
        <p className="eyebrow">Laços</p>
        <h2 id="recipient-title">As pessoas aparecem à medida que crias</h2>
        <p>Os destinatários e colaboradores ficam organizados num só lugar, sem expor os seus dados publicamente.</p>
        <Link className="textual-action" to="/rascunho">Criar para alguém <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  )
}

export default function Painel() {
  const { rascunho } = useFluxoDoMomento()
  const [parametros, definirParametros] = useSearchParams()
  const valor = parametros.get('vista')
  const vista: VistaDoPainel = valor === 'biblioteca' || valor === 'destinatarios' ? valor : 'momentos'

  const mudarVista = (proximaVista: VistaDoPainel) => {
    if (proximaVista === 'momentos') definirParametros({})
    else definirParametros({ vista: proximaVista })
  }

  return (
    <LayoutInterno>
      <main className="dashboard-main" id="conteudo-interno">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">O teu espaço</p>
            <h1>{vista === 'momentos' ? 'Momentos' : vista === 'biblioteca' ? 'Biblioteca' : 'Destinatários'}</h1>
          </div>
          <div className="segmented-control" aria-label="Mudar vista">
            {(['momentos', 'biblioteca', 'destinatarios'] as VistaDoPainel[]).map((item) => (
              <button
                type="button"
                key={item}
                className={vista === item ? 'is-active' : ''}
                aria-pressed={vista === item}
                onClick={() => mudarVista(item)}
              >
                {item === 'momentos' ? 'Momentos' : item === 'biblioteca' ? 'Modelos' : 'Pessoas'}
              </button>
            ))}
          </div>
        </div>

        {vista === 'momentos' ? (rascunho ? <MomentoGuardado momento={rascunho} /> : <EstadoVazio />) : null}
        {vista === 'biblioteca' ? <Biblioteca /> : null}
        {vista === 'destinatarios' ? <Destinatarios /> : null}

        <footer className="internal-footer">
          <span className="internal-footer__mark" aria-hidden="true">✦</span>
          <Link to="/#possibilidades">Descobrir</Link>
          <Link to="/configuracoes">Configurações</Link>
          <Link to="/">Página pública</Link>
          <span className="internal-footer__space" />
          <span>Feito com cuidado em Angola</span>
        </footer>
      </main>
    </LayoutInterno>
  )
}
