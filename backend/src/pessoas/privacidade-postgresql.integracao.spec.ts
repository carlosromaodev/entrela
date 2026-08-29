import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { beforeAll, describe, expect, it } from "vitest";
import { RepositorioDeComunicacoesPostgresql } from "../comunicacoes/repositorio-postgresql.js";
import { RepositorioDeModeracaoPostgresql } from "../moderacao/repositorio-postgresql.js";
import { RepositorioDePessoasPostgresql } from "./repositorio-postgresql.js";
const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO;
describe.skipIf(!url)("privacidade/comunicações/moderação PG18", () => {
  const pool = new Pool({ connectionString: url });
  beforeAll(async () => {
    await pool.query(`
 CREATE TABLE IF NOT EXISTS consentimentos(id uuid primary key,negocio_id uuid not null,contacto_id uuid not null,finalidade text not null,versao text not null,concedido_em timestamptz not null,revogado_em timestamptz);
 CREATE UNIQUE INDEX IF NOT EXISTS consentimento_ativo_unico ON consentimentos(negocio_id,contacto_id,finalidade) WHERE revogado_em IS NULL;
 CREATE TABLE IF NOT EXISTS respostas_pessoais(negocio_id uuid,contacto_id uuid,chave text,finalidade text,classificacao text,papeis_permitidos text[],reter_ate timestamptz,valor_protegido text,primary key(negocio_id,contacto_id,chave));
 CREATE TABLE IF NOT EXISTS supressoes(negocio_id uuid,contacto_id uuid,finalidade text,primary key(negocio_id,contacto_id,finalidade));
 CREATE TABLE IF NOT EXISTS mensagens_outbox(id uuid primary key,negocio_id uuid,contacto_id uuid,finalidade text,payload_protegido text,estado text,tentativas int,trabalhador text,lease_expira_em timestamptz,tentar_em timestamptz,criado_em timestamptz default now());
 CREATE TABLE IF NOT EXISTS contribuicoes(id uuid primary key,negocio_id uuid,estado text,conteudo_protegido text,removida_em timestamptz,removida_por uuid,motivo text);
 DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['consentimentos','respostas_pessoais','supressoes','mensagens_outbox','contribuicoes'] LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);EXECUTE format('DROP POLICY IF EXISTS tenant ON %I',t);EXECUTE format('CREATE POLICY tenant ON %I USING (negocio_id=nullif(current_setting(''app.negocio_id'',true),'''')::uuid) WITH CHECK (negocio_id=nullif(current_setting(''app.negocio_id'',true),'''')::uuid)',t);END LOOP;END$$;
 `);
  });
  it("isola consentimento, revoga finalidade e suprime outbox", async () => {
    const n = randomUUID(),
      outro = randomUUID(),
      c = randomUUID(),
      id = randomUUID();
    const p = new RepositorioDePessoasPostgresql(pool);
    await p.guardarConsentimento({
      concedidoEm: new Date().toISOString(),
      contactoId: c,
      finalidade: "MARKETING_PROPRIO",
      id,
      negocioId: n,
      versao: "v1",
    });
    expect(
      await p.obterConsentimentoAtivo(outro, c, "MARKETING_PROPRIO"),
    ).toBeNull();
    expect(
      await p.revogarConsentimento(
        n,
        c,
        "MARKETING_PROPRIO",
        new Date().toISOString(),
      ),
    ).toBe(true);
    expect(
      await p.obterConsentimentoAtivo(n, c, "MARKETING_PROPRIO"),
    ).toBeNull();
    const r = new RepositorioDeComunicacoesPostgresql(pool);
    await r.suprimirContacto(n, c, "MARKETING_PROPRIO");
    expect(
      await r.criarSePermitida({
        contactoId: c,
        estado: "PENDENTE",
        finalidade: "MARKETING_PROPRIO",
        id: randomUUID(),
        negocioId: n,
        payloadProtegido: "x",
        tentativas: 0,
      }),
    ).toBe("SUPRIMIDA");
  });
  it("dois workers reclamam uma mensagem uma vez e moderação remove só um item", async () => {
    const n = randomUUID(),
      c = randomUUID(),
      r = new RepositorioDeComunicacoesPostgresql(pool),
      id = randomUUID();
    await r.criarSePermitida({
      contactoId: c,
      estado: "PENDENTE",
      finalidade: "OPERACIONAL",
      id,
      negocioId: n,
      payloadProtegido: "x",
      tentativas: 0,
    });
    const claims = await Promise.all([
      r.reclamar(n, "a", new Date().toISOString()),
      r.reclamar(n, "b", new Date().toISOString()),
    ]);
    expect(claims.filter(Boolean)).toHaveLength(1);
    const c1 = randomUUID(),
      c2 = randomUUID();
    const db = await pool.connect();
    await db.query("BEGIN");
    await db.query("select set_config('app.negocio_id',$1,true)", [n]);
    await db.query(
      "insert into contribuicoes(id,negocio_id,estado,conteudo_protegido) values($1,$3,'ATIVA','a'),($2,$3,'ATIVA','b')",
      [c1, c2, n],
    );
    await db.query("COMMIT");
    db.release();
    const m = new RepositorioDeModeracaoPostgresql(pool);
    expect(
      await m.removerContribuicao({
        contribuicaoId: c1,
        moderadorId: randomUUID(),
        motivo: "spam",
        negocioId: n,
      }),
    ).toBe(true);
    const db2 = await pool.connect();
    await db2.query("BEGIN");
    await db2.query("select set_config('app.negocio_id',$1,true)", [n]);
    const estados = await db2.query(
      "select id,estado from contribuicoes where negocio_id=$1 order by id",
      [n],
    );
    await db2.query("ROLLBACK");
    db2.release();
    expect(estados.rows.find((x) => x.id === c1).estado).toBe("REMOVIDA");
    expect(estados.rows.find((x) => x.id === c2).estado).toBe("ATIVA");
  });
});
