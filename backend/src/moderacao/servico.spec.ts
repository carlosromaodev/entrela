import { expect, it } from "vitest";
import { RemoverContribuicaoIndividual } from "./servico.js";
it("remove só a contribuição indicada com motivo", async () => {
  let id = "";
  const s = new RemoverContribuicaoIndividual({
    removerContribuicao: async (e) => {
      id = e.contribuicaoId;
      return true;
    },
  });
  const contribuicaoId = "0198f9a0-8b75-7000-8000-000000000001";
  await expect(
    s.executar({
      contribuicaoId,
      moderadorId: "0198f9a0-8b75-7000-8000-000000000002",
      motivo: "spam",
      negocioId: "0198f9a0-8b75-7000-8000-000000000003",
    }),
  ).resolves.toMatchObject({ estado: "REMOVIDA" });
  expect(id).toBe(contribuicaoId);
});
