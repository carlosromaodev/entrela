import {
  type CSSProperties,
  type PointerEvent as EventoDePonteiroReact,
  useEffect,
  useRef,
  useState,
} from 'react'

type TipoDeCartao = 'image' | 'poster'

type CartaoFlutuante = {
  id: string
  kind: TipoDeCartao
  label: string
  image?: string
  variant?: string
  x: string
  y: string
  width: string
  mobileX?: string
  mobileY?: string
  mobileWidth?: string
  ratio?: string
  rotation: string
  depth: number
  duration: string
  delay: string
  hideOnMobile?: boolean
}

type EstiloDoCartao = CSSProperties & {
  '--card-x': string
  '--card-y': string
  '--card-width': string
  '--mobile-x': string
  '--mobile-y': string
  '--mobile-width': string
  '--card-ratio': string
  '--card-rotation': string
  '--float-duration': string
  '--float-delay': string
  '--entrance-delay': string
}

const palavrasAlternadas = ['momento', 'presente', 'convite', 'objecto']

const cartoes: CartaoFlutuante[] = [
  {
    id: 'celebration',
    kind: 'image',
    label: 'Jantar de reencontro',
    image: '/images/celebration.webp',
    x: '38.8%',
    y: '-7.5%',
    width: '15.2vw',
    mobileX: '31%',
    mobileY: '59%',
    mobileWidth: '42vw',
    ratio: '1 / 1.12',
    rotation: '-1.5deg',
    depth: 1.15,
    duration: '6.8s',
    delay: '-2.1s',
  },
  {
    id: 'letters',
    kind: 'image',
    label: 'Uma carta para o futuro',
    image: '/images/memory-letters.webp',
    x: '19%',
    y: '12.5%',
    width: '10.6vw',
    mobileX: '-18%',
    mobileY: '65%',
    mobileWidth: '43vw',
    rotation: '-4deg',
    depth: 1.45,
    duration: '6.1s',
    delay: '-3.4s',
  },
  {
    id: 'countdown',
    kind: 'poster',
    label: 'Para abrir à meia-noite',
    variant: 'countdown',
    x: '4.8%',
    y: '30%',
    width: '8.3vw',
    mobileX: '8%',
    mobileY: '75%',
    mobileWidth: '34vw',
    ratio: '1 / 1.16',
    rotation: '2.5deg',
    depth: 1.7,
    duration: '7.2s',
    delay: '-1.1s',
  },
  {
    id: 'voice',
    kind: 'image',
    label: 'Vozes de quem te quer bem',
    image: '/images/voice-note.webp',
    x: '10.7%',
    y: '50%',
    width: '12.8vw',
    mobileX: '-12%',
    mobileY: '68%',
    mobileWidth: '34vw',
    rotation: '-2deg',
    depth: 1.25,
    duration: '7.4s',
    delay: '-4.6s',
    hideOnMobile: true,
  },
  {
    id: 'gift',
    kind: 'image',
    label: 'Há uma mensagem aqui',
    image: '/images/gift-box.webp',
    x: '72%',
    y: '5.5%',
    width: '11.8vw',
    mobileX: '75%',
    mobileY: '64%',
    mobileWidth: '41vw',
    rotation: '3deg',
    depth: 1.5,
    duration: '6.4s',
    delay: '-2.8s',
  },
  {
    id: 'bouquet',
    kind: 'image',
    label: 'Depois da entrega',
    image: '/images/bouquet.webp',
    x: '86.4%',
    y: '30%',
    width: '10.4vw',
    mobileX: '55%',
    mobileY: '77%',
    mobileWidth: '42vw',
    rotation: '-2deg',
    depth: 1.75,
    duration: '6.9s',
    delay: '-5.2s',
  },
  {
    id: 'invitation',
    kind: 'image',
    label: 'Convite que se revela',
    image: '/images/invitation.webp',
    x: '69.6%',
    y: '48.7%',
    width: '10.2vw',
    mobileX: '77%',
    mobileY: '39%',
    mobileWidth: '30vw',
    rotation: '4deg',
    depth: 1.3,
    duration: '7.5s',
    delay: '-3.7s',
    hideOnMobile: true,
  },
  {
    id: 'voices-poster',
    kind: 'poster',
    label: '12 vozes. 1 presente.',
    variant: 'voices',
    x: '79.2%',
    y: '69%',
    width: '11.2vw',
    rotation: '1.5deg',
    depth: 1.5,
    duration: '6.2s',
    delay: '-1.8s',
    hideOnMobile: true,
  },
  {
    id: 'reunion-poster',
    kind: 'poster',
    label: 'Celebração da turma de 2026',
    variant: 'reunion',
    x: '-3.2%',
    y: '78%',
    width: '11.6vw',
    rotation: '5deg',
    depth: 1.8,
    duration: '7.1s',
    delay: '-4.2s',
    hideOnMobile: true,
  },
  {
    id: 'gift-bottom',
    kind: 'image',
    label: 'A história deste objecto',
    image: '/images/gift-box.webp',
    x: '25.2%',
    y: '80%',
    width: '11.7vw',
    ratio: '1 / .92',
    rotation: '-3deg',
    depth: 1.2,
    duration: '6.6s',
    delay: '-3.1s',
    hideOnMobile: true,
  },
  {
    id: 'memory-bottom',
    kind: 'image',
    label: 'A nossa história',
    image: '/images/memory-letters.webp',
    x: '56.2%',
    y: '87.5%',
    width: '13.4vw',
    ratio: '1 / .9',
    rotation: '2deg',
    depth: 1.35,
    duration: '7.6s',
    delay: '-5.5s',
    hideOnMobile: true,
  },
]

