import { db } from '../db.js'
import type { RepositorioDePercursos, PerfilDePercurso, ParagemDoPercurso } from './contratos/repositorio-de-percursos.js'

export class RepositorioDePercursosPostgres implements RepositorioDePercursos {
  async criar(perfil: Omit<PerfilDePercurso, 'id'> & { paragens: Omit<ParagemDoPercurso, 'id' | 'perfilId'>[] }): Promise<PerfilDePercurso> {
    const [novoPerfil] = await db.insert('perfis_de_percurso').values({
      negocio_id: perfil.negocioId,
      experiencia_id: perfil.experienciaId,
      nome: perfil.nome,
      idioma: perfil.idioma,
      criado_em: perfil.criadoEm,
    }).returning('*')

    for (const p of perfil.paragens) {
      await db.insert('paragens_do_percurso').values({
        perfil_id: novoPerfil.id,
        ordem: p.ordem,
        local_id: p.localId,
        latitude: p.latitude,
        longitude: p.longitude,
        raio_proximidade_metros: p.raioProximidadeMetros,
        conteudo_bloco_id: p.conteudoBlocoId ?? null,
      })
    }
    return { id: novoPerfil.id, ...perfil }
  }
}
