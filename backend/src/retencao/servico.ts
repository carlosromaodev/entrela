import type { RepositorioDeRetencao } from "./contratos.js";
const DIA = 86_400_000;
export class AplicarRetencao {
  constructor(
    private readonly repo: RepositorioDeRetencao,
    private readonly agora: () => Date,
  ) {}
  async executar() {
    const agora = this.agora();
    for (const c of await this.repo.listarCandidatos(agora.toISOString())) {
      const dias = Math.floor(
        (agora.getTime() - new Date(c.instanteBase).getTime()) / DIA,
      );
      const limite = c.estado === "ARQUIVADA" ? 90 : 180;
      const marcos = c.estado === "ARQUIVADA" ? [60, 80] : [150, 170];
      const esperado = dias >= marcos[1]! ? 1 : dias >= marcos[0]! ? 0 : -1;
      if (esperado >= c.avisosEnviados)
        await this.repo.registarAviso(
          c.negocioId,
          c.experienciaId,
          esperado + 1,
        );
      if (dias < limite) continue;
      if (c.exportacao === "NAO_PEDIDA") {
        await this.repo.pedirExportacao(c.negocioId, c.experienciaId);
        continue;
      }
      if (c.exportacao === "PRONTA")
        await this.repo.eliminar(c.negocioId, c.experienciaId);
    }
  }
}
