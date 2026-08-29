import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import Fastify from "fastify";

import {
  ArmazenamentoLocalPrivado,
  registrarHttpDoArmazenamentoLocal,
} from "./armazenamento-local-privado.js";
import { RateLimitMemoria } from "../lib/rate-limit-memoria.js";

describe("ArmazenamentoLocalPrivado", () => {
  let raiz: string | undefined;

  afterEach(async () => {
    if (raiz !== undefined) await rm(raiz, { force: true, recursive: true });
  });

  async function criar() {
    raiz = await mkdtemp(join(tmpdir(), "entrela-media-"));
    const storage = new ArmazenamentoLocalPrivado(
      raiz,
      "chave-local-de-testes-com-mais-de-32-caracteres",
      "http://127.0.0.1:3333",
      () => new Date("2026-08-14T12:00:00.000Z"),
    );
    await storage.preparar();
    return storage;
  }

  it("aceita upload assinado e entrega download assinado sem caminho no URL", async () => {
    const storage = await criar();
    const objecto = "negocios/n1/media/f1/seguro";
    const upload = await storage.criarUploadAssinado({
      expiraEm: "2026-08-14T12:05:00.000Z",
      mime: "image/png",
      objecto,
      tamanhoMaximo: 4,
    });
    const tokenUpload = new URL(upload.url).searchParams.get("token")!;
    await storage.receberUpload(
      tokenUpload,
      "image/png",
      Uint8Array.from([1, 2, 3, 4]),
    );
    const download = await storage.criarDownloadAssinado({
      expiraEm: "2026-08-14T12:01:00.000Z",
      objecto,
    });
    expect(download).not.toContain(objecto);
    const descarregado = await storage.entregarDownload(
      new URL(download).searchParams.get("token")!,
    );
    expect([...descarregado]).toEqual([1, 2, 3, 4]);
    expect((await stat(join(raiz!, objecto))).mode & 0o777).toBe(0o600);
  });

  it("recusa adulteração, expiração, MIME/tamanho e path traversal", async () => {
    const storage = await criar();
    const upload = await storage.criarUploadAssinado({
      expiraEm: "2026-08-14T12:05:00.000Z",
      mime: "image/png",
      objecto: "negocios/n1/media/f1/original",
      tamanhoMaximo: 2,
    });
    const token = new URL(upload.url).searchParams.get("token")!;
    await expect(
      storage.receberUpload(`${token}x`, "image/png", new Uint8Array(1)),
    ).rejects.toThrow();
    await expect(
      storage.receberUpload(token, "text/html", new Uint8Array(1)),
    ).rejects.toThrow();
    await expect(
      storage.receberUpload(token, "image/png", new Uint8Array(3)),
    ).rejects.toThrow();
    await expect(
      storage.guardarObjectoPrivado("../fora", new Uint8Array(1)),
    ).rejects.toThrow();

    const expirado = new ArmazenamentoLocalPrivado(
      raiz!,
      "chave-local-de-testes-com-mais-de-32-caracteres",
      "http://localhost",
      () => new Date("2026-08-14T12:06:00.000Z"),
    );
    await expect(
      expirado.receberUpload(token, "image/png", new Uint8Array(1)),
    ).rejects.toThrow("EXPIRADA");
  });

  it("expõe PUT/GET assinados operacionais com no-store", async () => {
    const storage = await criar();
    const aplicacao = Fastify();
    await registrarHttpDoArmazenamentoLocal(aplicacao, storage);
    const upload = await storage.criarUploadAssinado({
      expiraEm: "2026-08-14T12:05:00.000Z",
      mime: "application/octet-stream",
      objecto: "negocios/n1/media/f2/original",
      tamanhoMaximo: 2,
    });
    const respostaUpload = await aplicacao.inject({
      body: Buffer.from([7, 8]),
      headers: { "content-type": "application/octet-stream" },
      method: "PUT",
      url: `${new URL(upload.url).pathname}${new URL(upload.url).search}`,
    });
    expect(respostaUpload.statusCode).toBe(204);
    const download = await storage.criarDownloadAssinado({
      expiraEm: "2026-08-14T12:01:00.000Z",
      objecto: "negocios/n1/media/f2/original",
    });
    const respostaDownload = await aplicacao.inject({
      method: "GET",
      url: `${new URL(download).pathname}${new URL(download).search}`,
    });
    expect(respostaDownload.statusCode).toBe(200);
    expect(respostaDownload.headers["cache-control"]).toBe("private, no-store");
    expect([...respostaDownload.rawPayload]).toEqual([7, 8]);
    await aplicacao.close();
  });

  it("limita tentativas por IP nos endpoints de transferência assinada", async () => {
    const storage = await criar();
    const aplicacao = Fastify();
    await registrarHttpDoArmazenamentoLocal(aplicacao, storage, {
      janelaEmSegundos: 60,
      maximoPorIp: 1,
      rateLimit: new RateLimitMemoria(),
    });
    const download = await storage.criarDownloadAssinado({
      expiraEm: "2026-08-14T12:01:00.000Z",
      objecto: "negocios/n1/media/inexistente/seguro",
    });
    const url = `${new URL(download).pathname}${new URL(download).search}`;
    await aplicacao.inject({ method: "GET", remoteAddress: "198.51.100.1", url });
    const limitada = await aplicacao.inject({
      method: "GET",
      remoteAddress: "198.51.100.1",
      url,
    });
    expect(limitada.statusCode).toBe(429);
    expect(limitada.json()).toMatchObject({ erro: { codigo: "LIMITE_EXCEDIDO" } });
    await aplicacao.close();
  });
});
