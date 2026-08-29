import { createHash, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { beforeAll, describe, expect, it } from "vitest";
import { AuditoriaPostgresql } from "./auditoria.js";
import { LimitadorPostgresql } from "./rate-limit.js";
const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO;
describe.skipIf(!url)("segurança operacional PG18", () => {
  const p = new Pool({ connectionString: url });
  beforeAll(async () => {
    await p.query(
      `CREATE TABLE IF NOT EXISTS limites_de_taxa(chave_hmac char(64) primary key,inicia_em timestamptz,termina_em timestamptz,quantidade int);CREATE TABLE IF NOT EXISTS auditoria_operacional(id uuid primary key,negocio_id uuid,ator_id uuid,acao text,alvo_id uuid,resultado text,instante timestamptz);CREATE OR REPLACE RULE auditoria_sem_update AS ON UPDATE TO auditoria_operacional DO INSTEAD NOTHING;CREATE OR REPLACE RULE auditoria_sem_delete AS ON DELETE TO auditoria_operacional DO INSTEAD NOTHING;`,
    );
  });
  it("serializa consumos concorrentes e preserva auditoria append-only", async () => {
    const l = new LimitadorPostgresql(p),
      k = createHash("sha256").update(randomUUID()).digest("hex"),
      agora = new Date();
    const d = await Promise.all(
      Array.from({ length: 10 }, () => l.consumir(k, 5, 60, agora)),
    );
    expect(d.filter((x) => x.permitido)).toHaveLength(5);
    const a = new AuditoriaPostgresql(p),
      id = randomUUID();
    await a.acrescentar({
      acao: "TESTE",
      id,
      instante: agora.toISOString(),
      negocioId: randomUUID(),
      resultado: "SUCESSO",
    });
    await p.query("delete from auditoria_operacional where id=$1", [id]);
    expect(
      (await p.query("select 1 from auditoria_operacional where id=$1", [id]))
        .rowCount,
    ).toBe(1);
  });
});
