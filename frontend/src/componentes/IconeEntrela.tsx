export type NomeDoIcone =
  | 'adicionar'
  | 'ajustes'
  | 'calendario'
  | 'camadas'
  | 'chevron'
  | 'destinatario'
  | 'editar'
  | 'globo'
  | 'imagem'
  | 'inicio'
  | 'localizacao'
  | 'olho'
  | 'relogio'
  | 'seguranca'
  | 'sino'
  | 'texto'

type PropriedadesDoIcone = {
  nome: NomeDoIcone
  className?: string
}

const caminhos: Record<NomeDoIcone, React.ReactNode> = {
  adicionar: <path d="M12 5v14M5 12h14" />,
  ajustes: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  camadas: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  chevron: <path d="m8 10 4 4 4-4" />,
  destinatario: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4.1 3-6 7-6s6.2 1.9 7 6" />
    </>
  ),
  editar: (
    <>
      <path d="m14.5 5.5 4 4" />
      <path d="m5 19 1-4L16.7 4.3a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2L9 18l-4 1Z" />
    </>
  ),
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" />
    </>
  ),
  imagem: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m5.5 17 4.2-4 3.1 2.8 2.4-2.2 3.3 3.4" />
    </>
  ),
  inicio: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  localizacao: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  seguranca: (
    <>
      <path d="M12 3 5 6v5c0 4.8 2.7 8.4 7 10 4.3-1.6 7-5.2 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sino: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" />
      <path d="M10 21h4" />
    </>
  ),
  texto: (
    <>
      <path d="M5 6h14M12 6v13M8 19h8" />
    </>
  ),
}

export default function IconeEntrela({ nome, className = '' }: PropriedadesDoIcone) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {caminhos[nome]}
    </svg>
  )
}
