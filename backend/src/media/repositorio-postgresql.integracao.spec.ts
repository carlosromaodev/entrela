import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { beforeAll, describe, expect, it } from "vitest";

import {
  FilaDeMediaPostgresql,
  RepositorioDeMediaPostgresql,
} from "./repositorio-postgresql.js";

const url = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO;

describe.skipIf(!url)("media em PostgreSQL 18 real", () => {
  const pool = new Pool({ connectionString: url, max: 10 });

  beforeAll(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ficheiros (
        id uuid PRIMARY KEY, negocio_id uuid NOT NULL, experiencia_id uuid NOT NULL,
        criado_por_utilizador_id uuid NOT NULL, tipo text NOT NULL, estado text NOT NULL,
        mime_declarado text NOT NULL, mime_detetado text, tamanho_declarado bigint NOT NULL,
        tamanho_verificado bigint, objecto_original text NOT NULL, objecto_seguro text,
        soma_sha256 char(64), largura integer, altura integer,
        duracao_em_milissegundos bigint, problema_tecnico text,
        criado_em timestamptz NOT NULL DEFAULT now(), atualizado_em timestamptz NOT NULL DEFAULT now(),
        UNIQUE (negocio_id, objecto_original)
      );
      CREATE TABLE IF NOT EXISTS trabalhos_de_media (
        id bigserial PRIMARY KEY, ficheiro_id uuid NOT NULL, negocio_id uuid NOT NULL,
        tipo text NOT NULL, estado text NOT NULL, dono_do_lease text,
        lease_expira_em timestamptz, criado_em timestamptz NOT NULL DEFAULT now(),
        UNIQUE (ficheiro_id, tipo)
      );
      CREATE TABLE IF NOT EXISTS ficheiros_do_bloco (
        negocio_id uuid NOT NULL, bloco_id uuid NOT NULL, ficheiro_id uuid NOT NULL,
        PRIMARY KEY (bloco_id, ficheiro_id)
      );
      ALTER TABLE ficheiros ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ficheiros FORCE ROW LEVEL SECURITY;
      ALTER TABLE trabalhos_de_media ENABLE ROW LEVEL SECURITY;
      ALTER TABLE trabalhos_de_media FORCE ROW LEVEL SECURITY;
      ALTER TABLE ficheiros_do_bloco ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ficheiros_do_bloco FORCE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS ficheiros_por_negocio ON ficheiros;
      CREATE POLICY ficheiros_por_negocio ON ficheiros USING (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      ) WITH CHECK (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      );
      DROP POLICY IF EXISTS trabalhos_de_media_por_negocio ON trabalhos_de_media;
      CREATE POLICY trabalhos_de_media_por_negocio ON trabalhos_de_media USING (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      ) WITH CHECK (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      );
      DROP POLICY IF EXISTS ficheiros_do_bloco_por_negocio ON ficheiros_do_bloco;
      CREATE POLICY ficheiros_do_bloco_por_negocio ON ficheiros_do_bloco USING (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      ) WITH CHECK (
        negocio_id = nullif(current_setting('app.negocio_id', true), '')::uuid
      );
    `);
  });

  async function prepararNegocio() {
    const utilizadorId = randomUUID();
    const negocioId = randomUUID();
    await pool.query(
      "INSERT INTO utilizadores (id,email,nome_de_apresentacao) VALUES ($1,$2,$3)",
      [utilizadorId, `${utilizadorId}@media.invalid`, "Media"],
    );
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query("SELECT set_config('app.negocio_id',$1,true)", [
        negocioId,
      ]);
      await cliente.query(
        `INSERT INTO negocios (id,identificador_publico,nome_de_apresentacao,tipo,codigo_do_pais)
         VALUES ($1,$2,'Media','PESSOAL','AO')`,
        [negocioId, `media-${negocioId}`],
      );
      await cliente.query(
        `INSERT INTO membros_do_negocio (id,negocio_id,utilizador_id,papel,estado)
         VALUES ($1,$2,$3,'EDITOR','ATIVO')`,
        [randomUUID(), negocioId, utilizadorId],
      );
      await cliente.query("COMMIT");
    } finally {
      cliente.release();
    }
    return { negocioId, utilizadorId };
  }

  async function criarBloco(negocioId: string, utilizadorId: string) {
    const experienciaId = randomUUID();
    const versaoId = randomUUID();
    const blocoId = randomUUID();
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query("SELECT set_config('app.negocio_id',$1,true)", [
        negocioId,
      ]);
      await cliente.query(
        `INSERT INTO experiencias
        (id,negocio_id,categoria,criado_por_utilizador_id) VALUES($1,$2,'MOMENTOS',$3)`,
        [experienciaId, negocioId, utilizadorId],
      );
      await cliente.query(
        `INSERT INTO versoes_da_experiencia
        (id,experiencia_id,numero,criado_por_utilizador_id) VALUES($1,$2,1,$3)`,
        [versaoId, experienciaId, utilizadorId],
      );
      await cliente.query(
        `INSERT INTO blocos
        (id,versao_da_experiencia_id,chave_do_bloco,posicao,tipo) VALUES($1,$2,'etapa',1,'ETAPA')`,
        [blocoId, versaoId],
      );
      await cliente.query("COMMIT");
    } finally {
      cliente.release();
    }
    return { blocoId, experienciaId };
  }

  it("prova role não-superuser e isolamento RLS entre negócios", async () => {
    const role = await pool.query<{ rolsuper: boolean }>(
      "SELECT rolsuper FROM pg_roles WHERE rolname=current_user",
    );
    expect(role.rows[0]?.rolsuper).toBe(false);
    const a = await prepararNegocio();
    const b = await prepararNegocio();
    const conteudoA = await criarBloco(a.negocioId, a.utilizadorId);
    const conteudoB = await criarBloco(b.negocioId, b.utilizadorId);
    const repositorio = new RepositorioDeMediaPostgresql(pool);
    const ficheiroId = randomUUID();
    await repositorio.criar({
      criadoPorUtilizadorId: a.utilizadorId,
      estado: "PENDENTE",
      experienciaId: conteudoA.experienciaId,
      id: ficheiroId,
      mimeDeclarado: "image/png",
      negocioId: a.negocioId,
      objectoOriginal: `negocios/${a.negocioId}/media/${ficheiroId}/original`,
      tamanhoDeclarado: 24,
      tipo: "IMAGEM",
    });
    await expect(
      repositorio.obter(a.negocioId, ficheiroId),
    ).resolves.toMatchObject({ id: ficheiroId });
    await expect(
      repositorio.obter(b.negocioId, ficheiroId),
    ).resolves.toBeNull();
    const pendente = (await repositorio.obter(a.negocioId, ficheiroId))!;
    await repositorio.atualizar({ ...pendente, estado: "PRONTO" });
    await expect(
      repositorio.associarAoBlocoSePronto({
        blocoId: conteudoB.blocoId,
        ficheiroId,
        negocioId: a.negocioId,
      }),
    ).resolves.toBe(false);
    await expect(
      repositorio.associarAoBlocoSePronto({
        blocoId: conteudoA.blocoId,
        ficheiroId,
        negocioId: a.negocioId,
      }),
    ).resolves.toBe(true);

    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query("SELECT set_config('app.negocio_id',$1,true)", [
        b.negocioId,
      ]);
      await expect(
        cliente.query(
          `INSERT INTO ficheiros (id,negocio_id,experiencia_id,criado_por_utilizador_id,tipo,estado,
         mime_declarado,tamanho_declarado,objecto_original) VALUES ($1,$2,$3,$4,'IMAGEM','PENDENTE','image/png',24,$5)`,
          [
            randomUUID(),
            a.negocioId,
            randomUUID(),
            b.utilizadorId,
            `cruzado-${randomUUID()}`,
          ],
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await cliente.query("ROLLBACK");
    } finally {
      cliente.release();
    }
  });

  it("deduplica agendamento concorrente pela chave do outbox", async () => {
    const { negocioId, utilizadorId } = await prepararNegocio();
    const ficheiroId = randomUUID();
    const repositorio = new RepositorioDeMediaPostgresql(pool);
    await repositorio.criar({
      criadoPorUtilizadorId: utilizadorId,
      estado: "PROCESSANDO",
      experienciaId: randomUUID(),
      id: ficheiroId,
      mimeDeclarado: "image/png",
      negocioId,
      objectoOriginal: `negocios/${negocioId}/media/${ficheiroId}/original`,
      tamanhoDeclarado: 24,
      tipo: "IMAGEM",
    });
    const fila = new FilaDeMediaPostgresql(pool);
    const ficheiro = (await repositorio.obter(negocioId, ficheiroId))!;
    const estados = await Promise.all(
      Array.from({ length: 10 }, () => fila.confirmarEAgendar(ficheiro)),
    );
    expect(estados.every((estado) => estado === "PROCESSANDO")).toBe(true);
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query("SELECT set_config('app.negocio_id',$1,true)", [
        negocioId,
      ]);
      const resultado = await cliente.query(
        "SELECT count(*)::int AS total FROM trabalhos_de_media WHERE ficheiro_id=$1",
        [ficheiroId],
      );
      expect(resultado.rows[0]?.total).toBe(1);
      await cliente.query("ROLLBACK");
    } finally {
      cliente.release();
    }

    const reclamacoes = await Promise.all([
      fila.reclamar(negocioId, new Date(), "worker-a"),
      fila.reclamar(negocioId, new Date(), "worker-b"),
    ]);
    expect(reclamacoes.filter(Boolean)).toHaveLength(1);
    const trabalho = reclamacoes.find((item) => item !== null)!;
    const atual = (await repositorio.obter(negocioId, ficheiroId))!;
    const transicoes = await Promise.all([
      repositorio.atualizarSeProcessando({ ...atual, estado: "PRONTO" }),
      repositorio.atualizarSeProcessando({
        ...atual,
        estado: "FALHOU",
        problemaTecnico: "CORRIDA_PERDIDA",
      }),
    ]);
    expect(transicoes.filter(Boolean)).toHaveLength(1);
    await expect(fila.concluir(trabalho.id, negocioId)).resolves.toBe(true);
    await expect(fila.concluir(trabalho.id, negocioId)).resolves.toBe(false);
  });
});
