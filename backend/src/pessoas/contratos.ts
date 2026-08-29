export type Finalidade =
  | "OPERACIONAL"
  | "MARKETING_PROPRIO"
  | "MARKETING_TERCEIROS"
  | "MEDIA_PUBLICA";
export type PapelDeDados =
  | "PROPRIETARIO"
  | "ADMINISTRADOR"
  | "EDITOR"
  | "OPERADOR";

export type Consentimento = Readonly<{
  concedidoEm: string;
  contactoId: string;
  finalidade: Finalidade;
  id: string;
  negocioId: string;
  revogadoEm?: string;
  versao: string;
}>;

export type CampoDeFormulario = Readonly<{
  chave: string;
  classificacao: "COMUM" | "SENSIVEL";
  finalidade: Finalidade;
  papeisPermitidos: readonly PapelDeDados[];
  reterAte: string;
}>;

export interface RepositorioDePessoas {
  guardarConsentimento(consentimento: Consentimento): Promise<void>;
  obterConsentimentoAtivo(
    negocioId: string,
    contactoId: string,
    finalidade: Finalidade,
  ): Promise<Consentimento | null>;
  revogarConsentimento(
    negocioId: string,
    contactoId: string,
    finalidade: Finalidade,
    instante: string,
  ): Promise<boolean>;
  guardarResposta(
    entrada: Readonly<{
      campo: CampoDeFormulario;
      contactoId: string;
      negocioId: string;
      valorProtegido: string;
    }>,
  ): Promise<void>;
  lerResposta(
    negocioId: string,
    contactoId: string,
    chave: string,
    papel: PapelDeDados,
    agora: string,
  ): Promise<string | null>;
  eliminarExpirados(negocioId: string, agora: string): Promise<number>;
}

export interface ProtecaoDeDadosPessoais {
  proteger(valor: string): Promise<string>;
}
