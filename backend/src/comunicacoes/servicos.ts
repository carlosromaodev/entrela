import type {
  ProviderDeComunicacao,
  RepositorioDeComunicacoes,
} from "./contratos.js";

export class DespacharComunicacao {
  constructor(
    private readonly repositorio: RepositorioDeComunicacoes,
    private readonly provider: ProviderDeComunicacao,
    private readonly agora: () => Date,
  ) {}

  async executar(negocioId: string, trabalhador: string): Promise<boolean> {
    const mensagem = await this.repositorio.reclamar(
      negocioId,
      trabalhador,
      this.agora().toISOString(),
    );
    if (mensagem === null) return false;
    try {
      await this.provider.enviar(mensagem);
      await this.repositorio.concluir(negocioId, mensagem.id, trabalhador);
    } catch {
      const terminal = mensagem.tentativas + 1 >= 5;
      const atraso = Math.min(3_600, 2 ** mensagem.tentativas * 30);
      await this.repositorio.falhar(
        negocioId,
        mensagem.id,
        trabalhador,
        new Date(this.agora().getTime() + atraso * 1_000).toISOString(),
        terminal,
      );
    }
    return true;
  }
}

export function exigirProviderEmProducao(
  ambiente: string,
  provider?: ProviderDeComunicacao,
): ProviderDeComunicacao {
  if (provider !== undefined) return provider;
  if (ambiente === "producao")
    throw new Error("PROVIDER_DE_COMUNICACAO_NAO_CONFIGURADO");
  return {
    enviar: async () => {
      throw new Error("PROVIDER_FAKE_SEM_ENTREGA");
    },
  };
}