function usarPreferenciaPorMenosMovimento() {
  const [prefereMenosMovimento, definirPreferenciaPorMenosMovimento] = useState(false)

  useEffect(() => {
    const consultaDeMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const atualizarPreferencia = () => definirPreferenciaPorMenosMovimento(consultaDeMedia.matches)

    atualizarPreferencia()
    consultaDeMedia.addEventListener('change', atualizarPreferencia)
    return () => consultaDeMedia.removeEventListener('change', atualizarPreferencia)
  }, [])

  return prefereMenosMovimento
}

function PalavraAlternada({ palavra }: { palavra: string }) {
  return (
    <span className="word-window" aria-hidden="true">
      <span className="rotating-word" key={palavra}>
        {palavra}
      </span>
      <span className="headline-period">.</span>
    </span>
  )
}

function ArteDoCartaz({ variacao }: { variacao?: string }) {
  if (variacao === 'countdown') {
    return (
      <div className="poster poster--countdown">
        <span className="poster__eyebrow">ABRE EM</span>
        <strong>00:00:04</strong>
        <span className="poster__footer">À MEIA-NOITE</span>
      </div>
    )
  }

  if (variacao === 'voices') {
    return (
      <div className="poster poster--voices">
        <span className="sound-line sound-line--one" />
        <span className="sound-line sound-line--two" />
        <strong>12<br />VOZES</strong>
        <span>1 PRESENTE</span>
      </div>
    )
  }

  return (
    <div className="poster poster--reunion">
      <span className="poster__year">2026</span>
      <strong>OUTRA<br />VEZ<br />JUNTOS</strong>
      <span className="poster__footer">REENCONTRO</span>
    </div>
  )
}

