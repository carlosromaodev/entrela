import { type ChangeEvent, type CSSProperties, type FormEvent, useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import LayoutInterno from '../componentes/LayoutInterno'
import LinhaDeDefinicao from '../componentes/LinhaDeDefinicao'
import ModalEntrela from '../componentes/ModalEntrela'
import { useFluxoDoMomento } from '../contextos/FluxoDoMomento'
import { validarFicheiroDoMomento } from '../dominio/regras-do-momento'
import { atualizarMomento, criarMomento, enviarFicheiroParaArmazenamentoPrivado, ErroDaApi } from '../lib/cliente-http'

type ModeloEditorial = 'carta' | 'memorias' | 'celebracao'
type ModalDaCriacao = 'abertura' | 'acesso' | 'capa' | 'idioma' | 'modelo' | null

const temas: Array<{ valor: ModeloEditorial; nome: string; legenda: string }> = [
  { valor: 'carta', nome: 'Carta íntima', legenda: 'Suave, próxima e centrada nas palavras.' },
  { valor: 'memorias', nome: 'Memórias', legenda: 'Um ritmo visual para fotografias e vídeo.' },
  { valor: 'celebracao', nome: 'Celebração', legenda: 'Mais cor para uma data especial.' },
]

const modeloDoBackend = { carta: 'CARTA_INTIMA', memorias: 'MEMORIAS', celebracao: 'CELEBRACAO' } as const

export default function CriarRascunho() {
  const idDoTitulo = useId()
  const idDoDestinatario = useId()
  const navegar = useNavigate()
  const fluxo = useFluxoDoMomento()
  const [titulo, definirTitulo] = useState('')
  const [destinatario, definirDestinatario] = useState('')
  const [tema, definirTema] = useState<ModeloEditorial>('carta')
  const [idioma, definirIdioma] = useState<'pt-AO' | 'en'>('pt-AO')
  const [agendar, definirAgendar] = useState(false)
  const [data, definirData] = useState('2026-09-12')
  const [hora, definirHora] = useState('09:00')
  const [corDaCapa, definirCorDaCapa] = useState('#D8BFD8')
  const [ficheiroDaCapa, definirFicheiroDaCapa] = useState<File | null>(null)
  const [preVisualizacaoDaCapa, definirPreVisualizacaoDaCapa] = useState('')
  const [erroDaCapa, definirErroDaCapa] = useState<string | null>(null)
  const [momentoEmPreparacaoId, definirMomentoEmPreparacaoId] = useState<string | null>(null)
  const [modal, definirModal] = useState<ModalDaCriacao>(null)
  const [aCriar, definirACriar] = useState(false)
  const [erroDaCriacao, definirErroDaCriacao] = useState<string | null>(null)

  useEffect(() => {
    if (ficheiroDaCapa === null) {
      definirPreVisualizacaoDaCapa('')
      return
    }
    const url = URL.createObjectURL(ficheiroDaCapa)
    definirPreVisualizacaoDaCapa(url)
    return () => URL.revokeObjectURL(url)
  }, [ficheiroDaCapa])

  const escolherFicheiroDaCapa = (evento: ChangeEvent<HTMLInputElement>) => {
    const ficheiro = evento.target.files?.[0]
    if (!ficheiro) return
    if (ficheiro.type !== 'image/jpeg' && ficheiro.type !== 'image/png') {
      definirErroDaCapa('A capa deve ser uma imagem JPG ou PNG.')
      evento.target.value = ''
      return
    }
    const problema = validarFicheiroDoMomento(ficheiro)
    if (problema !== null) {
      definirErroDaCapa(problema)
      evento.target.value = ''
      return
    }
    definirErroDaCapa(null)
    definirFicheiroDaCapa(ficheiro)
  }

  const criar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!titulo.trim()) {
      document.getElementById(idDoTitulo)?.focus()
      return
    }
    definirACriar(true)
    definirErroDaCriacao(null)
    try {
      let momentoId = momentoEmPreparacaoId
      if (momentoId === null) {
        const resposta = await criarMomento({
          fusoHorario: 'Africa/Luanda',
          idioma,
          ...(destinatario.trim() ? { nomeDoDestinatario: destinatario.trim() } : {}),
          titulo: titulo.trim(),
        })
        momentoId = resposta.dados.momentoId
        definirMomentoEmPreparacaoId(momentoId)
      }
      const abertura = agendar
        ? { abreEm: new Date(`${data}T${hora}:00+01:00`).toISOString(), fusoHorario: 'Africa/Luanda' as const, modo: 'AGENDAR_ABERTURA' as const }
        : { fusoHorario: 'Africa/Luanda' as const, modo: 'ABRIR_AGORA' as const }
      let capa: { corHexadecimal: string; tipo: 'COR' } | { ficheiroId: string; nome: string; tipo: 'IMAGEM' } = { corHexadecimal: corDaCapa, tipo: 'COR' }
      if (ficheiroDaCapa !== null) {
        const resultado = await enviarFicheiroParaArmazenamentoPrivado(momentoId, ficheiroDaCapa, 'IMAGEM')
        capa = { ficheiroId: resultado.ficheiroId, nome: ficheiroDaCapa.name, tipo: 'IMAGEM' }
      }
      await atualizarMomento(momentoId, {
        abertura,
        capa: capa.tipo === 'IMAGEM' ? { ficheiroId: capa.ficheiroId, tipo: 'IMAGEM' } : capa,
        idioma,
        modeloEditorial: modeloDoBackend[tema],
        ...(destinatario.trim() ? { nomeDoDestinatario: destinatario.trim() } : {}),
        titulo: titulo.trim(),
      })
      fluxo.criarRascunho({
        abertura,
        capa,
        destinatario: destinatario.trim(),
        idioma,
        modeloEditorial: modeloDoBackend[tema],
        momentoId,
        titulo: titulo.trim(),
      })
      navegar('/editar')
    } catch (erro) {
      if (erro instanceof ErroDaApi && erro.estadoHttp === 401) {
        navegar('/entrar?retorno=/rascunho')
        return
      }
      definirErroDaCriacao('Não foi possível criar o rascunho. Confirma a sessão e a ligação ao backend.')
    } finally {
      definirACriar(false)
    }
  }

  const temaAtual = temas.find((item) => item.valor === tema) ?? temas[0]
  const fecharModal = () => definirModal(null)

  return (
    <LayoutInterno className={`creation-page creation-page--${tema}`} cabecalhoTransparente>
      <main className="creation-main" id="conteudo-interno">
        <form className="creation-layout" onSubmit={criar}>
          <aside className="creation-visual" aria-label="Aparência do momento">
            <button className={`cover-preview${preVisualizacaoDaCapa ? ' cover-preview--image' : ''}`} type="button" aria-label="Editar capa" onClick={() => definirModal('capa')} style={{ '--cover-color': corDaCapa, ...(preVisualizacaoDaCapa ? { backgroundImage: `linear-gradient(180deg, rgba(17, 17, 15, .02), rgba(17, 17, 15, .28)), url(${preVisualizacaoDaCapa})` } : {}) } as CSSProperties}>
              <span className="cover-preview__halo cover-preview__halo--one" />
              <span className="cover-preview__halo cover-preview__halo--two" />
              <span className="cover-preview__thread" />
              <span className="cover-preview__copy"><small>Para</small><strong>{destinatario.trim() || 'alguém especial'}</strong></span>
              <span className="cover-preview__upload"><IconeEntrela nome="editar" /></span>
            </button>

            <button className="theme-picker theme-picker--trigger" type="button" onClick={() => definirModal('modelo')}>
              <span className={`theme-picker__sample theme-picker__sample--${tema}`} aria-hidden="true" />
              <span className="theme-picker__button"><small>Modelo editorial</small><strong>{temaAtual.nome}</strong></span>
              <IconeEntrela nome="chevron" />
            </button>
          </aside>

          <section className="creation-form" aria-labelledby="creation-title-label">
            <div className="creation-form__meta">
              <button className="chip-button" type="button"><span className="chip-avatar">C</span>Espaço pessoal<IconeEntrela nome="chevron" /></button>
              <button className="chip-button" type="button" onClick={() => definirModal('acesso')}><IconeEntrela nome="seguranca" />Acesso privado<IconeEntrela nome="chevron" /></button>
            </div>

            <label className="sr-only" id="creation-title-label" htmlFor={idDoTitulo}>Título do momento</label>
            <input id={idDoTitulo} className="creation-title-input" value={titulo} onChange={(evento) => definirTitulo(evento.target.value)} placeholder="Nome do momento" maxLength={100} required />

            <div className="creation-block creation-block--recipient">
              <IconeEntrela nome="destinatario" />
              <label htmlFor={idDoDestinatario}>Destinatário</label>
              <input id={idDoDestinatario} value={destinatario} onChange={(evento) => definirDestinatario(evento.target.value)} placeholder="Como gostas de chamar essa pessoa?" maxLength={80} />
            </div>

            <button className="creation-block creation-add-row creation-add-row--primary" type="button" onClick={() => definirModal('abertura')}>
              <IconeEntrela nome="relogio" />
              <span><strong>Abertura</strong><small>{agendar ? `${data.split('-').reverse().join('/')} · ${hora} · Luanda` : 'Assim que a pessoa usar a ligação ou o QR'}</small></span>
              <span aria-hidden="true">›</span>
            </button>

            <div className="creation-options">
              <p>Regras do momento</p>
              <div className="creation-options__card">
                <LinhaDeDefinicao icone="camadas" titulo="Modelo" descricao={temaAtual.nome}><button type="button" onClick={() => definirModal('modelo')}>Alterar</button></LinhaDeDefinicao>
                <LinhaDeDefinicao icone="seguranca" titulo="Acesso" descricao="Ligação e QR privados, revogáveis"><button type="button" onClick={() => definirModal('acesso')}>Entender</button></LinhaDeDefinicao>
                <LinhaDeDefinicao icone="globo" titulo="Idioma" descricao={idioma === 'pt-AO' ? 'Português (Angola)' : 'English'}><button type="button" onClick={() => definirModal('idioma')}>Alterar</button></LinhaDeDefinicao>
              </div>
            </div>

            {erroDaCriacao ? <p className="creation-error" role="alert">{erroDaCriacao}</p> : null}
            <button className="primary-wide-button" type="submit" disabled={aCriar}>{aCriar ? 'A criar rascunho…' : 'Criar rascunho e continuar'}</button>
            <p className="creation-form__hint">O rascunho fica privado. A publicação exige capa, 1–6 etapas válidas e media processada.</p>
          </section>
        </form>
      </main>

      <ModalEntrela aberto={modal === 'modelo'} titulo="Escolher modelo editorial" descricao="O modelo define o ritmo visual; o conteúdo continua totalmente editável." onFechar={fecharModal} rodape={<button className="dark-button" type="button" onClick={fecharModal}>Aplicar modelo</button>}>
        <div className="modal-choice-grid">
          {temas.map((item) => <button type="button" className={tema === item.valor ? 'is-active' : ''} aria-pressed={tema === item.valor} key={item.valor} onClick={() => definirTema(item.valor)}><i className={`modal-theme-art modal-theme-art--${item.valor}`} /><span><strong>{item.nome}</strong><small>{item.legenda}</small></span></button>)}
        </div>
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'capa'} titulo="Personalizar capa" descricao="A capa é obrigatória antes de publicar." onFechar={fecharModal} rodape={<button className="dark-button" type="button" onClick={fecharModal}>Guardar capa</button>}>
        <div className="cover-color-options" role="group" aria-label="Cor da capa">
          {['#D8BFD8', '#7357F6', '#F4A622', '#FF6F61', '#FDFCFB'].map((cor) => <button type="button" key={cor} style={{ background: cor }} className={corDaCapa === cor ? 'is-active' : ''} aria-label={`Usar cor ${cor}`} aria-pressed={corDaCapa === cor} onClick={() => definirCorDaCapa(cor)} />)}
        </div>
        <label className="modal-upload-option modal-upload-option--field">
          <input type="file" accept="image/jpeg,image/png" onChange={escolherFicheiroDaCapa} />
          <IconeEntrela nome="imagem" /><span><strong>{ficheiroDaCapa?.name ?? 'Usar uma fotografia'}</strong><small>JPG ou PNG · máximo 10 MB · processamento privado</small></span><span>›</span>
        </label>
        {erroDaCapa ? <p className="modal-error" role="alert">{erroDaCapa}</p> : null}
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'abertura'} titulo="Quando pode ser aberto?" descricao="A política de tempo é aplicada no servidor em Africa/Luanda." onFechar={fecharModal} rodape={<button className="dark-button" type="button" onClick={fecharModal}>Guardar abertura</button>}>
        <div className="modal-radio-list">
          <label><input type="radio" name="abertura" checked={!agendar} onChange={() => definirAgendar(false)} /><span><strong>Abrir imediatamente</strong><small>Fica disponível assim que a ligação ou QR forem usados.</small></span></label>
          <label><input type="radio" name="abertura" checked={agendar} onChange={() => definirAgendar(true)} /><span><strong>Agendar abertura</strong><small>Antes desse instante, o destinatário vê apenas a espera.</small></span></label>
        </div>
        {agendar ? <div className="modal-date-fields"><label>Data<input type="date" value={data} onChange={(e) => definirData(e.target.value)} /></label><label>Hora<input type="time" value={hora} onChange={(e) => definirHora(e.target.value)} /></label><span>GMT+1<br />Africa/Luanda</span></div> : null}
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'idioma'} titulo="Idioma da experiência" descricao="O destinatário recebe a experiência no idioma escolhido." onFechar={fecharModal} rodape={<button className="dark-button" type="button" onClick={fecharModal}>Aplicar idioma</button>}>
        <div className="modal-radio-list"><label><input type="radio" name="idioma" checked={idioma === 'pt-AO'} onChange={() => definirIdioma('pt-AO')} /><span><strong>Português (Angola)</strong><small>Idioma predefinido</small></span></label><label><input type="radio" name="idioma" checked={idioma === 'en'} onChange={() => definirIdioma('en')} /><span><strong>English</strong><small>English experience</small></span></label></div>
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'acesso'} titulo="Acesso privado por desenho" descricao="Momentos não são páginas públicas indexáveis." onFechar={fecharModal} rodape={<button className="dark-button" type="button" onClick={fecharModal}>Entendi</button>}>
        <div className="access-explanation"><span><IconeEntrela nome="seguranca" /></span><div><strong>Duas portas, uma experiência</strong><p>Ao publicar, o servidor gera uma ligação e um QR distintos. Ambos são opacos, podem ser revogados ou regenerados e nunca expõem o identificador do momento.</p></div></div>
        <ul className="rule-list"><li>Media servida apenas por URL temporária de 60 segundos.</li><li>A pré-visualização exige sessão com permissão de conteúdo privado.</li><li>Uma ligação revogada deixa de resolver a experiência.</li></ul>
      </ModalEntrela>
    </LayoutInterno>
  )
}
