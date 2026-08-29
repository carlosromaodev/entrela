import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import IconeEntrela from './IconeEntrela'
import SimboloEntrela from './SimboloEntrela'

type PropriedadesDoCabecalhoInterno = {
  transparente?: boolean
}

export default function CabecalhoInterno({ transparente = false }: PropriedadesDoCabecalhoInterno) {
  const [notificacoesAbertas, definirNotificacoesAbertas] = useState(false)

  useEffect(() => {
    if (!notificacoesAbertas) return
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') definirNotificacoesAbertas(false)
    }
    window.addEventListener('keydown', fecharComEscape)
    return () => window.removeEventListener('keydown', fecharComEscape)
  }, [notificacoesAbertas])

  return (
    <header className={`internal-header${transparente ? ' internal-header--transparent' : ''}`}>
      <Link className="internal-brand" to="/painel" aria-label="Entrela — painel">
        <SimboloEntrela />
        <span>Entrela</span>
      </Link>

      <nav className="internal-nav" aria-label="Navegação principal">
        <NavLink to="/painel" end>
          <IconeEntrela nome="calendario" />
          <span>Momentos</span>
        </NavLink>
        <Link to="/painel?vista=biblioteca">
          <IconeEntrela nome="camadas" />
          <span>Biblioteca</span>
        </Link>
        <Link to="/painel?vista=destinatarios">
          <IconeEntrela nome="destinatario" />
          <span>Destinatários</span>
        </Link>
      </nav>

      <div className="internal-actions">
        <span className="internal-time" aria-label="Fuso horário">Luanda · GMT+1</span>
        <Link className="internal-create-link" to="/rascunho" aria-label="Criar momento">
          <IconeEntrela nome="adicionar" />
          <span>Criar momento</span>
        </Link>
        <span className="internal-popover-anchor">
          <button className="internal-icon-button" type="button" aria-label="Notificações" aria-expanded={notificacoesAbertas} aria-controls="notificacoes-internas" onClick={() => definirNotificacoesAbertas((abertas) => !abertas)}>
            <IconeEntrela nome="sino" />
          </button>
          {notificacoesAbertas ? (
            <aside className="internal-notifications" id="notificacoes-internas" aria-label="Notificações recentes">
              <span className="internal-notifications__icon"><IconeEntrela nome="sino" /></span>
              <strong>Está tudo tranquilo</strong>
              <p>Aberturas agendadas, respostas e alertas importantes aparecerão aqui.</p>
              <Link to="/configuracoes/preferencias" onClick={() => definirNotificacoesAbertas(false)}>Gerir notificações</Link>
            </aside>
          ) : null}
        </span>
        <Link className="internal-avatar" to="/configuracoes" aria-label="Abrir configurações">CR</Link>
      </div>
    </header>
  )
}
