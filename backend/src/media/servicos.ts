import { z } from "zod";

import { PoliticaDeAcessoAoNegocio } from "../service/politica-de-acesso-ao-negocio.js";
import type {
  ArmazenamentoPrivadoDeMedia,
  FilaDeProcessamentoDeMedia,
  InspecaoDeMedia,
  RepositorioDeMedia,
} from "./contratos.js";
import {
  calcularSha256,
  detetarMime,
  dimensoesDaImagem,
} from "./detetar-media.js";
import {
  limitesDeMedia,
  mimesPermitidos,
  type FicheiroDeMedia,
} from "./dominio.js";
import { ErroDeMedia } from "./erros.js";

const contexto = z.strictObject({
  negocioId: z.uuid(),
  utilizadorId: z.uuid(),
});
const solicitar = z.strictObject({
  contexto,
  experienciaId: z.uuid(),
  mime: z.string().max(100),
  tamanhoEmBytes: z.number().int().positive(),
  tipo: z.enum(["AUDIO", "IMAGEM", "VIDEO"]),
});
const identificar = z.strictObject({ contexto, ficheiroId: z.uuid() });
const associar = identificar.extend({ blocoId: z.uuid() });

type DependenciasComuns = Readonly<{
  armazenamento: ArmazenamentoPrivadoDeMedia;
  obterInstanteAtual: () => Date;
  repositorio: RepositorioDeMedia;
}>;

function somarSegundos(instante: Date, segundos: number): string {
  return new Date(instante.getTime() + segundos * 1_000).toISOString();
}

export class SolicitarUploadDeMedia {
  private readonly politica = new PoliticaDeAcessoAoNegocio();

  constructor(
    private readonly dependencias: DependenciasComuns &
      Readonly<{ gerarId: () => string }>,
  ) {}

  async executar(entrada: unknown) {
    const comando = solicitar.parse(entrada);
    const papel = await this.dependencias.repositorio.obterPapel(
      comando.contexto.negocioId,
      comando.contexto.utilizadorId,
    );
    if (!this.politica.podeExecutar({ acao: "EDITAR_RASCUNHO", papel })) {
      throw new ErroDeMedia(
        "MEDIA_NAO_AUTORIZADO",
        "Acesso ao media recusado.",
      );
    }
    if (!mimesPermitidos[comando.tipo].includes(comando.mime as never)) {
      throw new ErroDeMedia("MIME_NAO_PERMITIDO", "O formato não é permitido.");
    }
    if (comando.tamanhoEmBytes > limitesDeMedia[comando.tipo]) {
      throw new ErroDeMedia(
        "MEDIA_EXCEDE_LIMITE",
        "O ficheiro excede o limite.",
      );
    }

    const id = this.dependencias.gerarId();
    const objectoOriginal = `negocios/${comando.contexto.negocioId}/media/${id}/original`;
    const ficheiro: FicheiroDeMedia = {
      criadoPorUtilizadorId: comando.contexto.utilizadorId,
      estado: "PENDENTE",
      experienciaId: comando.experienciaId,
      id,
      mimeDeclarado: comando.mime,
      negocioId: comando.contexto.negocioId,
      objectoOriginal,
      tamanhoDeclarado: comando.tamanhoEmBytes,
      tipo: comando.tipo,
    };
    await this.dependencias.repositorio.criar(ficheiro);
    const expiraEm = somarSegundos(this.dependencias.obterInstanteAtual(), 300);
    const upload = await this.dependencias.armazenamento.criarUploadAssinado({
      expiraEm,
      mime: comando.mime,
      objecto: objectoOriginal,
      tamanhoMaximo: comando.tamanhoEmBytes,
    });
    return { estado: "PENDENTE" as const, expiraEm, ficheiroId: id, upload };
  }
}

export class ConfirmarUploadDeMedia {
  private readonly politica = new PoliticaDeAcessoAoNegocio();

  constructor(
    private readonly dependencias: Readonly<{
      fila: FilaDeProcessamentoDeMedia;
      repositorio: RepositorioDeMedia;
    }>,
  ) {}

  async executar(entrada: unknown) {
    const comando = identificar.parse(entrada);
    const [papel, ficheiro] = await Promise.all([
      this.dependencias.repositorio.obterPapel(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
      ),
      this.dependencias.repositorio.obter(
        comando.contexto.negocioId,
        comando.ficheiroId,
      ),
    ]);
    if (
      ficheiro === null ||
      !this.politica.podeExecutar({ acao: "EDITAR_RASCUNHO", papel })
    ) {
      throw new ErroDeMedia(
        "MEDIA_NAO_AUTORIZADO",
        "Acesso ao media recusado.",
      );
    }
    if (ficheiro.estado !== "PENDENTE" && ficheiro.estado !== "PROCESSANDO") {
      return { estado: ficheiro.estado, ficheiroId: ficheiro.id };
    }
    const estado = await this.dependencias.fila.confirmarEAgendar(ficheiro);
    return { estado, ficheiroId: ficheiro.id };
  }
}

