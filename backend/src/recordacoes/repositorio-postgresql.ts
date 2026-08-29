import type { Pool } from "pg";
import { comTenant } from "../pessoas/repositorio-postgresql.js";
import type {
  PedidoDeRecordacao,
  RepositorioDeRecordacoes,
} from "./contratos.js";
export class RepositorioDeRecordacoesPostgresql
  implements RepositorioDeRecordacoes
{
  constructor(private readonly pool: Pool) {}
  async verificarElegibilidade(
    e: Parameters<RepositorioDeRecordacoes["verificarElegibilidade"]>[0],
  ) {
    return comTenant(this.pool, e.negocioId, async (db) => {
      const r = await db.query(
        `SELECT 1 FROM experiencias x WHERE x.negocio_id=$1 AND x.id=$2 AND x.estado='PUBLICADA' AND (($4='CRIADOR' AND x.criado_por_utilizador_id=$3) OR ($4='DESTINATARIO' AND EXISTS(SELECT 1 FROM conclusoes_de_destinatarios c WHERE c.negocio_id=$1 AND c.experiencia_id=$2 AND c.destinatario_id=$3)))`,
        [e.negocioId, e.experienciaId, e.requerenteId, e.tipoDoRequerente],
      );
      return r.rowCount === 1;
    });
  }
  async criarOuObter(p: PedidoDeRecordacao) {
    return comTenant(this.pool, p.negocioId, async (db) => {
      const r = await db.query(
        `INSERT INTO pedidos_de_recordacao(id,negocio_id,experiencia_id,requerente_id,tipo_do_requerente,formato,estado) VALUES($1,$2,$3,$4,$5,$6,'PENDENTE') ON CONFLICT(negocio_id,experiencia_id,requerente_id,tipo_do_requerente,formato) DO UPDATE SET negocio_id=excluded.negocio_id RETURNING *`,
        [
          p.id,
          p.negocioId,
          p.experienciaId,
          p.requerenteId,
          p.tipoDoRequerente,
          p.formato,
        ],
      );
      const x = r.rows[0];
      return {
        estado: x.estado,
        experienciaId: x.experiencia_id,
        formato: x.formato,
        id: x.id,
        negocioId: x.negocio_id,
        requerenteId: x.requerente_id,
        tipoDoRequerente: x.tipo_do_requerente,
      };
    });
  }
  async guardarPronta(n: string, id: string, o: string) {
    return comTenant(
      this.pool,
      n,
      async (db) =>
        (
          await db.query(
            "UPDATE pedidos_de_recordacao SET estado='PRONTO',objecto=$3 WHERE negocio_id=$1 AND id=$2 AND estado='PROCESSANDO'",
            [n, id, o],
          )
        ).rowCount === 1,
    );
  }
  async obterConteudo(n: string, e: string) {
    return comTenant(this.pool, n, async (db) => {
      const x = await db.query<{ titulo: string }>(
        `SELECT t.titulo FROM experiencias e JOIN traducoes_da_experiencia t ON t.experiencia_id=e.id WHERE e.negocio_id=$1 AND e.id=$2 LIMIT 1`,
        [n, e],
      );
      const b = await db.query<{ texto: string }>(
        `SELECT tb.conteudo->>'texto' texto FROM experiencias e JOIN versoes_da_experiencia v ON v.id=e.versao_publicada_id JOIN blocos b ON b.versao_da_experiencia_id=v.id JOIN traducoes_do_bloco tb ON tb.bloco_id=b.id WHERE e.negocio_id=$1 AND e.id=$2 ORDER BY b.posicao`,
        [n, e],
      );
      return {
        titulo: x.rows[0]?.titulo ?? "",
        etapas: b.rows.map((y) => y.texto ?? ""),
        mediaIds: [],
      };
    });
  }
}
