export interface PerfilDePercurso {
  id: string
  negocioId: string
  experienciaId: string
  nome: string
  idioma: 'pt-AO' | 'en'
  criadoEm: string
}

export interface ParagemDoPercurso {
  id: string
  perfilId: string
  ordem: number
  localId: string
  latitude: number
  longitude: number
  raioProximidadeMetros: number
  conteudoBlocoId?: string
}

export interface RepositorioDePercursos {
  criar(perfil: Omit<PerfilDePercurso, 'id'> & { paragens: Omit<ParagemDoPercurso, 'id' | 'perfilId'>[] }): Promise<PerfilDePercurso>
}
