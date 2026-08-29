import { describe, expect, it } from "vitest";

import {
  ArmazenamentoPrivadoDeMediaEmMemoria,
  FilaDeProcessamentoDeMediaEmMemoria,
  InspecaoDeMediaEmMemoria,
  RepositorioDeMediaEmMemoria,
} from "./adaptadores-em-memoria.js";
import { ErroDeMedia } from "./erros.js";
import {
  AssociarMediaAoBloco,
  ConfirmarUploadDeMedia,
  ObterDownloadTemporarioDeMedia,
  ProcessarMedia,
  SolicitarUploadDeMedia,
} from "./servicos.js";

const negocioId = "0198f9a0-8b75-7000-8000-000000000001";
const utilizadorId = "0198f9a0-8b75-7000-8000-000000000002";
const experienciaId = "0198f9a0-8b75-7000-8000-000000000003";
const ficheiroId = "0198f9a0-8b75-7000-8000-000000000004";
const agora = new Date("2026-08-14T12:00:00.000Z");

function criarPng(largura = 320, altura = 180): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const vista = new DataView(bytes.buffer);
  vista.setUint32(16, largura);
  vista.setUint32(20, altura);
  return bytes;
}

function prepararUpload() {
  const armazenamento = new ArmazenamentoPrivadoDeMediaEmMemoria();
  const repositorio = new RepositorioDeMediaEmMemoria();
  repositorio.papeis.set(`${negocioId}:${utilizadorId}`, "EDITOR");
  const servico = new SolicitarUploadDeMedia({
    armazenamento,
    gerarId: () => ficheiroId,
    obterInstanteAtual: () => agora,
    repositorio,
  });
  return { armazenamento, repositorio, servico };
}

