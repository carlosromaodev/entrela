export async function criarRascunho(dados: { nome: string; categoria: string }) {
  const res = await fetch('/api/rascunhos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Falha ao criar rascunho')
  return res.json()
}

export async function publicarExperiencia(id: string) {
  const res = await fetch(`/api/experiencias/${id}/publicar`, { method: 'POST' })
  if (!res.ok) throw new Error('Falha ao publicar')
  return res.json()
}
