import type { Finalidade } from "../pessoas/contratos.js";

export type MensagemOutbox = Readonly<{
  contactoId: string;
  estado: "PENDENTE" | "PROCESSANDO" | "ENVIADA" | "SUPRIMIDA" | "FALHOU";
  finalidade: Finalidade;
  id: string;
  negocioId: string;
  payloadProtegido: string;
  tentativas: number;
}>;

export interface RepositorioDeComunicacoes {
  criarSePermitida(mensagem: MensagemOutbox): Promise<"CRIADA" | "SUPRIMIDA">;
  reclamar(
    negocioId: string,
    trabalhador: string,
    agora: string,
  ): Promise<MensagemOutbox | null>;
  concluir(
    negocioId: string,
    mensagemId: string,
    trabalhador: string,
  ): Promise<boolean>;
  falhar(
    negocioId: string,
    mensagemId: string,
    trabalhador: string,
    tentarEm: string,
    terminal: boolean,
  ): Promise<void>;
  suprimirContacto(
    negocioId: string,
    contactoId: string,
    finalidade: MensagemOutbox["finalidade"],
  ): Promise<void>;
}

export interface ProviderDeComunicacao {
  enviar(mensagem: MensagemOutbox): Promise<void>;
}
