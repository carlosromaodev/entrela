import { type ChangeEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import IconeEntrela from '../componentes/IconeEntrela'
import LayoutInterno from '../componentes/LayoutInterno'
import ModalEntrela from '../componentes/ModalEntrela'
import { rascunhoDeDemonstracao, useFluxoDoMomento } from '../contextos/FluxoDoMomento'
import { criarChaveDaEtapa, formatarTamanhoDoFicheiro, validarRascunhoParaPublicacao } from '../dominio/regras-do-momento'
import { atualizarMomento, publicarMomento } from '../lib/cliente-http'

type ModalDoEditor = 'media' | 'publicacao' | 'sucesso' | null

export default function EditarConteudo() {
  const fluxo = useFluxoDoMomento()
  const rascunho = fluxo.rascunho ?? rascunhoDeDemonstracao
  const [etapaAtiva, definirEtapaAtiva] = useState(rascunho.etapas[0].chave)
  const [estado, definirEstado] = useState<'editado' | 'guardado' | 'publicado'>('guardado')
  const [modal, definirModal] = useState<ModalDoEditor>(null)
  const [erroDeMedia, definirErroDeMedia] = useState<string | null>(null)
  const [erroDoServidor, definirErroDoServidor] = useState<string | null>(null)
  const [aGuardar, definirAGuardar] = useState(false)
  const [portasPublicadas, definirPortasPublicadas] = useState<Array<{ tipo: 'URL' | 'QR'; token: string }>>([])

  const atualizarEtapa = (chave: string, campo: 'titulo' | 'texto', valor: string) => {
    fluxo.atualizarEtapa(chave, campo, valor)
    definirEstado('editado')
  }

  const adicionarEtapa = () => {
    const chave = fluxo.adicionarEtapa()
    if (chave !== null) {
      definirEstado('editado')
      definirEtapaAtiva(chave)
    }
  }

  const etapaSelecionada = rascunho.etapas.find((etapa) => etapa.chave === etapaAtiva) ?? rascunho.etapas[0]
  const problemas = validarRascunhoParaPublicacao(rascunho)
  const fecharModal = () => definirModal(null)

  const receberFicheiro = async (evento: ChangeEvent<HTMLInputElement>) => {
    const ficheiro = evento.target.files?.[0]
    if (!ficheiro) return
    definirErroDeMedia(null)
    const erro = await fluxo.anexarMedia(etapaSelecionada.chave, ficheiro)
    definirErroDeMedia(erro)
    if (erro === null) definirEstado('editado')
  }

  const guardarNoServidor = async () => {
    definirErroDoServidor(null)
    if (rascunho.momentoId === undefined) {
      definirEstado('guardado')
      return true
    }
    definirAGuardar(true)
    try {
      const chavesUsadas = new Set<string>()
      await atualizarMomento(rascunho.momentoId, {
        abertura: rascunho.abertura,
        capa: rascunho.capa?.tipo === 'IMAGEM' ? { ficheiroId: rascunho.capa.ficheiroId, tipo: 'IMAGEM' } : rascunho.capa,
        etapas: rascunho.etapas.map((etapa) => {
          const chave = criarChaveDaEtapa(etapa.titulo, etapa.ordem, chavesUsadas)
          chavesUsadas.add(chave)
          return {
            chave,
            final: etapa.final,
            ordem: etapa.ordem,
            ...(etapa.texto.trim() ? { texto: etapa.texto } : {}),
            ...(etapa.media?.ficheiroId ? { media: { estado: etapa.media.estado === 'PROCESSANDO' ? 'PENDENTE' : etapa.media.estado, ficheiroId: etapa.media.ficheiroId, tamanhoEmBytes: etapa.media.tamanhoEmBytes, tipo: etapa.media.tipo } } : {}),
          }
        }),
        idioma: rascunho.idioma,
        modeloEditorial: rascunho.modeloEditorial,
        ...(rascunho.destinatario ? { nomeDoDestinatario: rascunho.destinatario } : {}),
        titulo: rascunho.titulo,
      })
      definirEstado('guardado')
      return true
    } catch {
      definirErroDoServidor('Não foi possível guardar no servidor. As alterações continuam nesta sessão do navegador.')
      return false
    } finally {
      definirAGuardar(false)
    }
  }

  const confirmarPublicacao = async () => {
    const falhas = validarRascunhoParaPublicacao(rascunho)
    if (falhas.length > 0) return
    if (!(await guardarNoServidor())) return
    try {
      if (rascunho.momentoId !== undefined) {
        const resposta = await publicarMomento(rascunho.momentoId)
        definirPortasPublicadas(resposta.dados.portas)
      }
      fluxo.publicar()
      definirEstado('publicado')
      definirModal('sucesso')
    } catch {
      definirErroDoServidor('A validação local passou, mas o servidor recusou a publicação. Confirma o direito ativo e a permissão do teu papel.')
    }
  }

  return (
    <LayoutInterno className={`editor-page editor-page--${rascunho.modeloEditorial.toLowerCase()}`}>
      <main className="editor-main" id="conteudo-interno">
        <header className="editor-toolbar">
          <div>
            <Link to="/painel" className="editor-back" aria-label="Voltar ao painel">←</Link>
            <span><small>{rascunho.estado === 'PUBLICADA' ? 'Publicada' : 'Rascunho'}</small><strong>{rascunho.titulo}</strong></span>
          </div>
          <div className="editor-toolbar__actions">
            <span className={`save-state save-state--${estado}`}>{estado === 'editado' ? 'Alterações por guardar' : estado === 'guardado' ? 'Tudo guardado' : 'Publicado'}</span>
            <Link className="soft-button" to="/pre-visualizacao"><IconeEntrela nome="olho" /> Pré-visualizar</Link>
            <button className="dark-button" type="button" disabled={aGuardar} onClick={guardarNoServidor}>{aGuardar ? 'A guardar…' : 'Guardar'}</button>
          </div>
        </header>

        {erroDoServidor && modal !== 'publicacao' ? <div className="editor-server-error" role="alert"><span>{erroDoServidor}</span><button type="button" onClick={() => definirErroDoServidor(null)} aria-label="Fechar aviso">×</button></div> : null}

        <div className="editor-workspace">
          <aside className="editor-outline" aria-label="Estrutura do momento">
            <div className="editor-cover-mini">
              <span>Para</span>
              <strong>{rascunho.destinatario || 'uma pessoa especial'}</strong>
              <i aria-hidden="true" />
            </div>
            <div className="editor-outline__heading"><span>Etapas</span><small>{rascunho.etapas.length} de 6</small></div>
            <ol>
              {rascunho.etapas.map((etapa, indice) => (
                <li key={etapa.chave}>
                  <button type="button" className={etapaAtiva === etapa.chave ? 'is-active' : ''} onClick={() => definirEtapaAtiva(etapa.chave)}>
                    <span>{String(indice + 1).padStart(2, '0')}</span>
                    <strong>{etapa.titulo || 'Sem título'}</strong>
                  </button>
                </li>
              ))}
            </ol>
            {rascunho.etapas.length < 6 ? <button className="editor-add-step" type="button" onClick={adicionarEtapa}><IconeEntrela nome="adicionar" /> Adicionar etapa</button> : <p className="editor-limit-note">Limite de 6 etapas atingido.</p>}
          </aside>

          <section className="editor-canvas" aria-labelledby="editor-step-title">
            <div className="editor-canvas__topline"><span>Etapa {rascunho.etapas.indexOf(etapaSelecionada) + 1}{etapaSelecionada.final ? ' · Revelação final' : ''}</span><button type="button" aria-label="Ações da etapa">•••</button></div>
            <label className="sr-only" htmlFor="editor-step-title">Título da etapa</label>
            <input
              id="editor-step-title"
              className="editor-step-title"
              value={etapaSelecionada.titulo}
              onChange={(evento) => atualizarEtapa(etapaSelecionada.chave, 'titulo', evento.target.value)}
              maxLength={80}
            />
            <label className="sr-only" htmlFor="editor-step-text">Texto da etapa</label>
            <textarea
              id="editor-step-text"
              className="editor-step-text"
              value={etapaSelecionada.texto}
              onChange={(evento) => atualizarEtapa(etapaSelecionada.chave, 'texto', evento.target.value)}
              placeholder="Escreve o que queres que esta pessoa sinta ao chegar aqui…"
              maxLength={1600}
            />
            {etapaSelecionada.media ? (
              <button className={`media-file media-file--${etapaSelecionada.media.estado.toLowerCase()}`} type="button" onClick={() => definirModal('media')}>
                <span><IconeEntrela nome={etapaSelecionada.media.tipo === 'IMAGEM' ? 'imagem' : 'camadas'} /></span>
                <span><strong>{etapaSelecionada.media.nome}</strong><small>{formatarTamanhoDoFicheiro(etapaSelecionada.media.tamanhoEmBytes)} · {etapaSelecionada.media.estado === 'PRONTO' ? 'Pronto e verificado' : 'A processar em privado…'}</small></span>
                <span>{etapaSelecionada.media.estado === 'PRONTO' ? '✓' : '···'}</span>
              </button>
            ) : (
              <button className="media-dropzone" type="button" onClick={() => definirModal('media')}>
                <span><IconeEntrela nome="imagem" /></span><strong>Juntar uma memória</strong><small>JPG/PNG · 10 MB &nbsp; MP3 · 20 MB &nbsp; MP4 · 100 MB</small>
              </button>
            )}
            <div className="editor-canvas__note"><span aria-hidden="true">✦</span><p>Menos pode dizer mais. Uma imagem e algumas palavras costumam ser suficientes.</p></div>
          </section>

          <aside className="editor-inspector" aria-label="Opções da etapa">
            <div className="editor-inspector__section">
              <p className="eyebrow">Esta etapa</p>
              <label>Entrada<select defaultValue="suave"><option value="suave">Suave</option><option value="direta">Direta</option><option value="surpresa">Surpresa</option></select></label>
              <label>Duração sugerida<select defaultValue="livre"><option value="livre">Livre</option><option value="30">30 segundos</option><option value="60">1 minuto</option></select></label>
            </div>
            <div className="editor-inspector__section">
              <p className="eyebrow">Momento</p>
              <Link to="/rascunho"><IconeEntrela nome="imagem" /><span><strong>Capa</strong><small>{rascunho.capa?.tipo === 'COR' ? rascunho.capa.corHexadecimal : 'Imagem privada'}</small></span><span>›</span></Link>
              <Link to="/rascunho"><IconeEntrela nome="relogio" /><span><strong>Abertura</strong><small>{rascunho.abertura.modo === 'ABRIR_AGORA' ? 'Ao receber' : 'Agendada'}</small></span><span>›</span></Link>
              <button type="button" onClick={() => definirModal('publicacao')}><IconeEntrela nome="seguranca" /><span><strong>Validação</strong><small>{problemas.length === 0 ? 'Pronto para publicar' : `${problemas.length} ponto(s) a corrigir`}</small></span><span>›</span></button>
            </div>
            <div className="editor-publish-card">
              <span className="editor-publish-card__icon"><IconeEntrela nome="globo" /></span>
              <strong>Pronto para entrelaçar?</strong>
              <p>Confirma a experiência antes de gerar a ligação e o QR privados.</p>
              <button type="button" onClick={() => definirModal('publicacao')}>Rever e publicar</button>
            </div>
          </aside>
        </div>
      </main>

      <ModalEntrela aberto={modal === 'media'} titulo="Juntar media a esta etapa" descricao="O ficheiro é enviado para armazenamento privado, inspecionado e só depois pode ser publicado." onFechar={fecharModal}>
        <label className="file-upload-field">
          <input type="file" accept="image/jpeg,image/png,audio/mpeg,video/mp4" onChange={receberFicheiro} />
          <span><IconeEntrela nome="imagem" /></span>
          <strong>Escolher ficheiro</strong>
          <small>JPG/PNG até 10 MB · MP3 até 20 MB · MP4 até 100 MB</small>
        </label>
        {erroDeMedia ? <p className="modal-error" role="alert">{erroDeMedia}</p> : null}
        {etapaSelecionada.media ? <div className={`upload-status upload-status--${etapaSelecionada.media.estado.toLowerCase()}`}><span><IconeEntrela nome="seguranca" /></span><div><strong>{etapaSelecionada.media.nome}</strong><small>{etapaSelecionada.media.estado === 'PRONTO' ? 'Ficheiro verificado e pronto para associar.' : 'Upload confirmado. A inspeção de segurança está em curso.'}</small></div><i>{etapaSelecionada.media.estado === 'PRONTO' ? 'Pronto' : 'A processar'}</i></div> : null}
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'publicacao'} titulo="Rever antes de publicar" descricao="A publicação congela esta versão e cria uma ligação e um QR privados." onFechar={fecharModal} rodape={<><button className="soft-button" type="button" onClick={fecharModal}>Continuar a editar</button><button className="dark-button" type="button" disabled={problemas.length > 0 || aGuardar} onClick={confirmarPublicacao}>{aGuardar ? 'A validar…' : 'Publicar momento'}</button></>}>
        <div className="publication-checklist">
          <div className={rascunho.capa ? 'is-valid' : 'is-invalid'}><span>{rascunho.capa ? '✓' : '!'}</span><p><strong>Capa</strong><small>{rascunho.capa ? 'Capa definida.' : 'Obrigatória para publicar.'}</small></p></div>
          <div className={rascunho.etapas.length >= 1 && rascunho.etapas.length <= 6 ? 'is-valid' : 'is-invalid'}><span>✓</span><p><strong>Estrutura</strong><small>{rascunho.etapas.length} etapa(s); a última é a revelação final.</small></p></div>
          <div className={problemas.some((item) => item.alvo === 'media' || item.alvo === 'etapas') ? 'is-invalid' : 'is-valid'}><span>{problemas.some((item) => item.alvo === 'media' || item.alvo === 'etapas') ? '!' : '✓'}</span><p><strong>Conteúdo e media</strong><small>{problemas.find((item) => item.alvo === 'media' || item.alvo === 'etapas')?.mensagem ?? 'Todas as etapas têm conteúdo pronto.'}</small></p></div>
          <div className="is-server"><span><IconeEntrela nome="seguranca" /></span><p><strong>Direito de publicação</strong><small>O servidor confirma papel, sessão, CSRF e direito ativo no momento da publicação.</small></p></div>
        </div>
        {problemas.length > 0 ? <p className="publication-warning" role="status">Corrige os pontos assinalados para ativar a publicação.</p> : null}
        {erroDoServidor ? <p className="modal-error" role="alert">{erroDoServidor}</p> : null}
      </ModalEntrela>

      <ModalEntrela aberto={modal === 'sucesso'} titulo="O momento está entrelaçado" descricao="A versão foi congelada e as duas portas de acesso foram criadas." onFechar={fecharModal} rodape={<Link className="dark-button" to="/painel">Voltar aos momentos</Link>}>
        <div className="publish-result"><div className="publish-qr" role="img" aria-label="Representação do QR"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div><p className="eyebrow">Ligação privada</p><strong>{portasPublicadas.length > 0 ? `entrela.ao/m/${portasPublicadas.find((porta) => porta.tipo === 'URL')?.token.slice(0, 8)}…` : 'entrela.ao/m/••••••••'}</strong><small>O token completo só é mostrado uma vez e nunca é escrito nos logs.</small><Link to={`/publico/${portasPublicadas.find((porta) => porta.tipo === 'URL')?.token ?? 'token-demo'}`}>Abrir experiência {portasPublicadas.length > 0 ? 'publicada' : 'de demonstração'} →</Link></div></div>
      </ModalEntrela>
    </LayoutInterno>
  )
}
