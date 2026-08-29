import { describe, expect, it } from "vitest";
import { MetricasTecnicas } from "./metricas-tecnicas.js";
import { VerificarReadiness } from "./readiness.js";
import {
  limitesHttp,
  verificarConfiguracaoOperacional,
} from "./verificar-producao.js";
describe("operabilidade segura", () => {
  it("mantém cardinalidade fechada sem rota, token ou tenant arbitrário", () => {
    const m = new MetricasTecnicas();
    m.registarHttp({
      duracaoMs: 10,
      rota: "/momento/token-secreto?email=a@b.c",
      status: 500,
    });
    m.registarHttp({ duracaoMs: 5, rota: "saude", status: 200 });
    expect([...m.obter().keys()]).toEqual(["outra:5xx", "saude:2xx"]);
    expect(JSON.stringify([...m.obter()])).not.toContain("token-secreto");
  });
  it("readiness falha fechado sem expor erro da base", async () => {
    const ok = new VerificarReadiness({ query: async () => ({}) } as never);
    expect(await ok.executar()).toMatchObject({ estado: "PRONTO" });
    const falha = new VerificarReadiness({
      query: async () => Promise.reject(new Error("password=segredo")),
    } as never);
    expect(await falha.executar()).toMatchObject({
      baseDeDados: "INDISPONIVEL",
      estado: "NAO_PRONTO",
    });
    expect(JSON.stringify(await falha.executar())).not.toContain("segredo");
  });
  it("recusa configuração de produção insegura e define limites finitos", () => {
    expect(() =>
      verificarConfiguracaoOperacional({
        ambiente: "producao",
        chaveHmac: "a".repeat(32),
        chaveSessao: "a".repeat(32),
        urlBaseDados: "postgresql://local",
      }),
    ).toThrow("CHAVES_NAO_ISOLADAS");
    expect(limitesHttp).toEqual({
      corpoBytes: 1048576,
      consultaMaxima: 100,
      timeoutMs: 10000,
    });
  });
});
