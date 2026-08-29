import type { Pool } from 'pg'
import type { RepositorioDePercursos, PerfilDePercurso, ParagemDoPercurso } from './contratos/repositorio-de-percursos.js'

export class RepositorioDePercursosPostgres implements RepositorioDePercursos {
  constructor(private readonly pool: Pool) {}

  async criar(perfil: Omit<PerfilDePercurso, 'id'> & { paragens: Omit<ParagemDoPercurso, 'id' | 'perfilId'>[] }): Promise<PerfilDePercurso> {
    const cliente = await this.pool.connect()
    try {
      await cliente.query('BEGIN')
      const resultado = await cliente.query<{ id: string }>(
        `INSERT INTO perfis_de_percurso
          (negocio_id, experiencia_id, nome, idioma, criado_em)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [perfil.negocioId, perfil.experienciaId, perfil.nome, perfil.idioma, perfil.criadoEm],
      )
      const novoPerfil = resultado.rows[0]
      if (novoPerfil === undefined) throw new Error('PERCURSO_NAO_CRIADO')

      for (const paragem of perfil.paragens) {
        await cliente.query(
          `INSERT INTO paragens_do_percurso
            (perfil_id, ordem, local_id, latitude, longitude, raio_proximidade_metros, conteudo_bloco_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            novoPerfil.id,
            paragem.ordem,
            paragem.localId,
            paragem.latitude,
            paragem.longitude,
            paragem.raioProximidadeMetros,
            paragem.conteudoBlocoId ?? null,
          ],
        )
      }
      await cliente.query('COMMIT')
      return { id: novoPerfil.id, ...perfil }
    } catch (erro) {
      await cliente.query('ROLLBACK')
      throw erro
    } finally {
      cliente.release()
    }
  }
}
