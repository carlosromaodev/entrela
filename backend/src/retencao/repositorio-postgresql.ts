import type { Pool } from "pg";
import { comTenant } from "../pessoas/repositorio-postgresql.js";
import type { RepositorioDeRetencao } from "./contratos.js";
export class RepositorioDeRetencaoPostgresql implements RepositorioDeRetencao {
  constructor(
    private readonly pool: Pool,
    private readonly negocios: () => Promise<readonly string[]>,
  ) {}
  async listarCandidatos(agora: string) {
    const todos = [];
    for (const n of await this.negocios())
      todos.push(
        ...(await comTenant(this.pool, n, async (db) =>
          (
            await db.query(
              `SELECT negocio_id,experiencia_id,estado,instante_base,avisos_enviados,exportacao FROM politicas_de_retencao WHERE negocio_id=$1 AND instante_base<=$2`,
              [n, agora],
            )
          ).rows.map((x) => ({
            avisosEnviados: x.avisos_enviados,
            estado: x.estado,
            experienciaId: x.experiencia_id,
            exportacao: x.exportacao,
            instanteBase: x.instante_base.toISOString(),
            negocioId: x.negocio_id,
          })),
        )),
      );
    return todos;
  }
  async registarAviso(n: string, e: string, numero: number) {
    await comTenant(this.pool, n, async (db) => {
      await db.query(
        "UPDATE politicas_de_retencao SET avisos_enviados=GREATEST(avisos_enviados,$3) WHERE negocio_id=$1 AND experiencia_id=$2",
        [n, e, numero],
      );
    });
  }
  async pedirExportacao(n: string, e: string) {
    await comTenant(this.pool, n, async (db) => {
      await db.query(
        "UPDATE politicas_de_retencao SET exportacao='PENDENTE' WHERE negocio_id=$1 AND experiencia_id=$2 AND exportacao='NAO_PEDIDA'",
        [n, e],
      );
    });
  }
  async eliminar(n: string, e: string) {
    await comTenant(this.pool, n, async (db) => {
      await db.query(
        "UPDATE politicas_de_retencao SET eliminada_em=now() WHERE negocio_id=$1 AND experiencia_id=$2 AND exportacao='PRONTA'",
        [n, e],
      );
    });
  }
}
