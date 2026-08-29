export type CandidatoDeRetencao = Readonly<{
  avisosEnviados: number;
  estado: "ARQUIVADA" | "RASCUNHO";
  experienciaId: string;
  exportacao: "NAO_PEDIDA" | "PENDENTE" | "PRONTA";
  instanteBase: string;
  negocioId: string;
}>;
export interface RepositorioDeRetencao {
  listarCandidatos(agora: string): Promise<readonly CandidatoDeRetencao[]>;
  registarAviso(
    negocioId: string,
    experienciaId: string,
    numero: number,
  ): Promise<void>;
  pedirExportacao(negocioId: string, experienciaId: string): Promise<void>;
  eliminar(negocioId: string, experienciaId: string): Promise<void>;
}
