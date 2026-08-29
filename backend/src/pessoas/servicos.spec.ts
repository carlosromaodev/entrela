import { describe, expect, it } from "vitest";
import type {
  Consentimento,
  Finalidade,
  PapelDeDados,
  RepositorioDePessoas,
} from "./contratos.js";
import { GerirConsentimento, RecolherRespostaSegura } from "./servicos.js";
class Repo implements RepositorioDePessoas {
  consentimentos: Consentimento[] = [];
  resposta = "";
  async guardarConsentimento(c: Consentimento) {
    this.consentimentos.push(c);
  }
  async obterConsentimentoAtivo(_n: string, _c: string, f: Finalidade) {
    return (
      this.consentimentos.find((x) => x.finalidade === f && !x.revogadoEm) ??
      null
    );
  }
  async revogarConsentimento(n: string, c: string, f: Finalidade, i: string) {
    const x = await this.obterConsentimentoAtivo(n, c, f);
    if (!x) return false;
    this.consentimentos = [
      ...this.consentimentos.filter((y) => y !== x),
      { ...x, revogadoEm: i },
    ];
    return true;
  }
  async guardarResposta(
    e: Parameters<RepositorioDePessoas["guardarResposta"]>[0],
  ) {
    this.resposta = e.valorProtegido;
  }
  async lerResposta(
    _n: string,
    _c: string,
    _k: string,
    _p: PapelDeDados,
    _a: string,
  ) {
    return this.resposta;
  }
  async eliminarExpirados() {
    return 0;
  }
}
const n = "0198f9a0-8b75-7000-8000-000000000001",
  c = "0198f9a0-8b75-7000-8000-000000000002";
describe("pessoas e consentimento", () => {
  it("separa finalidade/versão e revoga somente a escolhida", async () => {
    const r = new Repo(),
      s = new GerirConsentimento(
        r,
        () => crypto.randomUUID(),
        () => new Date("2026-01-01"),
      );
    await s.conceder({
      contactoId: c,
      contexto: { negocioId: n },
      finalidade: "MARKETING_PROPRIO",
      versao: "v2",
    });
    await s.conceder({
      contactoId: c,
      contexto: { negocioId: n },
      finalidade: "MEDIA_PUBLICA",
      versao: "v1",
    });
    await s.revogar({
      contactoId: c,
      contexto: { negocioId: n },
      finalidade: "MARKETING_PROPRIO",
    });
    expect(
      await r.obterConsentimentoAtivo(n, c, "MARKETING_PROPRIO"),
    ).toBeNull();
    expect(
      await r.obterConsentimentoAtivo(n, c, "MEDIA_PUBLICA"),
    ).not.toBeNull();
  });
  it("protege resposta e conserva classificação/papéis/retenção", async () => {
    const r = new Repo();
    await new RecolherRespostaSegura(r, {
      proteger: async (v) => `cifrado:${v.length}`,
    }).executar({
      campo: {
        chave: "dieta",
        classificacao: "SENSIVEL",
        finalidade: "OPERACIONAL",
        papeisPermitidos: ["OPERADOR"],
        reterAte: "2099-01-01",
      },
      contactoId: c,
      negocioId: n,
      valor: "alergia",
    });
    expect(r.resposta).toBe("cifrado:7");
  });
});
