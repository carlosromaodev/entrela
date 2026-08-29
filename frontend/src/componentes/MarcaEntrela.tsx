import { Link } from 'react-router-dom'
import SimboloEntrela from './SimboloEntrela'

type PropriedadesDaMarcaEntrela = {
  destino?: string
  className?: string
}

export default function MarcaEntrela({
  destino = '/',
  className = '',
}: PropriedadesDaMarcaEntrela) {
  return (
    <Link
      className={`brand-mark${className ? ` ${className}` : ''}`}
      to={destino}
      aria-label="Entrela — início"
    >
      <SimboloEntrela className="brand-mark__symbol" />
      <span className="brand-mark__wordmark" aria-hidden="true">Entrela</span>
    </Link>
  )
}
