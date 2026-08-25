import { useState } from 'react'

export default function CriarRascunho() {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<'Momentos' | 'Convites' | 'Experiencias'>('Momentos')
  const [salvo, setSalvo] = useState(false)

  const salvar = () => {
    if (!nome.trim()) return
    setSalvo(true)
    // Aqui chamaria o serviço criar-momento ou criar-percurso-gps
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar rascunho</h1>
      <label className="block mb-2">Categoria</label>
      <select value={categoria} onChange={e => setCategoria(e.target.value as any)} className="border p-2 mb-4 w-full">
        <option>Momentos</option>
        <option>Convites</option>
        <option>Experiencias</option>
      </select>
      <label className="block mb-2">Nome</label>
      <input value={nome} onChange={e => setNome(e.target.value)} className="border p-2 mb-4 w-full" placeholder="Título do momento" />
      <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar rascunho</button>
      {salvo && <p className="mt-2 text-green-600">Rascunho guardado.</p>}
    </div>
  )
}
