import type { Pool, PoolClient } from "pg";

import type { PapelDoNegocio } from "../service/politica-de-acesso-ao-negocio.js";
import type { RepositorioDeMedia } from "./contratos.js";
import type { FicheiroDeMedia } from "./dominio.js";

type LinhaDeFicheiro = Readonly<{
  altura: number | null;
  criado_por_utilizador_id: string;
  duracao_em_milissegundos: number | null;
  estado: FicheiroDeMedia["estado"];
  experiencia_id: string;
  id: string;
  largura: number | null;
  mime_declarado: string;
  mime_detetado: string | null;
  negocio_id: string;
  objecto_original: string;
  objecto_seguro: string | null;
  problema_tecnico: string | null;
  soma_sha256: string | null;
  tamanho_declarado: number;
  tamanho_verificado: number | null;
  tipo: FicheiroDeMedia["tipo"];
}>;

function mapear(linha: LinhaDeFicheiro): FicheiroDeMedia {
  return {
    ...(linha.altura === null ? {} : { altura: linha.altura }),
    criadoPorUtilizadorId: linha.criado_por_utilizador_id,
    ...(linha.duracao_em_milissegundos === null
      ? {}
      : { duracaoEmMilissegundos: linha.duracao_em_milissegundos }),
    estado: linha.estado,
    experienciaId: linha.experiencia_id,
    id: linha.id,
    ...(linha.largura === null ? {} : { largura: linha.largura }),
    mimeDeclarado: linha.mime_declarado,
    ...(linha.mime_detetado === null
      ? {}
      : { mimeDetetado: linha.mime_detetado }),
    negocioId: linha.negocio_id,
    objectoOriginal: linha.objecto_original,
    ...(linha.objecto_seguro === null
      ? {}
      : { objectoSeguro: linha.objecto_seguro }),
    ...(linha.problema_tecnico === null
      ? {}
      : { problemaTecnico: linha.problema_tecnico }),
    ...(linha.soma_sha256 === null ? {} : { somaSha256: linha.soma_sha256 }),
    tamanhoDeclarado: Number(linha.tamanho_declarado),
    ...(linha.tamanho_verificado === null
      ? {}
      : { tamanhoVerificado: Number(linha.tamanho_verificado) }),
    tipo: linha.tipo,
  };
}

