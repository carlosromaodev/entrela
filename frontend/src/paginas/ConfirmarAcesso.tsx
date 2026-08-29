import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SimboloEntrela from '../componentes/SimboloEntrela'
import { confirmarDesafioDeAutenticacao } from '../lib/cliente-http'

const confirmacoesEmCurso = new Map<string, ReturnType<typeof confirmarDesafioDeAutenticacao>>()

function confirmarUmaVez(token: string) {
  const existente = confirmacoesEmCurso.get(token)
  if (existente) return existente
  const pedido = confirmarDesafioDeAutenticacao(token)
  confirmacoesEmCurso.set(token, pedido)
  return pedido
}

export default function ConfirmarAcesso() {
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const [estado, definirEstado] = useState<'a-confirmar' | 'invalido'>('a-confirmar')
  const token = parametros.get('token')

  useEffect(() => {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      definirEstado('invalido')
      return
    }
    confirmarUmaVez(token)
      .then(() => navegar('/painel', { replace: true }))
      .catch(() => definirEstado('invalido'))
  }, [navegar, token])

  return (
    <main className="auth-confirm-page">
      <Link className="auth-confirm-brand" to="/" aria-label="Entrela — início"><SimboloEntrela /><span>Entrela</span></Link>
      <section className="auth-confirm-card" aria-live="polite">
        {estado === 'a-confirmar' ? <><span className="auth-confirm-loader" aria-hidden="true"><i /><i /><i /></span><h1>A abrir o teu espaço</h1><p>Estamos a validar esta ligação de acesso.</p></> : <><span className="auth-confirm-error" aria-hidden="true">!</span><h1>Esta ligação não é válida</h1><p>Pode ter expirado ou já ter sido utilizada. Pede uma nova ligação para continuar.</p><Link className="dark-button" to="/entrar">Pedir nova ligação</Link></>}
      </section>
    </main>
  )
}
