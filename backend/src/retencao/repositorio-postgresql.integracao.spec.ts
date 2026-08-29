import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { beforeAll, describe, expect, it } from "vitest";
import { RepositorioDeRetencaoPostgresql } from "./repositorio-postgresql.js";
const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO;
describe.skipIf(!url)("retenção PG18/RLS", () => {
  const pool = new Pool({ connectionString: url });
  beforeAll(async () => {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS politicas_de_retencao(negocio_id uuid,experiencia_id uuid,estado text,instante_base timestamptz,avisos_enviados int default 0,exportacao text default 'NAO_PEDIDA',eliminada_em timestamptz,primary key(negocio_id,experiencia_id));ALTER TABLE politicas_de_retencao ENABLE ROW LEVEL SECURITY;ALTER TABLE politicas_de_retencao FORCE ROW LEVEL SECURITY;DROP POLICY IF EXISTS tenant ON politicas_de_retencao;CREATE POLICY tenant ON politicas_de_retencao USING(negocio_id=nullif(current_setting('app.negocio_id',true),'')::uuid) WITH CHECK(negocio_id=nullif(current_setting('app.negocio_id',true),'')::uuid);`,
    );
  });
  it("não elimina sem exportação pronta e isola negócio", async () => {
    const n = randomUUID(),
      outro = randomUUID(),
      e = randomUUID(),
      c = await pool.connect();
    await c.query("BEGIN");
    await c.query("select set_config('app.negocio_id',$1,true)", [n]);
    await c.query(
      "insert into politicas_de_retencao(negocio_id,experiencia_id,estado,instante_base) values($1,$2,'ARQUIVADA',now()-interval '100 days')",
      [n, e],
    );
    await c.query("COMMIT");
    c.release();
    const r = new RepositorioDeRetencaoPostgresql(pool, async () => [n]);
    await r.eliminar(n, e);
    expect(
      (await r.listarCandidatos(new Date().toISOString()))[0]?.exportacao,
    ).toBe("NAO_PEDIDA");
    await r.pedirExportacao(n, e);
    expect(
      (await r.listarCandidatos(new Date().toISOString()))[0]?.exportacao,
    ).toBe("PENDENTE");
    const rOutro = new RepositorioDeRetencaoPostgresql(pool, async () => [
      outro,
    ]);
    expect(await rOutro.listarCandidatos(new Date().toISOString())).toEqual([]);
  });
});
