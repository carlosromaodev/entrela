import { type FormEvent, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import LayoutInterno from '../componentes/LayoutInterno'
import LinhaDeDefinicao from '../componentes/LinhaDeDefinicao'
import ModalEntrela from '../componentes/ModalEntrela'
import { terminarSessao } from '../lib/cliente-http'

type SecaoDasConfiguracoes = 'conta' | 'preferencias' | 'privacidade'

function AvisoGuardado({ visivel }: { visivel: boolean }) {
  return (
    <span className={`settings-saved${visivel ? ' settings-saved--visible' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">✓</span> Guardado neste dispositivo
    </span>
  )
}

function Conta() {
  const [guardado, definirGuardado] = useState(false)
  const [gestaoDeSessaoAberta, definirGestaoDeSessaoAberta] = useState(false)
  const [aTerminar, definirATerminar] = useState(false)
  const [erroDaSessao, definirErroDaSessao] = useState<string | null>(null)
  const navegar = useNavigate()

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const dados = Object.fromEntries(new FormData(evento.currentTarget))
    window.localStorage.setItem('entrela:perfil-local:v1', JSON.stringify(dados))
    definirGuardado(true)
    window.setTimeout(() => definirGuardado(false), 2600)
  }

  const sair = async () => {
    definirATerminar(true)
    definirErroDaSessao(null)
    try {
      await terminarSessao()
      window.sessionStorage.removeItem('entrela:rascunho-do-momento:v1')
      navegar('/entrar', { replace: true })
    } catch {
      definirErroDaSessao('Não foi possível terminar a sessão com segurança. Tenta novamente.')
    } finally {
      definirATerminar(false)
    }
  }

  return (
    <form className="settings-content" onSubmit={guardar}>
      <section className="settings-section" aria-labelledby="profile-title">
        <div className="settings-section__heading">
          <div><p className="eyebrow">Identidade</p><h2 id="profile-title">O teu perfil</h2></div>
          <p>Estas informações aparecem apenas quando escolhes assinar uma experiência.</p>
        </div>
        <div className="profile-grid">
          <div className="profile-fields">
            <div className="field-pair">
              <label>Nome<input name="nome" defaultValue="Carlos" autoComplete="given-name" /></label>
              <label>Sobrenome<input name="sobrenome" defaultValue="Romão" autoComplete="family-name" /></label>
            </div>
            <label>Nome de utilizador<span className="prefixed-input"><i>@</i><input name="utilizador" placeholder="o_teu_nome" autoComplete="username" /></span></label>
            <label>Bio<textarea name="bio" placeholder="Conta um pouco sobre o que gostas de criar." rows={3} /></label>
          </div>
          <div className="profile-photo">
            <span>Foto de perfil</span>
            <button type="button" aria-label="Alterar foto de perfil" disabled title="O upload de avatar aguarda o contrato da API de perfis.">
              <span className="profile-avatar">CR</span>
              <i><IconeEntrela nome="imagem" /></i>
            </button>
            <small>JPG ou PNG · até 5 MB</small>
          </div>
        </div>
        <div className="settings-actions">
          <button className="dark-button" type="submit">Guardar alterações</button>
          <AvisoGuardado visivel={guardado} />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="email-title">
        <div className="settings-section__heading settings-section__heading--row">
          <div><p className="eyebrow">Contacto</p><h2 id="email-title">Email</h2></div>
          <button className="soft-button" type="button" disabled title="A gestão de emails aguarda o contrato da API de identidade."><IconeEntrela nome="adicionar" /> Adicionar email</button>
        </div>
        <div className="setting-card setting-card--email">
          <div><strong>carlos@exemplo.ao</strong><span className="status-pill">Principal</span><small>Usado para iniciar sessão e receber atualizações importantes.</small></div>
          <button type="button" aria-label="Ações do email" disabled title="A gestão de emails ainda não está disponível.">•••</button>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="security-title">
        <div className="settings-section__heading"><div><p className="eyebrow">Proteção</p><h2 id="security-title">Acesso e segurança</h2></div></div>
        <div className="setting-card definition-stack">
          <LinhaDeDefinicao icone="seguranca" titulo="Chave de acesso" descricao="Entra com biometria, sem palavras-passe."><button type="button" disabled title="Passkeys aguardam o contrato WebAuthn do backend.">Adicionar</button></LinhaDeDefinicao>
          <LinhaDeDefinicao icone="relogio" titulo="Sessões ativas" descricao="Este dispositivo · Luanda, AO"><button type="button" onClick={() => definirGestaoDeSessaoAberta(true)}>Gerir</button></LinhaDeDefinicao>
        </div>
      </section>

      <ModalEntrela aberto={gestaoDeSessaoAberta} titulo="Sessões ativas" descricao="Revê e termina o acesso deste dispositivo com confirmação do servidor." onFechar={() => definirGestaoDeSessaoAberta(false)} rodape={<><button className="soft-button" type="button" onClick={() => definirGestaoDeSessaoAberta(false)}>Manter sessão</button><button className="dark-button" type="button" disabled={aTerminar} onClick={sair}>{aTerminar ? 'A terminar…' : 'Terminar sessão'}</button></>}>
        <div className="session-device-card"><span><IconeEntrela nome="seguranca" /></span><div><strong>Este navegador</strong><small>Luanda, Angola · sessão atual</small></div><i>Ativa</i></div>
        <p className="session-security-note">Ao sair, o cookie de sessão é revogado no backend; apagar apenas dados locais não é suficiente.</p>
        {erroDaSessao ? <p className="modal-error" role="alert">{erroDaSessao}</p> : null}
      </ModalEntrela>
    </form>
  )
}

function Preferencias() {
  const [aparencia, definirAparencia] = useState<'sistema' | 'claro' | 'escuro'>('sistema')
  const [lembretes, definirLembretes] = useState(true)
  const [novidades, definirNovidades] = useState(false)

  return (
    <div className="settings-content">
      <section className="settings-section" aria-labelledby="display-title">
        <div className="settings-section__heading"><div><p className="eyebrow">Interface</p><h2 id="display-title">Exibição</h2></div><p>A Entrela acompanha o teu dispositivo por predefinição.</p></div>
        <div className="appearance-options" role="group" aria-label="Aparência">
          {(['sistema', 'claro', 'escuro'] as const).map((opcao) => (
            <button type="button" key={opcao} className={aparencia === opcao ? 'is-active' : ''} aria-pressed={aparencia === opcao} onClick={() => definirAparencia(opcao)}>
              <span className={`appearance-preview appearance-preview--${opcao}`}><i /><i /><i /></span>
              <strong>{opcao[0].toUpperCase() + opcao.slice(1)}</strong>
              <small>{opcao === 'sistema' ? 'Segue o dispositivo' : opcao === 'claro' ? 'Sempre luminoso' : 'Conforto à noite'}</small>
            </button>
          ))}
        </div>
        <div className="setting-card definition-stack settings-card--spaced">
          <LinhaDeDefinicao icone="globo" titulo="Idioma" descricao="Português (Angola)"><button type="button">Alterar</button></LinhaDeDefinicao>
          <LinhaDeDefinicao icone="relogio" titulo="Fuso horário" descricao="Luanda · GMT+1"><button type="button">Alterar</button></LinhaDeDefinicao>
        </div>
      </section>
      <section className="settings-section" aria-labelledby="notification-title">
        <div className="settings-section__heading"><div><p className="eyebrow">Atualizações</p><h2 id="notification-title">Notificações</h2></div><p>Escolhe apenas o que merece interromper o teu dia.</p></div>
        <div className="setting-card definition-stack">
          <LinhaDeDefinicao icone="sino" titulo="Lembretes dos teus momentos" descricao="Aberturas agendadas e respostas dos destinatários.">
            <label className="switch-control"><span className="sr-only">Receber lembretes</span><input type="checkbox" checked={lembretes} onChange={(e) => definirLembretes(e.target.checked)} /><i /></label>
          </LinhaDeDefinicao>
          <LinhaDeDefinicao icone="camadas" titulo="Novidades da Entrela" descricao="Novos modelos e funcionalidades, no máximo uma vez por mês.">
            <label className="switch-control"><span className="sr-only">Receber novidades</span><input type="checkbox" checked={novidades} onChange={(e) => definirNovidades(e.target.checked)} /><i /></label>
          </LinhaDeDefinicao>
        </div>
      </section>
    </div>
  )
}

function Privacidade() {
  const [analise, definirAnalise] = useState(false)

  return (
    <div className="settings-content">
      <section className="settings-section" aria-labelledby="privacy-title">
        <div className="settings-section__heading"><div><p className="eyebrow">Controlo</p><h2 id="privacy-title">Privacidade dos momentos</h2></div><p>O conteúdo privado nunca aparece em pesquisa e só é aberto por um acesso válido.</p></div>
        <div className="privacy-callout"><IconeEntrela nome="seguranca" /><div><strong>Privado por desenho</strong><p>Ficheiros protegidos, ligações revogáveis e URLs temporárias para fotografias, áudio e vídeo.</p></div></div>
        <div className="setting-card definition-stack settings-card--spaced">
          <LinhaDeDefinicao icone="olho" titulo="Análise de utilização" descricao="Ajuda-nos a melhorar sem ler o conteúdo dos teus momentos.">
            <label className="switch-control"><span className="sr-only">Permitir análise</span><input type="checkbox" checked={analise} onChange={(e) => definirAnalise(e.target.checked)} /><i /></label>
          </LinhaDeDefinicao>
          <LinhaDeDefinicao icone="camadas" titulo="Exportar os teus dados" descricao="Recebe uma cópia dos dados e conteúdos associados."><button type="button">Solicitar</button></LinhaDeDefinicao>
        </div>
      </section>
      <section className="settings-section settings-section--danger" aria-labelledby="danger-title">
        <div className="settings-section__heading settings-section__heading--row"><div><p className="eyebrow">Zona sensível</p><h2 id="danger-title">Eliminar conta</h2><p>Esta ação remove definitivamente a conta e todos os momentos.</p></div><button type="button">Eliminar a minha conta</button></div>
      </section>
    </div>
  )
}

export default function Configuracoes() {
  const { secao } = useParams()
  const secaoAtiva: SecaoDasConfiguracoes = secao === 'preferencias' || secao === 'privacidade' ? secao : 'conta'

  return (
    <LayoutInterno>
      <main className="settings-main" id="conteudo-interno">
        <header className="settings-title">
          <p className="eyebrow">Espaço pessoal</p>
          <h1>Configurações</h1>
          <nav aria-label="Secções das configurações">
            <NavLink className={secaoAtiva === 'conta' ? 'is-active' : ''} to="/configuracoes/conta">Conta</NavLink>
            <NavLink className={secaoAtiva === 'preferencias' ? 'is-active' : ''} to="/configuracoes/preferencias">Preferências</NavLink>
            <NavLink className={secaoAtiva === 'privacidade' ? 'is-active' : ''} to="/configuracoes/privacidade">Privacidade</NavLink>
          </nav>
        </header>
        {secaoAtiva === 'conta' ? <Conta /> : secaoAtiva === 'preferencias' ? <Preferencias /> : <Privacidade />}
      </main>
    </LayoutInterno>
  )
}
