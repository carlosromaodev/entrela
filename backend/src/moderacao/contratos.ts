export interface RepositorioDeModeracao {
  removerContribuicao(
    entrada: Readonly<{
      contribuicaoId: string;
      moderadorId: string;
      motivo: string;
      negocioId: string;
    }>,
  ): Promise<boolean>;
}
