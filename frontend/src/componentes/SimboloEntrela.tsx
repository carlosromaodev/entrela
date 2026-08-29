type PropriedadesDoSimboloEntrela = {
  className?: string
}

export default function SimboloEntrela({ className = '' }: PropriedadesDoSimboloEntrela) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M33.5 28.4A14.2 14.2 0 1 1 34.2 20H6.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.35"
      />
    </svg>
  )
}
