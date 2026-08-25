import { useState } from 'react'

export default function EditarConteudo() {
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [publicado, setPublicado] = useState(false)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar conteúdo</h1>
      <label className="block mb-2">Título</label>
      <input value={titulo} onChange={e => setTitulo(e.target.value)} className="border p-2 mb-4 w-full" />
      <label className="block mb-2">Resumo</label>
      <textarea value={resumo} onChange={e => setResumo(e.target.value)} className="border p-2 mb-4 w-full h-32" />
      <button onClick={() => setPublicado(true)} className="bg-green-600 text-white px-4 py-2 rounded">Publicar</button>
      {publicado && <p className="mt-2 text-green-600">Experiência publicada.</p>}
    </div>
  )
}
