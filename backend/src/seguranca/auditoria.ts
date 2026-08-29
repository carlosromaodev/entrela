import type { Pool } from "pg";
export type EventoDeAuditoria = Readonly<{
  acao: string;
  alvoId?: string;
  atorId?: string;
  id: string;
  instante: string;
  negocioId: string;
  resultado: "SUCESSO" | "NEGADO" | "FALHA";
}>;
export interface AuditoriaAppendOnly {
  acrescentar(evento: EventoDeAuditoria): Promise<void>;
}
export class AuditoriaPostgresql implements AuditoriaAppendOnly {
  constructor(private readonly pool: Pool) {}
  async acrescentar(e: EventoDeAuditoria) {
    await this.pool.query(
      `INSERT INTO auditoria_operacional(id,negocio_id,ator_id,acao,alvo_id,resultado,instante) VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        e.id,
        e.negocioId,
        e.atorId ?? null,
        e.acao,
        e.alvoId ?? null,
        e.resultado,
        e.instante,
      ],
    );
  }
}
