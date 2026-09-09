import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaginaInicial from './paginas/PaginaInicial'
import CriarRascunho from './paginas/CriarRascunho'
import EditarConteudo from './paginas/EditarConteudo'
import PreVisualizacaoPublica from './paginas/PreVisualizacaoPublica'
import PaginaPublicaDestinatario from './paginas/PaginaPublicaDestinatario'
import PaginaDeEvento from './paginas/PaginaDeEvento'
import PaginaDeLogin from './paginas/PaginaDeLogin'
import Painel from './paginas/Painel'
import Configuracoes from './paginas/Configuracoes'
import ConfirmarAcesso from './paginas/ConfirmarAcesso'

export default function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/entrar" element={<PaginaDeLogin />} />
        <Route path="/acesso/confirmar" element={<ConfirmarAcesso />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/configuracoes/:secao" element={<Configuracoes />} />
        <Route path="/rascunho" element={<CriarRascunho />} />
        <Route path="/editar" element={<EditarConteudo />} />
        <Route path="/pre-visualizacao" element={<PreVisualizacaoPublica />} />
        <Route path="/publico/:token" element={<PaginaPublicaDestinatario />} />
        <Route path="/eventos" element={<PaginaDeEvento />} />
        <Route path="/eventos/:id" element={<PaginaDeEvento />} />
      </Routes>
    </BrowserRouter>
  )
}
