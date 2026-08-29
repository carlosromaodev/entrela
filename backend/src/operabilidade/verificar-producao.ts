import { z } from "zod";

const esquema = z.strictObject({
  ambiente: z.enum(["desenvolvimento", "teste", "producao"]),
  chaveHmac: z.string().min(32),
  chaveSessao: z.string().min(32),
  providerComunicacao: z.string().min(1).optional(),
  urlBaseDados: z.string().startsWith("postgresql://"),
});

export function verificarConfiguracaoOperacional(entrada: unknown): void {
  const e = esquema.parse(entrada);
  const erros: string[] = [];
  if (e.chaveHmac === e.chaveSessao) erros.push("CHAVES_NAO_ISOLADAS");
  if (e.ambiente === "producao" && !e.providerComunicacao) {
    erros.push("PROVIDER_COMUNICACAO_AUSENTE");
  }
  if (e.ambiente === "producao" && !e.urlBaseDados.includes("sslmode=")) {
    erros.push("TLS_BASE_DADOS_NAO_EXPLICITO");
  }
  if (erros.length) {
    throw new Error(`CONFIGURACAO_OPERACIONAL_INVALIDA:${erros.join(",")}`);
  }
}

export const limitesHttp = Object.freeze({
  corpoBytes: 1024 * 1024,
  consultaMaxima: 100,
  timeoutMs: 10_000,
});
