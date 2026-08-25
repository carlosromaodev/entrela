import { useState } from 'react'

export default function PreVisualizacaoPublica() {
  const [token] = useState('token-demo')
  const [estado] = useState<'espera' | 'ativa' | 'expirada'>('espera')

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pré-visualização pública</h1>
      <p className="mb-2">Estado: <strong>{estado}</strong></p>
      <p className="mb-4">Token: <code>{token}</code></p>
      <p className="text-sm text-gray-600">A página pública só mostra conteúdo quando o estado é <strong>ativa</strong> e o token é válido.</p>
    </div>
  )
}
