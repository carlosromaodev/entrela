import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaginaInicial from './paginas/PaginaInicial'
import CriarRascunho from './paginas/CriarRascunho'
import EditarConteudo from './paginas/EditarConteudo'
import PreVisualizacaoPublica from './paginas/PreVisualizacaoPublica'
import PaginaPublicaDestinatario from './paginas/PaginaPublicaDestinatario'

export default function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/rascunho" element={<CriarRascunho />} />
        <Route path="/editar" element={<EditarConteudo />} />
        <Route path="/pre-visualizacao" element={<PreVisualizacaoPublica />} />
        <Route path="/publico/:token" element={<PaginaPublicaDestinatario />} />
      </Routes>
    </BrowserRouter>
  )
}
