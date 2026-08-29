import { describe, expect, it } from "vitest";
import type { MensagemOutbox, RepositorioDeComunicacoes } from "./contratos.js";
import { DespacharComunicacao, exigirProviderEmProducao } from "./servicos.js";

class Repo implements RepositorioDeComunicacoes {
  mensagem: MensagemOutbox | null = {
    contactoId: "c",
    estado: "PENDENTE",
    finalidade: "OPERACIONAL",
    id: "m",
    negocioId: "n",
    payloadProtegido: "cifrado",
    tentativas: 0,
  };
  estado = "";
  tentarEm = "";
  async criarSePermitida() {
    return "CRIADA" as const;
  }
  async suprimirContacto() {}
  async reclamar() {
    const m = this.mensagem;
    this.mensagem = null;
    return m;
  }
  async concluir() {
    this.estado = "ENVIADA";
    return true;
  }
  async falhar(
    _n: string,
    _i: string,
    _w: string,
    t: string,
    terminal: boolean,
  ) {
    this.estado = terminal ? "FALHOU" : "PENDENTE";
    this.tentarEm = t;
  }
}
describe("comunicações seguras", () => {
  it("envia via provider contratual e conclui", async () => {
    const r = new Repo();
    let recebido = "";
    await new DespacharComunicacao(
      r,
      {
        enviar: async (m) => {
          recebido = m.payloadProtegido;
        },
      },
      () => new Date("2026-01-01"),
    ).executar("n", "w");
    expect(recebido).toBe("cifrado");
    expect(r.estado).toBe("ENVIADA");
  });
  it("aplica retry sem revelar payload e exige provider em produção", async () => {
    const r = new Repo();
    await new DespacharComunicacao(
      r,
      {
        enviar: async () => {
          throw new Error("fora");
        },
      },
      () => new Date("2026-01-01"),
    ).executar("n", "w");
    expect(r.estado).toBe("PENDENTE");
    expect(r.tentarEm).toBe("2026-01-01T00:00:30.000Z");
    expect(() => exigirProviderEmProducao("producao")).toThrow(
      "NAO_CONFIGURADO",
    );
  });
});
