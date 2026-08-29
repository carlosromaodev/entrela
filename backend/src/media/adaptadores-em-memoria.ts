import type { PapelDoNegocio } from "../service/politica-de-acesso-ao-negocio.js";
import type {
  ArmazenamentoPrivadoDeMedia,
  FilaDeProcessamentoDeMedia,
  InspecaoDeMedia,
  RepositorioDeMedia,
} from "./contratos.js";
import type { FicheiroDeMedia } from "./dominio.js";

export class ArmazenamentoPrivadoDeMediaEmMemoria
  implements ArmazenamentoPrivadoDeMedia
{
  readonly objectos = new Map<string, Uint8Array>();

  async criarUploadAssinado(
    entrada: Readonly<{
      expiraEm: string;
      mime: string;
      objecto: string;
      tamanhoMaximo: number;
    }>,
  ) {
    return {
      campos: {
        "Content-Type": entrada.mime,
        "content-length-range": `1,${entrada.tamanhoMaximo}`,
        objecto: entrada.objecto,
      },
      url: "https://storage.entrela.invalid/upload-assinado",
    };
  }

  async criarDownloadAssinado(
    entrada: Readonly<{ expiraEm: string; objecto: string }>,
  ) {
    return `https://storage.entrela.invalid/download-assinado?expira=${encodeURIComponent(entrada.expiraEm)}`;
  }

  async lerObjectoPrivado(objecto: string, tamanhoMaximo: number) {
    const bytes = this.objectos.get(objecto);
    if (bytes === undefined || bytes.byteLength > tamanhoMaximo) {
      throw new Error("OBJECTO_INDISPONIVEL");
    }
    return bytes;
  }

  async guardarObjectoPrivado(objecto: string, conteudo: Uint8Array) {
    this.objectos.set(objecto, conteudo);
  }
}

export class FilaDeProcessamentoDeMediaEmMemoria
  implements FilaDeProcessamentoDeMedia
{
  readonly trabalhos: Array<{
    donoDoLease?: string;
    estado: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO";
    ficheiroId: string;
    id: string;
    negocioId: string;
  }> = [];

  constructor(private readonly repositorio: RepositorioDeMediaEmMemoria) {}

  async confirmarEAgendar(ficheiro: FicheiroDeMedia) {
    const atual = this.repositorio.ficheiros.get(ficheiro.id);
    if (atual?.estado === "PENDENTE") {
      this.repositorio.ficheiros.set(ficheiro.id, {
        ...atual,
        estado: "PROCESSANDO",
      });
    }
    const estado =
      this.repositorio.ficheiros.get(ficheiro.id)?.estado ?? ficheiro.estado;
    if (
      (estado === "PENDENTE" || estado === "PROCESSANDO") &&
      !this.trabalhos.some((item) => item.ficheiroId === ficheiro.id)
    ) {
      this.trabalhos.push({
        estado: "PENDENTE",
        ficheiroId: ficheiro.id,
        id: ficheiro.id,
        negocioId: ficheiro.negocioId,
      });
    }
    return estado;
  }

  async reclamar(negocioId: string, _agora: Date, donoDoLease: string) {
    const trabalho = this.trabalhos.find(
      (item) => item.negocioId === negocioId && item.estado === "PENDENTE",
    );
    if (trabalho === undefined) return null;
    trabalho.estado = "PROCESSANDO";
    trabalho.donoDoLease = donoDoLease;
    return trabalho;
  }

  async concluir(trabalhoId: string, negocioId: string) {
    const trabalho = this.trabalhos.find(
      (item) => item.id === trabalhoId && item.negocioId === negocioId,
    );
    if (trabalho?.estado !== "PROCESSANDO") return false;
    trabalho.estado = "CONCLUIDO";
    return true;
  }
}

export class InspecaoDeMediaEmMemoria implements InspecaoDeMedia {
  constructor(private readonly seguro = true) {}

  async inspecionar(entrada: Readonly<{ bytes: Uint8Array; mime: string }>) {
    return { conteudoSeguro: entrada.bytes, seguro: this.seguro };
  }
}

export class RepositorioDeMediaEmMemoria implements RepositorioDeMedia {
  readonly associacoes = new Set<string>();
  readonly ficheiros = new Map<string, FicheiroDeMedia>();
  readonly papeis = new Map<string, PapelDoNegocio>();
  readonly leitores = new Set<string>();

  async associarAoBlocoSePronto(
    entrada: Readonly<{
      blocoId: string;
      ficheiroId: string;
      negocioId: string;
    }>,
  ) {
    const ficheiro = await this.obter(entrada.negocioId, entrada.ficheiroId);
    if (ficheiro?.estado !== "PRONTO") return false;
    this.associacoes.add(`${entrada.blocoId}:${entrada.ficheiroId}`);
    return true;
  }

  async atualizar(ficheiro: FicheiroDeMedia) {
    this.ficheiros.set(ficheiro.id, ficheiro);
  }

  async atualizarSeProcessando(ficheiro: FicheiroDeMedia) {
    if (this.ficheiros.get(ficheiro.id)?.estado !== "PROCESSANDO") return false;
    this.ficheiros.set(ficheiro.id, ficheiro);
    return true;
  }

  async criar(ficheiro: FicheiroDeMedia) {
    if (this.ficheiros.has(ficheiro.id)) throw new Error("FICHEIRO_DUPLICADO");
    this.ficheiros.set(ficheiro.id, ficheiro);
  }

  async obter(negocioId: string, ficheiroId: string) {
    const ficheiro = this.ficheiros.get(ficheiroId);
    return ficheiro?.negocioId === negocioId ? ficheiro : null;
  }

  async obterPapel(negocioId: string, utilizadorId: string) {
    return this.papeis.get(`${negocioId}:${utilizadorId}`) ?? null;
  }

  async podeLer(negocioId: string, utilizadorId: string, ficheiroId: string) {
    const ficheiro = await this.obter(negocioId, ficheiroId);
    return (
      ficheiro !== null &&
      this.leitores.has(`${negocioId}:${utilizadorId}:${ficheiroId}`)
    );
  }
}
