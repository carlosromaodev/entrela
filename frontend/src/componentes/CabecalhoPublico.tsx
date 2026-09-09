import { Link } from 'react-router-dom'
import MarcaEntrela from './MarcaEntrela'

type LigacaoDoCabecalho = {
  destino: string
  rotulo: string
}

type PropriedadesDoCabecalhoPublico = {
  acaoPrincipal: LigacaoDoCabecalho
  acaoSecundaria?: LigacaoDoCabecalho
}

export default function CabecalhoPublico({
  acaoPrincipal,
  acaoSecundaria,
}: PropriedadesDoCabecalhoPublico) {
  return (
    <header className="site-header" aria-label="Navegação principal">
      <MarcaEntrela />

      <nav className="site-header__actions" aria-label="Ações da conta">
        <Link className="header-secondary-action" to="/descobrir">
          Descobrir
        </Link>
        {acaoSecundaria ? (
          <Link className="header-secondary-action" to={acaoSecundaria.destino}>
            {acaoSecundaria.rotulo}
          </Link>
        ) : null}
        <Link className="header-action" to={acaoPrincipal.destino}>
          {acaoPrincipal.rotulo}
        </Link>
      </nav>
    </header>
  )
}
