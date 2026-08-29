import { z } from "zod";

import type {
  CampoDeFormulario,
  Finalidade,
  ProtecaoDeDadosPessoais,
  RepositorioDePessoas,
} from "./contratos.js";

const finalidade = z.enum([
  "OPERACIONAL",
  "MARKETING_PROPRIO",
  "MARKETING_TERCEIROS",
  "MEDIA_PUBLICA",
]);
const contexto = z.strictObject({ negocioId: z.uuid() });

export class GerirConsentimento {
  constructor(
    private readonly repositorio: RepositorioDePessoas,
    private readonly gerarId: () => string,
    private readonly agora: () => Date,
  ) {}

  async conceder(entrada: unknown) {
    const comando = z
      .strictObject({
        contactoId: z.uuid(),
        contexto,
        finalidade,
        versao: z.string().min(1).max(40),
      })
      .parse(entrada);
    const consentimento = {
      concedidoEm: this.agora().toISOString(),
      contactoId: comando.contactoId,
      finalidade: comando.finalidade,
      id: this.gerarId(),
      negocioId: comando.contexto.negocioId,
      versao: comando.versao,
    };
    await this.repositorio.guardarConsentimento(consentimento);
    return consentimento;
  }

  async revogar(entrada: unknown) {
    const comando = z
      .strictObject({ contactoId: z.uuid(), contexto, finalidade })
      .parse(entrada);
    return this.repositorio.revogarConsentimento(
      comando.contexto.negocioId,
      comando.contactoId,
      comando.finalidade,
      this.agora().toISOString(),
    );
  }
}

export class RecolherRespostaSegura {
  constructor(
    private readonly repositorio: RepositorioDePessoas,
    private readonly protecao: ProtecaoDeDadosPessoais,
  ) {}

  async executar(
    entrada: Readonly<{
      campo: CampoDeFormulario;
      contactoId: string;
      negocioId: string;
      valor: unknown;
    }>,
  ) {
    const valor = z.string().max(4_000).parse(entrada.valor);
    if (new Date(entrada.campo.reterAte).getTime() <= Date.now())
      throw new Error("RETENCAO_INVALIDA");
    await this.repositorio.guardarResposta({
      campo: entrada.campo,
      contactoId: entrada.contactoId,
      negocioId: entrada.negocioId,
      valorProtegido: await this.protecao.proteger(valor),
    });
  }
}

export function exigeConsentimento(finalidadeDaAcao: Finalidade): boolean {
  return finalidadeDaAcao !== "OPERACIONAL";
}
