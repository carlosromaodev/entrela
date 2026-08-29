import type { ReactNode } from 'react'
import IconeEntrela, { type NomeDoIcone } from './IconeEntrela'

type PropriedadesDaLinha = {
  icone: NomeDoIcone
  titulo: string
  descricao?: string
  children: ReactNode
}

export default function LinhaDeDefinicao({ icone, titulo, descricao, children }: PropriedadesDaLinha) {
  return (
    <div className="definition-row">
      <span className="definition-row__icon"><IconeEntrela nome={icone} /></span>
      <span className="definition-row__copy">
        <strong>{titulo}</strong>
        {descricao ? <small>{descricao}</small> : null}
      </span>
      <span className="definition-row__control">{children}</span>
    </div>
  )
}
