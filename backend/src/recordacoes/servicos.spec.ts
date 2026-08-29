import { describe, expect, it } from "vitest";
import type {
  PedidoDeRecordacao,
  RepositorioDeRecordacoes,
} from "./contratos.js";
import { GerarRecordacao, PedirRecordacao } from "./servicos.js";
const n = "0198f9a0-8b75-7000-8000-000000000001",
  e = "0198f9a0-8b75-7000-8000-000000000002",
  u = "0198f9a0-8b75-7000-8000-000000000003",
  id = "0198f9a0-8b75-7000-8000-000000000004";
class Repo implements RepositorioDeRecordacoes {
  pedido?: PedidoDeRecordacao;
  pronto = "";
  elegivel = true;
  async verificarElegibilidade() {
    return this.elegivel;
  }
  async criarOuObter(p: PedidoDeRecordacao) {
    return this.pedido ?? (this.pedido = p);
  }
  async guardarPronta(_n: string, _i: string, o: string) {
    this.pronto = o;
    return true;
  }
  async obterConteudo() {
    return {
      etapas: ["<script>não</script>"],
      mediaIds: ["m1"],
      titulo: "Nós & nós",
    };
  }
}
describe("recordações", () => {
  it("reutiliza pedido idempotente e recusa inelegível", async () => {
    const r = new Repo(),
      s = new PedirRecordacao(r, () => id),
      x = {
        experienciaId: e,
        formato: "HTML",
        negocioId: n,
        requerenteId: u,
        tipoDoRequerente: "DESTINATARIO",
      };
    expect((await s.executar(x)).id).toBe(id);
    expect((await s.executar(x)).id).toBe(id);
    r.elegivel = false;
    await expect(s.executar({ ...x, formato: "PDF" })).rejects.toThrow(
      "NAO_ELEGIVEL",
    );
  });
  it("gera HTML escapado e usa media temporária", async () => {
    const r = new Repo();
    let html = "";
    const p: PedidoDeRecordacao = {
      estado: "PROCESSANDO",
      experienciaId: e,
      formato: "HTML",
      id,
      negocioId: n,
      requerenteId: u,
      tipoDoRequerente: "CRIADOR",
    };
    await new GerarRecordacao(
      r,
      {
        guardar: async (_o, b) => {
          html = Buffer.from(b).toString();
        },
        urlTemporaria: async () => "",
      },
      { resolver: async (_m, exp) => `https://media.invalid/t?exp=${exp}` },
      { renderizar: async () => new Uint8Array() },
      () => new Date("2026-01-01"),
    ).executar(p);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("2026-01-01T00:05:00.000Z");
    expect(r.pronto).toContain(id);
  });
});