function CartaoDeExperienciaFlutuante({ cartao, indice }: { cartao: CartaoFlutuante; indice: number }) {
  const estilo: EstiloDoCartao = {
    '--card-x': cartao.x,
    '--card-y': cartao.y,
    '--card-width': cartao.width,
    '--mobile-x': cartao.mobileX ?? cartao.x,
    '--mobile-y': cartao.mobileY ?? cartao.y,
    '--mobile-width': cartao.mobileWidth ?? cartao.width,
    '--card-ratio': cartao.ratio ?? '1 / 1',
    '--card-rotation': cartao.rotation,
    '--float-duration': cartao.duration,
    '--float-delay': cartao.delay,
    '--entrance-delay': `${180 + indice * 68}ms`,
  }

  return (
    <figure
      className={`floating-card${cartao.hideOnMobile ? ' floating-card--desktop-only' : ''}`}
      data-depth={cartao.depth}
      style={estilo}
    >
      <div className="floating-card__parallax">
        <div className="floating-card__float">
          <div className="floating-card__frame">
            {cartao.kind === 'image' ? (
              <>
                <img
                  src={cartao.image}
                  alt=""
                  width="720"
                  height="720"
                  loading="eager"
                  decoding="sync"
                  fetchPriority={indice < 6 ? 'high' : 'auto'}
                  draggable="false"
                />
                <span className="floating-card__label">{cartao.label}</span>
              </>
            ) : (
              <ArteDoCartaz variacao={cartao.variant} />
            )}
          </div>
        </div>
      </div>
    </figure>
  )
}