async function comNegocio<T>(
  pool: Pool,
  negocioId: string,
  executar: (cliente: PoolClient) => Promise<T>,
): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    await cliente.query("SELECT set_config('app.negocio_id', $1, true)", [
      negocioId,
    ]);
    const resultado = await executar(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

export class RepositorioDeMediaPostgresql implements RepositorioDeMedia {
  constructor(private readonly pool: Pool) {}

  async associarAoBlocoSePronto(
    entrada: Readonly<{
      blocoId: string;
      ficheiroId: string;
      negocioId: string;
    }>,
  ): Promise<boolean> {
    return comNegocio(this.pool, entrada.negocioId, async (cliente) => {
      const resultado = await cliente.query(
        `INSERT INTO ficheiros_do_bloco (negocio_id, bloco_id, ficheiro_id)
         SELECT f.negocio_id,b.id,f.id FROM ficheiros f
         JOIN experiencias e ON e.id=f.experiencia_id AND e.negocio_id=f.negocio_id
         JOIN versoes_da_experiencia v ON v.experiencia_id=e.id
         JOIN blocos b ON b.versao_da_experiencia_id=v.id
         WHERE f.negocio_id=$1 AND b.id=$2 AND f.id=$3 AND f.estado='PRONTO'
         ON CONFLICT (bloco_id, ficheiro_id) DO NOTHING`,
        [entrada.negocioId, entrada.blocoId, entrada.ficheiroId],
      );
      return resultado.rowCount === 1;
    });
  }

  async criar(f: FicheiroDeMedia): Promise<void> {
    await comNegocio(this.pool, f.negocioId, async (cliente) => {
      await cliente.query(
        `INSERT INTO ficheiros (id, negocio_id, experiencia_id, criado_por_utilizador_id, tipo, estado,
          mime_declarado, tamanho_declarado, objecto_original)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          f.id,
          f.negocioId,
          f.experienciaId,
          f.criadoPorUtilizadorId,
          f.tipo,
          f.estado,
          f.mimeDeclarado,
          f.tamanhoDeclarado,
          f.objectoOriginal,
        ],
      );
    });
  }

  async atualizar(f: FicheiroDeMedia): Promise<void> {
    await comNegocio(this.pool, f.negocioId, async (cliente) => {
      await cliente.query(
        `UPDATE ficheiros SET estado=$3, mime_detetado=$4, tamanho_verificado=$5,
          objecto_seguro=$6, soma_sha256=$7, largura=$8, altura=$9,
          duracao_em_milissegundos=$10, problema_tecnico=$11, atualizado_em=now()
         WHERE negocio_id=$1 AND id=$2`,
        [
          f.negocioId,
          f.id,
          f.estado,
          f.mimeDetetado ?? null,
          f.tamanhoVerificado ?? null,
          f.objectoSeguro ?? null,
          f.somaSha256 ?? null,
          f.largura ?? null,
          f.altura ?? null,
          f.duracaoEmMilissegundos ?? null,
          f.problemaTecnico ?? null,
        ],
      );
    });
  }

  async atualizarSeProcessando(f: FicheiroDeMedia): Promise<boolean> {
    return comNegocio(this.pool, f.negocioId, async (cliente) => {
      const resultado = await cliente.query(
        `UPDATE ficheiros SET estado=$3, mime_detetado=$4, tamanho_verificado=$5,
          objecto_seguro=$6, soma_sha256=$7, largura=$8, altura=$9,
          duracao_em_milissegundos=$10, problema_tecnico=$11, atualizado_em=now()
         WHERE negocio_id=$1 AND id=$2 AND estado='PROCESSANDO'`,
        [
          f.negocioId,
          f.id,
          f.estado,
          f.mimeDetetado ?? null,
          f.tamanhoVerificado ?? null,
          f.objectoSeguro ?? null,
          f.somaSha256 ?? null,
          f.largura ?? null,
          f.altura ?? null,
          f.duracaoEmMilissegundos ?? null,
          f.problemaTecnico ?? null,
        ],
      );
      return resultado.rowCount === 1;
    });
  }

  async obter(
    negocioId: string,
    ficheiroId: string,
  ): Promise<FicheiroDeMedia | null> {
    return comNegocio(this.pool, negocioId, async (cliente) => {
      const resultado = await cliente.query<LinhaDeFicheiro>(
        "SELECT * FROM ficheiros WHERE negocio_id=$1 AND id=$2",
        [negocioId, ficheiroId],
      );
      return resultado.rows[0] === undefined ? null : mapear(resultado.rows[0]);
    });
  }

  async obterPapel(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null> {
    return comNegocio(this.pool, negocioId, async (cliente) => {
      const resultado = await cliente.query<{ papel: PapelDoNegocio }>(
        `SELECT papel FROM membros_do_negocio
         WHERE negocio_id=$1 AND utilizador_id=$2 AND estado='ATIVO' LIMIT 1`,
        [negocioId, utilizadorId],
      );
      return resultado.rows[0]?.papel ?? null;
    });
  }

  async podeLer(
    negocioId: string,
    utilizadorId: string,
    ficheiroId: string,
  ): Promise<boolean> {
    return comNegocio(this.pool, negocioId, async (cliente) => {
      const resultado = await cliente.query(
        `SELECT 1 FROM ficheiros f JOIN membros_do_negocio m ON m.negocio_id=f.negocio_id
         WHERE f.negocio_id=$1 AND f.id=$2 AND m.utilizador_id=$3 AND m.estado='ATIVO'
           AND m.papel IN ('PROPRIETARIO','ADMINISTRADOR','EDITOR') LIMIT 1`,
        [negocioId, ficheiroId, utilizadorId],
      );
      return resultado.rowCount === 1;
    });
  }
}

export class FilaDeMediaPostgresql {
  constructor(private readonly pool: Pool) {}

  async confirmarEAgendar(
    ficheiro: FicheiroDeMedia,
  ): Promise<FicheiroDeMedia["estado"]> {
    return comNegocio(this.pool, ficheiro.negocioId, async (cliente) => {
      const bloqueado = await cliente.query<{
        estado: FicheiroDeMedia["estado"];
      }>(
        "SELECT estado FROM ficheiros WHERE negocio_id=$1 AND id=$2 FOR UPDATE",
        [ficheiro.negocioId, ficheiro.id],
      );
      const estado = bloqueado.rows[0]?.estado;
      if (estado === undefined) return ficheiro.estado;
      if (estado === "PENDENTE") {
        await cliente.query(
          "UPDATE ficheiros SET estado='PROCESSANDO', atualizado_em=now() WHERE negocio_id=$1 AND id=$2",
          [ficheiro.negocioId, ficheiro.id],
        );
      }
      if (estado === "PENDENTE" || estado === "PROCESSANDO") {
        await cliente.query(
          `INSERT INTO trabalhos_de_media (ficheiro_id, negocio_id, tipo, estado)
           VALUES ($1,$2,'PROCESSAR_MEDIA','PENDENTE')
           ON CONFLICT (ficheiro_id, tipo) DO NOTHING`,
          [ficheiro.id, ficheiro.negocioId],
        );
      }
      return estado === "PENDENTE" ? "PROCESSANDO" : estado;
    });
  }

  async reclamar(negocioId: string, agora: Date, donoDoLease: string) {
    return comNegocio(this.pool, negocioId, async (cliente) => {
      const resultado = await cliente.query<{
        ficheiro_id: string;
        id: string;
        negocio_id: string;
      }>(
        `UPDATE trabalhos_de_media SET estado='PROCESSANDO', dono_do_lease=$2,
           lease_expira_em=$1::timestamptz + interval '2 minutes'
         WHERE id=(SELECT id FROM trabalhos_de_media
           WHERE negocio_id=$3 AND (estado='PENDENTE' OR (estado='PROCESSANDO' AND lease_expira_em <= $1))
           ORDER BY criado_em FOR UPDATE SKIP LOCKED LIMIT 1)
         RETURNING id::text, ficheiro_id, negocio_id`,
        [agora.toISOString(), donoDoLease, negocioId],
      );
      const linha = resultado.rows[0];
      return linha === undefined
        ? null
        : {
            ficheiroId: linha.ficheiro_id,
            id: linha.id,
            negocioId: linha.negocio_id,
          };
    });
  }

  async concluir(trabalhoId: string, negocioId: string): Promise<boolean> {
    return comNegocio(this.pool, negocioId, async (cliente) => {
      const resultado = await cliente.query(
        `UPDATE trabalhos_de_media SET estado='CONCLUIDO', lease_expira_em=NULL
         WHERE id=$1 AND negocio_id=$2 AND estado='PROCESSANDO'`,
        [trabalhoId, negocioId],
      );
      return resultado.rowCount === 1;
    });
  }
}
