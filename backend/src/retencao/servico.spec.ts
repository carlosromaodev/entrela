import { expect, it } from "vitest";
import type {
  CandidatoDeRetencao,
  RepositorioDeRetencao,
} from "./contratos.js";
import { AplicarRetencao } from "./servico.js";
class Repo implements RepositorioDeRetencao {
  avisos: string[] = [];
  exports: string[] = [];
  eliminados: string[] = [];
  constructor(readonly itens: CandidatoDeRetencao[]) {}
  async listarCandidatos() {
    return this.itens;
  }
  async registarAviso(_n: string, e: string) {
    this.avisos.push(e);
  }
  async pedirExportacao(_n: string, e: string) {
    this.exports.push(e);
  }
  async eliminar(_n: string, e: string) {
    this.eliminados.push(e);
  }
}
it("aplica 90/180 dias, dois avisos e exportação antes de apagar", async () => {
  const agora = new Date("2026-08-14"),
    base = (d: number) =>
      new Date(agora.getTime() - d * 86400000).toISOString();
  const r = new Repo([
    {
      avisosEnviados: 0,
      estado: "ARQUIVADA",
      experienciaId: "a",
      exportacao: "NAO_PEDIDA",
      instanteBase: base(91),
      negocioId: "n",
    },
    {
      avisosEnviados: 1,
      estado: "RASCUNHO",
      experienciaId: "b",
      exportacao: "PRONTA",
      instanteBase: base(181),
      negocioId: "n",
    },
  ]);
  await new AplicarRetencao(r, () => agora).executar();
  expect(r.exports).toEqual(["a"]);
  expect(r.eliminados).toEqual(["b"]);
  expect(r.avisos).toEqual(["a", "b"]);
});
