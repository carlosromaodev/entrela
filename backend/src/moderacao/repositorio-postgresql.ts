import type { Pool } from "pg";
import { comTenant } from "../pessoas/repositorio-postgresql.js";
import type { RepositorioDeModeracao } from "./contratos.js";
export class RepositorioDeModeracaoPostgresql
  implements RepositorioDeModeracao
{
  constructor(private readonly pool: Pool) {}
  async removerContribuicao(
    e: Parameters<RepositorioDeModeracao["removerContribuicao"]>[0],
  ) {
    return comTenant(this.pool, e.negocioId, async (db) => {
      const r = await db.query(
        `UPDATE contribuicoes SET estado='REMOVIDA',conteudo_protegido=NULL,removida_em=now(),removida_por=$3,motivo=$4
   WHERE negocio_id=$1 AND id=$2 AND estado='ATIVA'`,
        [e.negocioId, e.contribuicaoId, e.moderadorId, e.motivo],
      );
      return r.rowCount === 1;
    });
  }
}
