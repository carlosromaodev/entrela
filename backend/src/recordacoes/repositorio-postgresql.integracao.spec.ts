import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { beforeAll, describe, expect, it } from "vitest";
import { RepositorioDeRecordacoesPostgresql } from "./repositorio-postgresql.js";
const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO;
describe.skipIf(!url)("recordações PG18/RLS/idempotência", () => {
  const pool = new Pool({ connectionString: url });
  beforeAll(async () => {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS conclusoes_de_destinatarios(negocio_id uuid,experiencia_id uuid,destinatario_id uuid,primary key(negocio_id,experiencia_id,destinatario_id));CREATE TABLE IF NOT EXISTS pedidos_de_recordacao(id uuid primary key,negocio_id uuid,experiencia_id uuid,requerente_id uuid,tipo_do_requerente text,formato text,estado text,objecto text,unique(negocio_id,experiencia_id,requerente_id,tipo_do_requerente,formato));DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['conclusoes_de_destinatarios','pedidos_de_recordacao'] LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);EXECUTE format('DROP POLICY IF EXISTS tenant ON %I',t);EXECUTE format('CREATE POLICY tenant ON %I USING(negocio_id=nullif(current_setting(''app.negocio_id'',true),'''')::uuid) WITH CHECK(negocio_id=nullif(current_setting(''app.negocio_id'',true),'''')::uuid)',t);END LOOP;END$$;`,
    );
  });
  it("reutiliza pedido concorrente e isola tenant", async () => {
    const n = randomUUID(),
      outro = randomUUID(),
      e = randomUUID(),
      u = randomUUID(),
      r = new RepositorioDeRecordacoesPostgresql(pool),
      base = {
        estado: "PENDENTE" as const,
        experienciaId: e,
        formato: "HTML" as const,
        negocioId: n,
        requerenteId: u,
        tipoDoRequerente: "CRIADOR" as const,
      };
    const [a, b] = await Promise.all([
      r.criarOuObter({ ...base, id: randomUUID() }),
      r.criarOuObter({ ...base, id: randomUUID() }),
    ]);
    expect(a.id).toBe(b.id);
    const c = await pool.connect();
    await c.query("BEGIN");
    await c.query("select set_config('app.negocio_id',$1,true)", [outro]);
    expect(
      (
        await c.query(
          "select * from pedidos_de_recordacao where experiencia_id=$1",
          [e],
        )
      ).rowCount,
    ).toBe(0);
    await c.query("ROLLBACK");
    c.release();
  });
});
