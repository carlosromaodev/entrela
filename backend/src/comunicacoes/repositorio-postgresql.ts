import type { Pool } from "pg";
import { comTenant } from "../pessoas/repositorio-postgresql.js";
import type { MensagemOutbox, RepositorioDeComunicacoes } from "./contratos.js";

export class RepositorioDeComunicacoesPostgresql
  implements RepositorioDeComunicacoes
{
  constructor(private readonly pool: Pool) {}
  async criarSePermitida(m: MensagemOutbox) {
    return comTenant(this.pool, m.negocioId, async (db) => {
      const bloqueada = await db.query(
        `SELECT 1 FROM supressoes WHERE negocio_id=$1 AND contacto_id=$2 AND finalidade=$3`,
        [m.negocioId, m.contactoId, m.finalidade],
      );
      if (bloqueada.rowCount) return "SUPRIMIDA" as const;
      await db.query(
        `INSERT INTO mensagens_outbox (id,negocio_id,contacto_id,finalidade,payload_protegido,estado,tentativas)
      VALUES ($1,$2,$3,$4,$5,'PENDENTE',0) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.negocioId, m.contactoId, m.finalidade, m.payloadProtegido],
      );
      return "CRIADA" as const;
    });
  }
  async reclamar(negocioId: string, trabalhador: string, agora: string) {
    return comTenant(this.pool, negocioId, async (db) => {
      const r = await db.query(
        `UPDATE mensagens_outbox SET estado='PROCESSANDO',trabalhador=$2,lease_expira_em=$3::timestamptz+interval '2 minutes'
      WHERE id=(SELECT id FROM mensagens_outbox WHERE negocio_id=$1 AND (estado='PENDENTE' OR (estado='PROCESSANDO' AND lease_expira_em<=$3))
      AND (tentar_em IS NULL OR tentar_em<=$3) ORDER BY criado_em FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`,
        [negocioId, trabalhador, agora],
      );
      const x = r.rows[0];
      return x === undefined
        ? null
        : {
            contactoId: x.contacto_id,
            estado: x.estado,
            finalidade: x.finalidade,
            id: x.id,
            negocioId: x.negocio_id,
            payloadProtegido: x.payload_protegido,
            tentativas: x.tentativas,
          };
    });
  }
  async concluir(n: string, id: string, trabalhador: string) {
    return comTenant(
      this.pool,
      n,
      async (db) =>
        (
          await db.query(
            "UPDATE mensagens_outbox SET estado='ENVIADA',trabalhador=NULL,lease_expira_em=NULL WHERE negocio_id=$1 AND id=$2 AND estado='PROCESSANDO' AND trabalhador=$3",
            [n, id, trabalhador],
          )
        ).rowCount === 1,
    );
  }
  async falhar(
    n: string,
    id: string,
    trabalhador: string,
    t: string,
    terminal: boolean,
  ) {
    await comTenant(this.pool, n, async (db) => {
      await db.query(
        `UPDATE mensagens_outbox SET estado=$4,tentativas=tentativas+1,tentar_em=$5,lease_expira_em=NULL,trabalhador=NULL WHERE negocio_id=$1 AND id=$2 AND estado='PROCESSANDO' AND trabalhador=$3`,
        [n, id, trabalhador, terminal ? "FALHOU" : "PENDENTE", t],
      );
    });
  }
  async suprimirContacto(
    n: string,
    c: string,
    f: MensagemOutbox["finalidade"],
  ) {
    await comTenant(this.pool, n, async (db) => {
      await db.query(
        `INSERT INTO supressoes(negocio_id,contacto_id,finalidade) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
        [n, c, f],
      );
      await db.query(
        `UPDATE mensagens_outbox SET estado='SUPRIMIDA' WHERE negocio_id=$1 AND contacto_id=$2 AND finalidade=$3 AND estado IN ('PENDENTE','PROCESSANDO')`,
        [n, c, f],
      );
    });
  }
}
