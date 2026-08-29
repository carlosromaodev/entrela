import { type FormEvent, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import CabecalhoPublico from '../componentes/CabecalhoPublico'
import SimboloEntrela from '../componentes/SimboloEntrela'
import { solicitarDesafioDeAutenticacao } from '../lib/cliente-http'

type EstadoDoFormulario = 'inicial' | 'invalido' | 'a-enviar' | 'enviado' | 'erro'

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PaginaDeLogin() {
  const idDoEmail = useId()
  const idDaMensagem = useId()
  const [email, definirEmail] = useState('')
  const [estado, definirEstado] = useState<EstadoDoFormulario>('inicial')

  const continuarComEmail = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (!emailValido.test(email.trim())) {
      definirEstado('invalido')
      return
    }

    definirEstado('a-enviar')
    try {
      await solicitarDesafioDeAutenticacao(email.trim())
      definirEstado('enviado')
    } catch {
      definirEstado('erro')
    }
  }

  return (
    <div className="auth-page">
      <a className="skip-link" href="#formulario-de-acesso">Saltar para o formulário</a>

      <CabecalhoPublico
        acaoSecundaria={{ destino: '/#possibilidades', rotulo: 'Ver possibilidades' }}
        acaoPrincipal={{ destino: '/', rotulo: 'Início' }}
      />

      <main className="auth-main">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card__intro">
            <span className="auth-card__symbol" aria-hidden="true">
              <SimboloEntrela />
            </span>
            <h1 id="auth-title">Bem-vindo à Entrela</h1>
            <p>Inicia sessão ou cria a tua conta para continuar.</p>
          </div>

          {estado === 'enviado' ? (
            <div className="auth-success" role="status" aria-live="polite">
              <span className="auth-success__icon" aria-hidden="true">✓</span>
              <h2>Verifica o teu email</h2>
              <p>Preparámos o acesso para <strong>{email.trim()}</strong>.</p>
              <button className="auth-text-button" type="button" onClick={() => definirEstado('inicial')}>
                Usar outro email
              </button>
            </div>
          ) : (
            <form id="formulario-de-acesso" className="auth-form" onSubmit={continuarComEmail} noValidate>
              <div className="auth-label-row">
                <label htmlFor={idDoEmail}>Email</label>
                <button className="auth-mode-switch" type="button" disabled title="Acesso por telemóvel em breve">
                  Usar telemóvel
                </button>
              </div>

              <input
                id={idDoEmail}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                aria-invalid={estado === 'invalido' || estado === 'erro'}
                aria-describedby={estado === 'invalido' || estado === 'erro' ? idDaMensagem : undefined}
                onChange={(evento) => {
                  definirEmail(evento.target.value)
                  if (estado === 'invalido') definirEstado('inicial')
                }}
              />

              {estado === 'invalido' ? (
                <p className="auth-field-error" id={idDaMensagem} role="alert">
                  Introduz um endereço de email válido.
                </p>
              ) : null}

              {estado === 'erro' ? <p className="auth-field-error" id={idDaMensagem} role="alert">Não foi possível contactar o serviço. Confirma se o backend está ativo e tenta novamente.</p> : null}

              <button className="auth-primary-button" type="submit" disabled={estado === 'a-enviar'}>
                {estado === 'a-enviar' ? 'A preparar ligação…' : 'Continuar com email'}
              </button>
            </form>
          )}

          <div className="auth-alternatives" aria-label="Outras formas de acesso">
            <button type="button" disabled>
              <span className="auth-provider-mark" aria-hidden="true">G</span>
              Continuar com Google
              <small>Em breve</small>
            </button>
            <button type="button" disabled>
              <span aria-hidden="true">◇</span>
              Usar chave de acesso
              <small>Em breve</small>
            </button>
          </div>
        </section>

        <p className="auth-legal">
          Ao continuar, aceitas os <Link to="/termos">Termos</Link> e a{' '}
          <Link to="/privacidade">Política de Privacidade</Link> da Entrela.
        </p>
      </main>
    </div>
  )
}
