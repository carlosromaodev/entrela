import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Rotas from './Rotas'
import { ProvedorDoFluxoDoMomento } from './contextos/FluxoDoMomento'
import './estilos/pagina-inicial.css'
import './estilos/pagina-de-login.css'
import './estilos/area-interna.css'
import './estilos/experiencia-publica.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorDoFluxoDoMomento>
      <Rotas />
    </ProvedorDoFluxoDoMomento>
  </StrictMode>,
)
