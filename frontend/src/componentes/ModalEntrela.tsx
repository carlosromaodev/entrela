import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

type PropriedadesDoModal = {
  aberto: boolean
  children: ReactNode
  descricao?: string
  rodape?: ReactNode
  titulo: string
  onFechar: () => void
}

export default function ModalEntrela({ aberto, children, descricao, rodape, titulo, onFechar }: PropriedadesDoModal) {
  const idDoTitulo = useId()
  const idDaDescricao = useId()
  const painel = useRef<HTMLDivElement>(null)
  const fecharAtual = useRef(onFechar)
  fecharAtual.current = onFechar

  useEffect(() => {
    if (!aberto) return
    const elementoAnterior = document.activeElement as HTMLElement | null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => painel.current?.querySelector<HTMLElement>('button, input, select, textarea, [href]')?.focus(), 0)

    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') fecharAtual.current()
    }
    window.addEventListener('keydown', fecharComEscape)
    return () => {
      window.removeEventListener('keydown', fecharComEscape)
      document.body.style.overflow = overflowAnterior
      elementoAnterior?.focus()
    }
  }, [aberto])

  if (!aberto) return null

  return createPortal(
    <div className="modal-layer" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) onFechar() }}>
      <div className="entrela-modal" role="dialog" aria-modal="true" aria-labelledby={idDoTitulo} aria-describedby={descricao ? idDaDescricao : undefined} ref={painel}>
        <header className="entrela-modal__header">
          <div><h2 id={idDoTitulo}>{titulo}</h2>{descricao ? <p id={idDaDescricao}>{descricao}</p> : null}</div>
          <button type="button" onClick={onFechar} aria-label="Fechar">×</button>
        </header>
        <div className="entrela-modal__body">{children}</div>
        {rodape ? <footer className="entrela-modal__footer">{rodape}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