function PaginaInicial() {
  const referenciaDoDestaque = useRef<HTMLElement>(null)
  const referenciaDoQuadroDeAnimacao = useRef<number | null>(null)
  const referenciaDoTemporizadorDaRevelacao = useRef<number | null>(null)
  const prefereMenosMovimento = usarPreferenciaPorMenosMovimento()
  const [indiceDaPalavra, definirIndiceDaPalavra] = useState(0)
  const [destaqueDesperto, definirDestaqueDesperto] = useState(false)

  const atualizarParalaxeDosCartoes = (evento: EventoDePonteiroReact<HTMLElement>) => {
    if (prefereMenosMovimento || evento.pointerType !== 'mouse' || !referenciaDoDestaque.current) return

    const destaque = referenciaDoDestaque.current
    const limites = destaque.getBoundingClientRect()
    const posicaoXNormalizada = (evento.clientX - limites.left) / limites.width - 0.5
    const posicaoYNormalizada = (evento.clientY - limites.top) / limites.height - 0.5

    if (referenciaDoQuadroDeAnimacao.current !== null) {
      window.cancelAnimationFrame(referenciaDoQuadroDeAnimacao.current)
    }

    referenciaDoQuadroDeAnimacao.current = window.requestAnimationFrame(() => {
      destaque.querySelectorAll<HTMLElement>('[data-depth]').forEach((cartao) => {
        const profundidade = Number(cartao.dataset.depth ?? 1)
        cartao.style.setProperty('--parallax-x', `${posicaoXNormalizada * profundidade * 16}px`)
        cartao.style.setProperty('--parallax-y', `${posicaoYNormalizada * profundidade * 11}px`)
      })
    })
  }

  const reporParalaxeDosCartoes = () => {
    if (!referenciaDoDestaque.current) return
    referenciaDoDestaque.current.querySelectorAll<HTMLElement>('[data-depth]').forEach((cartao) => {
      cartao.style.setProperty('--parallax-x', '0px')
      cartao.style.setProperty('--parallax-y', '0px')
    })
  }

  const abrirRevelacaoDoDestaque = () => {
    if (prefereMenosMovimento || destaqueDesperto || referenciaDoTemporizadorDaRevelacao.current !== null) return

    referenciaDoTemporizadorDaRevelacao.current = window.setTimeout(() => {
      definirIndiceDaPalavra((indiceAtual) => (indiceAtual + 1) % palavrasAlternadas.length)
      definirDestaqueDesperto(true)
      referenciaDoTemporizadorDaRevelacao.current = null
    }, 200)
  }

  const fecharRevelacaoDoDestaque = () => {
    if (referenciaDoTemporizadorDaRevelacao.current !== null) {
      window.clearTimeout(referenciaDoTemporizadorDaRevelacao.current)
      referenciaDoTemporizadorDaRevelacao.current = null
    }
    definirDestaqueDesperto(false)
  }

  useEffect(() => {
    return () => {
      if (referenciaDoQuadroDeAnimacao.current !== null) {
        window.cancelAnimationFrame(referenciaDoQuadroDeAnimacao.current)
      }
      if (referenciaDoTemporizadorDaRevelacao.current !== null) {
        window.clearTimeout(referenciaDoTemporizadorDaRevelacao.current)
      }
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>

      <header className="site-header" aria-label="Navegação principal">
        <a className="brand-mark" href="#inicio" aria-label="Entrela — início">
          <img src="/brand/entrela-symbol.png" alt="" width="34" height="34" />
        </a>
        <a className="header-action" href="#criar">Começar</a>
      </header>

      <main id="conteudo">
        <section
          className={`hero${destaqueDesperto ? ' hero--awake' : ''}`}
          id="inicio"
          ref={referenciaDoDestaque}
          onPointerMove={atualizarParalaxeDosCartoes}
          onPointerLeave={reporParalaxeDosCartoes}
          aria-labelledby="hero-title"
        >
          <div className="floating-stage" aria-hidden="true">
            {cartoes.map((cartao, indice) => (
              <CartaoDeExperienciaFlutuante cartao={cartao} indice={indice} key={cartao.id} />
            ))}
          </div>

          <div className="hero-focus" aria-hidden="true" />
          <div className="hero-reveal" aria-hidden="true">
            <span className="hero-reveal__orbit hero-reveal__orbit--one" />
            <span className="hero-reveal__orbit hero-reveal__orbit--two" />
            <span className="hero-reveal__pulse" />
          </div>

          <div className="hero-content">
            <img
              className="hero-wordmark"
              src="/brand/entrela-wordmark.png"
              alt="Entrela"
              width="1186"
              height="187"
            />

            <h1 id="hero-title" aria-label="Há uma experiência dentro de cada momento.">
              <span>Há uma experiência</span>
              <span>dentro de cada</span>
              <PalavraAlternada palavra={palavrasAlternadas[indiceDaPalavra]} />
            </h1>

            <p className="hero-description">
              Cria experiências digitais para celebrar, surpreender ou convidar — e partilha-as por link ou QR.
            </p>

            <div className="hero-actions" aria-label="Acções principais">
              <a
                className="button button--primary hero-primary-action"
                href="#criar"
                onPointerEnter={abrirRevelacaoDoDestaque}
                onPointerLeave={fecharRevelacaoDoDestaque}
                onFocus={abrirRevelacaoDoDestaque}
                onBlur={fecharRevelacaoDoDestaque}
              >
                Criar uma experiência
              </a>
              <a className="text-link" href="#possibilidades">
                Ver possibilidades <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="hero-fade" aria-hidden="true" />
        </section>

        <section className="closing" id="possibilidades" aria-labelledby="closing-title">
          <div className="closing-orbit" aria-hidden="true">
            <span className="closing-orbit__ring closing-orbit__ring--one" />
            <span className="closing-orbit__ring closing-orbit__ring--two" />
            <span className="closing-orbit__spark closing-orbit__spark--one" />
            <span className="closing-orbit__spark closing-orbit__spark--two" />
          </div>

          <div className="closing-content" id="criar">
            <p className="closing-kicker">Momentos · Presentes · Convites</p>
            <h2 id="closing-title">Algumas coisas merecem mais do que uma mensagem.</h2>
            <p>Transforma um momento, um presente ou um convite numa experiência que continua.</p>
            <a className="button button--primary button--large" href="#inicio">
              Criar uma experiência
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/brand/entrela-wordmark.png" alt="Entrela" width="1186" height="187" />
          <span>Experiências que conectam momentos.</span>
        </div>

        <nav className="footer-links" aria-label="Navegação de rodapé">
          <a href="#inicio">Início</a>
          <a href="#possibilidades">Possibilidades</a>
          <a href="#criar">Criar</a>
        </nav>

        <p>Uma marca CAVINOVA · © 2026 Entrela</p>
      </footer>
    </>
  )
}

export default PaginaInicial
