import type { Pool, PoolClient } from "pg";

import type {
  Consentimento,
  Finalidade,
  PapelDeDados,
  RepositorioDePessoas,
} from "./contratos.js";

export async function comTenant<T>(
  pool: Pool,
  negocioId: string,
  fn: (c: PoolClient) => Promise<T>,
): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT set_config('app.negocio_id',$1,true)", [negocioId]);
    const resultado = await fn(c);
    await c.query("COMMIT");
    return resultado;
  } catch (erro) {
    await c.query("ROLLBACK");
    throw erro;
  } finally {
    c.release();
  }
}

export class RepositorioDePessoasPostgresql implements RepositorioDePessoas {
  constructor(private readonly pool: Pool) {}
  async guardarConsentimento(c: Consentimento) {
    await comTenant(this.pool, c.negocioId, async (db) => {
      await db.query(
        `INSERT INTO consentimentos (id,negocio_id,contacto_id,finalidade,versao,concedido_em)
       VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          c.id,
          c.negocioId,
          c.contactoId,
          c.finalidade,
          c.versao,
          c.concedidoEm,
        ],
      );
    });
  }
  async obterConsentimentoAtivo(
    negocioId: string,
    contactoId: string,
    finalidade: Finalidade,
  ) {
    return comTenant(this.pool, negocioId, async (db) => {
      const r = await db.query<{
        concedido_em: Date;
        contacto_id: string;
        finalidade: Finalidade;
        id: string;
        negocio_id: string;
        versao: string;
      }>(
        `SELECT * FROM consentimentos WHERE negocio_id=$1 AND contacto_id=$2 AND finalidade=$3
          AND revogado_em IS NULL ORDER BY concedido_em DESC LIMIT 1`,
        [negocioId, contactoId, finalidade],
      );
      const x = r.rows[0];
      return x === undefined
        ? null
        : {
            concedidoEm: x.concedido_em.toISOString(),
            contactoId: x.contacto_id,
            finalidade: x.finalidade,
            id: x.id,
            negocioId: x.negocio_id,
            versao: x.versao,
          };
    });
  }
  async revogarConsentimento(
    negocioId: string,
    contactoId: string,
    finalidade: Finalidade,
    instante: string,
  ) {
    return comTenant(
      this.pool,
      negocioId,
      async (db) =>
        (
          await db.query(
            `UPDATE consentimentos SET revogado_em=$4 WHERE negocio_id=$1 AND contacto_id=$2
       AND finalidade=$3 AND revogado_em IS NULL`,
            [negocioId, contactoId, finalidade, instante],
          )
        ).rowCount! > 0,
    );
  }
  async guardarResposta(
    e: Parameters<RepositorioDePessoas["guardarResposta"]>[0],
  ) {
    await comTenant(this.pool, e.negocioId, async (db) => {
      await db.query(
        `INSERT INTO respostas_pessoais (negocio_id,contacto_id,chave,finalidade,classificacao,papeis_permitidos,reter_ate,valor_protegido)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (negocio_id,contacto_id,chave) DO UPDATE SET valor_protegido=excluded.valor_protegido,reter_ate=excluded.reter_ate`,
        [
          e.negocioId,
          e.contactoId,
          e.campo.chave,
          e.campo.finalidade,
          e.campo.classificacao,
          e.campo.papeisPermitidos,
          e.campo.reterAte,
          e.valorProtegido,
        ],
      );
    });
  }
  async lerResposta(
    negocioId: string,
    contactoId: string,
    chave: string,
    papel: PapelDeDados,
    agora: string,
  ) {
    return comTenant(
      this.pool,
      negocioId,
      async (db) =>
        (
          await db.query<{ valor_protegido: string }>(
            `SELECT valor_protegido FROM respostas_pessoais WHERE negocio_id=$1 AND contacto_id=$2 AND chave=$3
       AND $4=ANY(papeis_permitidos) AND reter_ate>$5`,
            [negocioId, contactoId, chave, papel, agora],
          )
        ).rows[0]?.valor_protegido ?? null,
    );
  }
  async eliminarExpirados(negocioId: string, agora: string) {
    return comTenant(this.pool, negocioId, async (db) => {
      const r = await db.query(
        "DELETE FROM respostas_pessoais WHERE negocio_id=$1 AND reter_ate <= $2",
        [negocioId, agora],
      );
      return r.rowCount ?? 0;
    });
  }
}
