import type { ReactNode } from 'react'
import CabecalhoInterno from './CabecalhoInterno'

type PropriedadesDoLayoutInterno = {
  children: ReactNode
  className?: string
  cabecalhoTransparente?: boolean
}

export default function LayoutInterno({
  children,
  className = '',
  cabecalhoTransparente = false,
}: PropriedadesDoLayoutInterno) {
  return (
    <div className={`internal-page${className ? ` ${className}` : ''}`}>
      <a className="skip-link" href="#conteudo-interno">Saltar para o conteúdo</a>
      <CabecalhoInterno transparente={cabecalhoTransparente} />
      {children}
    </div>
  )
}
