import { z } from "zod";

import type { RepositorioDeModeracao } from "./contratos.js";

export class RemoverContribuicaoIndividual {
  constructor(private readonly repositorio: RepositorioDeModeracao) {}

  async executar(entrada: unknown) {
    const comando = z
      .strictObject({
        contribuicaoId: z.uuid(),
        moderadorId: z.uuid(),
        motivo: z.string().min(3).max(500),
        negocioId: z.uuid(),
      })
      .parse(entrada);
    const removida = await this.repositorio.removerContribuicao(comando);
    if (!removida)
      throw new Error("CONTRIBUICAO_INEXISTENTE_OU_NAO_AUTORIZADA");
    return {
      contribuicaoId: comando.contribuicaoId,
      estado: "REMOVIDA" as const,
    };
  }
}
