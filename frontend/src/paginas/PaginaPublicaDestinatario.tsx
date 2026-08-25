import { useState, useEffect } from 'react'

export default function PaginaPublicaDestinatario() {
  const [estado, setEstado] = useState<'espera' | 'ativa' | 'expirada' | 'negada'>('espera')
  const [idioma, setIdioma] = useState<'pt-AO' | 'en'>('pt-AO')
  const [etapaAtual, setEtapaAtual] = useState(1)

  useEffect(() => {
    // Simula verificação do token/QR
    const timer = setTimeout(() => setEstado('ativa'), 500)
    return () => clearTimeout(timer)
  }, [])

  const continuar = () => {
    if (estado !== 'ativa') return
    setEtapaAtual(e => Math.min(e + 1, 3))
  }

  return (
    <div className="p-6 max-w-lg mx-auto" lang={idioma === 'pt-AO' ? 'pt-AO' : 'en'}>
      <h1 className="text-2xl font-bold mb-4">{idioma === 'pt-AO' ? 'Experiência' : 'Experience'}</h1>
      <p className="mb-2">Estado: <strong>{estado}</strong></p>
      <p className="mb-4">Etapa: {etapaAtual} / 3</p>
      {estado === 'espera' && <p>{idioma === 'pt-AO' ? 'Aguardando abertura...' : 'Waiting for opening...'}</p>}
      {estado === 'ativa' && (
        <>
          <p>{idioma === 'pt-AO' ? 'Conteúdo disponível.' : 'Content available.'}</p>
          <button onClick={continuar} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Continuar</button>
        </>
      )}
      {(estado === 'expirada' || estado === 'negada') && (
        <p className="text-red-600">{idioma === 'pt-AO' ? 'Acesso negado ou expirado.' : 'Access denied or expired.'}</p>
      )}
    </div>
  )
}
