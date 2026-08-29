import type { Pool } from "pg";
export class VerificarReadiness {
  constructor(
    private readonly pool: Pool,
    private readonly timeoutMs = 1_000,
  ) {}
  async executar() {
    const inicio = performance.now();
    try {
      await Promise.race([
        this.pool.query("SELECT 1"),
        new Promise<never>((_resolver, rejeitar) => {
          setTimeout(() => rejeitar(new Error("READINESS_TIMEOUT")), this.timeoutMs);
        }),
      ]);
      return {
        baseDeDados: "PRONTA" as const,
        duracaoMs: Math.round(performance.now() - inicio),
        estado: "PRONTO" as const,
      };
    } catch {
      return {
        baseDeDados: "INDISPONIVEL" as const,
        duracaoMs: Math.round(performance.now() - inicio),
        estado: "NAO_PRONTO" as const,
      };
    }
  }
}