describe("pipeline privado de media", () => {
  it("emite upload curto limitado a objecto, MIME e tamanho sem nome original", async () => {
    const { servico } = prepararUpload();
    const resultado = await servico.executar({
      contexto: { negocioId, utilizadorId },
      experienciaId,
      mime: "image/png",
      tamanhoEmBytes: 24,
      tipo: "IMAGEM",
    });

    expect(resultado).toMatchObject({
      estado: "PENDENTE",
      expiraEm: "2026-08-14T12:05:00.000Z",
      ficheiroId,
      upload: {
        campos: {
          "Content-Type": "image/png",
          "content-length-range": "1,24",
          objecto: `negocios/${negocioId}/media/${ficheiroId}/original`,
        },
      },
    });
    expect(JSON.stringify(resultado)).not.toContain("nome");
  });

  it("recusa papel, MIME e tamanho não autorizados", async () => {
    const { repositorio, servico } = prepararUpload();
    repositorio.papeis.set(`${negocioId}:${utilizadorId}`, "ANALISTA");
    await expect(
      servico.executar({
        contexto: { negocioId, utilizadorId },
        experienciaId,
        mime: "image/png",
        tamanhoEmBytes: 24,
        tipo: "IMAGEM",
      }),
    ).rejects.toMatchObject({ codigo: "MEDIA_NAO_AUTORIZADO" });

    repositorio.papeis.set(`${negocioId}:${utilizadorId}`, "EDITOR");
    await expect(
      servico.executar({
        contexto: { negocioId, utilizadorId },
        experienciaId,
        mime: "text/html",
        tamanhoEmBytes: 24,
        tipo: "IMAGEM",
      }),
    ).rejects.toMatchObject({ codigo: "MIME_NAO_PERMITIDO" });
  });

  it("confirma uma vez e agenda processamento idempotente", async () => {
    const { repositorio, servico } = prepararUpload();
    await servico.executar({
      contexto: { negocioId, utilizadorId },
      experienciaId,
      mime: "image/png",
      tamanhoEmBytes: 24,
      tipo: "IMAGEM",
    });
    const fila = new FilaDeProcessamentoDeMediaEmMemoria(repositorio);
    const confirmar = new ConfirmarUploadDeMedia({ fila, repositorio });
    const entrada = { contexto: { negocioId, utilizadorId }, ficheiroId };

    await confirmar.executar(entrada);
    await confirmar.executar(entrada);
    expect(fila.trabalhos).toHaveLength(1);
    expect(repositorio.ficheiros.get(ficheiroId)?.estado).toBe("PROCESSANDO");
  });

  it("reverte para PENDENTE quando a fila recusa o trabalho", async () => {
    const { repositorio, servico } = prepararUpload();
    await servico.executar({
      contexto: { negocioId, utilizadorId },
      experienciaId,
      mime: "image/png",
      tamanhoEmBytes: 24,
      tipo: "IMAGEM",
    });
    const confirmar = new ConfirmarUploadDeMedia({
      fila: {
        confirmarEAgendar: async () =>
          Promise.reject(new Error("FILA_INDISPONIVEL")),
        concluir: async () => false,
        reclamar: async () => null,
      },
      repositorio,
    });

    await expect(
      confirmar.executar({
        contexto: { negocioId, utilizadorId },
        ficheiroId,
      }),
    ).rejects.toThrow("FILA_INDISPONIVEL");
    expect(repositorio.ficheiros.get(ficheiroId)?.estado).toBe("PENDENTE");
  });

  it("confirma MIME real, soma, dimensões e objecto sanitizado antes de PRONTO", async () => {
    const { armazenamento, repositorio, servico } = prepararUpload();
    const png = criarPng();
    await servico.executar({
      contexto: { negocioId, utilizadorId },
      experienciaId,
      mime: "image/png",
      tamanhoEmBytes: png.byteLength,
      tipo: "IMAGEM",
    });
    const fila = new FilaDeProcessamentoDeMediaEmMemoria(repositorio);
    await new ConfirmarUploadDeMedia({ fila, repositorio }).executar({
      contexto: { negocioId, utilizadorId },
      ficheiroId,
    });
    const ficheiro = repositorio.ficheiros.get(ficheiroId)!;
    armazenamento.objectos.set(ficheiro.objectoOriginal, png);
    await new ProcessarMedia({
      armazenamento,
      inspecao: new InspecaoDeMediaEmMemoria(),
      repositorio,
    }).executar(negocioId, ficheiroId);

    expect(repositorio.ficheiros.get(ficheiroId)).toMatchObject({
      altura: 180,
      estado: "PRONTO",
      largura: 320,
      mimeDetetado: "image/png",
      tamanhoVerificado: 24,
    });
    expect(repositorio.ficheiros.get(ficheiroId)?.somaSha256).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(
      armazenamento.objectos.has(
        `negocios/${negocioId}/media/${ficheiroId}/seguro`,
      ),
    ).toBe(true);
  });

  it.each([
    ["MIME_DIVERGENTE", new Uint8Array(24), new InspecaoDeMediaEmMemoria()],
    ["MEDIA_REPROVADO", criarPng(), new InspecaoDeMediaEmMemoria(false)],
  ])(
    "falha fechado quando processamento resulta em %s",
    async (codigo, bytes, inspecao) => {
      const { armazenamento, repositorio, servico } = prepararUpload();
      await servico.executar({
        contexto: { negocioId, utilizadorId },
        experienciaId,
        mime: "image/png",
        tamanhoEmBytes: bytes.byteLength,
        tipo: "IMAGEM",
      });
      await repositorio.atualizar({
        ...repositorio.ficheiros.get(ficheiroId)!,
        estado: "PROCESSANDO",
      });
      armazenamento.objectos.set(
        repositorio.ficheiros.get(ficheiroId)!.objectoOriginal,
        bytes,
      );
      await new ProcessarMedia({
        armazenamento,
        inspecao,
        repositorio,
      }).executar(negocioId, ficheiroId);
      expect(repositorio.ficheiros.get(ficheiroId)).toMatchObject({
        estado: "FALHOU",
        problemaTecnico: codigo,
      });
    },
  );

  it("só entrega objecto seguro por URL temporária após autorização", async () => {
    const { armazenamento, repositorio } = prepararUpload();
    repositorio.ficheiros.set(ficheiroId, {
      criadoPorUtilizadorId: utilizadorId,
      estado: "PRONTO",
      experienciaId,
      id: ficheiroId,
      mimeDeclarado: "image/png",
      mimeDetetado: "image/png",
      negocioId,
      objectoOriginal: "original-privado",
      objectoSeguro: "seguro-privado",
      tamanhoDeclarado: 24,
      tamanhoVerificado: 24,
      tipo: "IMAGEM",
    });
    const servico = new ObterDownloadTemporarioDeMedia({
      armazenamento,
      obterInstanteAtual: () => agora,
      repositorio,
    });
    const entrada = { contexto: { negocioId, utilizadorId }, ficheiroId };
    await expect(servico.executar(entrada)).rejects.toBeInstanceOf(ErroDeMedia);
    repositorio.leitores.add(`${negocioId}:${utilizadorId}:${ficheiroId}`);
    const resultado = await servico.executar(entrada);
    expect(resultado.expiraEm).toBe("2026-08-14T12:01:00.000Z");
    expect(resultado.url).not.toContain("original-privado");
    expect(resultado.url).not.toContain("seguro-privado");
  });

  it("associa ao bloco apenas media PRONTO do negócio autorizado", async () => {
    const { repositorio } = prepararUpload();
    const blocoId = "0198f9a0-8b75-7000-8000-000000000005";
    repositorio.ficheiros.set(ficheiroId, {
      criadoPorUtilizadorId: utilizadorId,
      estado: "PENDENTE",
      experienciaId,
      id: ficheiroId,
      mimeDeclarado: "image/png",
      negocioId,
      objectoOriginal: "privado",
      tamanhoDeclarado: 24,
      tipo: "IMAGEM",
    });
    const servico = new AssociarMediaAoBloco(repositorio);
    const entrada = {
      blocoId,
      contexto: { negocioId, utilizadorId },
      ficheiroId,
    };
    await expect(servico.executar(entrada)).rejects.toMatchObject({
      codigo: "MEDIA_NAO_PRONTO",
    });
    await repositorio.atualizar({
      ...repositorio.ficheiros.get(ficheiroId)!,
      estado: "PRONTO",
    });
    await expect(servico.executar(entrada)).resolves.toEqual({
      blocoId,
      ficheiroId,
    });
  });
});
