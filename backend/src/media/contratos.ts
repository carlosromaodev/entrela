import type { PapelDoNegocio } from "../service/politica-de-acesso-ao-negocio.js";
import type { FicheiroDeMedia } from "./dominio.js";

export interface ArmazenamentoPrivadoDeMedia {
  criarUploadAssinado(
    entrada: Readonly<{
      expiraEm: string;
      mime: string;
      objecto: string;
      tamanhoMaximo: number;
    }>,
  ): Promise<
    Readonly<{ campos: Readonly<Record<string, string>>; url: string }>
  >;
  criarDownloadAssinado(
    entrada: Readonly<{
      expiraEm: string;
      objecto: string;
    }>,
  ): Promise<string>;
  lerObjectoPrivado(
    objecto: string,
    tamanhoMaximo: number,
  ): Promise<Uint8Array>;
  guardarObjectoPrivado(
    objecto: string,
    conteudo: Uint8Array,
    mime: string,
  ): Promise<void>;
}

export interface FilaDeProcessamentoDeMedia {
  confirmarEAgendar(
    ficheiro: FicheiroDeMedia,
  ): Promise<FicheiroDeMedia["estado"]>;
  concluir(trabalhoId: string, negocioId: string): Promise<boolean>;
  reclamar(
    negocioId: string,
    agora: Date,
    donoDoLease: string,
  ): Promise<Readonly<{
    ficheiroId: string;
    id: string;
    negocioId: string;
  }> | null>;
}

export interface InspecaoDeMedia {
  inspecionar(
    entrada: Readonly<{
      bytes: Uint8Array;
      mime: string;
    }>,
  ): Promise<
    Readonly<{
      altura?: number;
      conteudoSeguro: Uint8Array;
      duracaoEmMilissegundos?: number;
      largura?: number;
      seguro: boolean;
    }>
  >;
}

export interface RepositorioDeMedia {
  associarAoBlocoSePronto(
    entrada: Readonly<{
      blocoId: string;
      ficheiroId: string;
      negocioId: string;
    }>,
  ): Promise<boolean>;
  atualizar(ficheiro: FicheiroDeMedia): Promise<void>;
  atualizarSeProcessando(ficheiro: FicheiroDeMedia): Promise<boolean>;
  criar(ficheiro: FicheiroDeMedia): Promise<void>;
  obter(negocioId: string, ficheiroId: string): Promise<FicheiroDeMedia | null>;
  obterPapel(
    negocioId: string,
    utilizadorId: string,
  ): Promise<PapelDoNegocio | null>;
  podeLer(
    negocioId: string,
    utilizadorId: string,
    ficheiroId: string,
  ): Promise<boolean>;
}