export class ProcessarMedia {
  constructor(
    private readonly dependencias: Pick<
      DependenciasComuns,
      "armazenamento" | "repositorio"
    > &
      Readonly<{ inspecao: InspecaoDeMedia }>,
  ) {}

  async executar(negocioId: string, ficheiroId: string): Promise<void> {
    const ficheiro = await this.dependencias.repositorio.obter(
      negocioId,
      ficheiroId,
    );
    if (ficheiro === null || ficheiro.estado !== "PROCESSANDO") return;

    try {
      const bytes = await this.dependencias.armazenamento.lerObjectoPrivado(
        ficheiro.objectoOriginal,
        limitesDeMedia[ficheiro.tipo],
      );
      if (bytes.byteLength !== ficheiro.tamanhoDeclarado) {
        throw new ErroDeMedia("TAMANHO_DIVERGENTE", "Tamanho real divergente.");
      }
      const mimeDetetado = detetarMime(bytes);
      if (
        mimeDetetado === null ||
        mimeDetetado !== ficheiro.mimeDeclarado ||
        !mimesPermitidos[ficheiro.tipo].includes(mimeDetetado as never)
      ) {
        throw new ErroDeMedia("MIME_DIVERGENTE", "Tipo real divergente.");
      }
      const inspecao = await this.dependencias.inspecao.inspecionar({
        bytes,
        mime: mimeDetetado,
      });
      if (!inspecao.seguro) {
        throw new ErroDeMedia("MEDIA_REPROVADO", "O ficheiro foi reprovado.");
      }
      const dimensoes = dimensoesDaImagem(
        inspecao.conteudoSeguro,
        mimeDetetado,
      );
      const objectoSeguro = `negocios/${negocioId}/media/${ficheiroId}/seguro`;
      await this.dependencias.armazenamento.guardarObjectoPrivado(
        objectoSeguro,
        inspecao.conteudoSeguro,
        mimeDetetado,
      );
      await this.dependencias.repositorio.atualizarSeProcessando({
        ...ficheiro,
        ...(dimensoes ?? {}),
        ...(inspecao.altura === undefined ? {} : { altura: inspecao.altura }),
        ...(inspecao.duracaoEmMilissegundos === undefined
          ? {}
          : { duracaoEmMilissegundos: inspecao.duracaoEmMilissegundos }),
        ...(inspecao.largura === undefined
          ? {}
          : { largura: inspecao.largura }),
        estado: "PRONTO",
        mimeDetetado,
        objectoSeguro,
        somaSha256: calcularSha256(bytes),
        tamanhoVerificado: bytes.byteLength,
      });
    } catch (erro) {
      await this.dependencias.repositorio.atualizarSeProcessando({
        ...ficheiro,
        estado: "FALHOU",
        problemaTecnico:
          erro instanceof ErroDeMedia ? erro.codigo : "PROCESSAMENTO_FALHOU",
      });
    }
  }
}

export class ObterDownloadTemporarioDeMedia {
  constructor(private readonly dependencias: DependenciasComuns) {}

  async executar(entrada: unknown) {
    const comando = identificar.parse(entrada);
    const [ficheiro, permitido] = await Promise.all([
      this.dependencias.repositorio.obter(
        comando.contexto.negocioId,
        comando.ficheiroId,
      ),
      this.dependencias.repositorio.podeLer(
        comando.contexto.negocioId,
        comando.contexto.utilizadorId,
        comando.ficheiroId,
      ),
    ]);
    if (
      !permitido ||
      ficheiro?.estado !== "PRONTO" ||
      ficheiro.objectoSeguro === undefined
    ) {
      throw new ErroDeMedia("MEDIA_NAO_DISPONIVEL", "Media indisponível.");
    }
    const expiraEm = somarSegundos(this.dependencias.obterInstanteAtual(), 60);
    const url = await this.dependencias.armazenamento.criarDownloadAssinado({
      expiraEm,
      objecto: ficheiro.objectoSeguro,
    });
    return { expiraEm, url };
  }
}

export class AssociarMediaAoBloco {
  private readonly politica = new PoliticaDeAcessoAoNegocio();

  constructor(private readonly repositorio: RepositorioDeMedia) {}

  async executar(entrada: unknown) {
    const comando = associar.parse(entrada);
    const papel = await this.repositorio.obterPapel(
      comando.contexto.negocioId,
      comando.contexto.utilizadorId,
    );
    if (!this.politica.podeExecutar({ acao: "EDITAR_RASCUNHO", papel })) {
      throw new ErroDeMedia(
        "MEDIA_NAO_AUTORIZADO",
        "Acesso ao media recusado.",
      );
    }
    const associado = await this.repositorio.associarAoBlocoSePronto({
      blocoId: comando.blocoId,
      ficheiroId: comando.ficheiroId,
      negocioId: comando.contexto.negocioId,
    });
    if (!associado) {
      throw new ErroDeMedia("MEDIA_NAO_PRONTO", "Media ainda não está pronto.");
    }
    return { blocoId: comando.blocoId, ficheiroId: comando.ficheiroId };
  }
}
