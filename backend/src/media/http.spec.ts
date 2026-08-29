import swagger from "@fastify/swagger";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { describe, expect, it } from "vitest";

import {
  ArmazenamentoPrivadoDeMediaEmMemoria,
  FilaDeProcessamentoDeMediaEmMemoria,
  RepositorioDeMediaEmMemoria,
} from "./adaptadores-em-memoria.js";
import { registrarHttpDeMedia } from "./http.js";
import {
  AssociarMediaAoBloco,
  ConfirmarUploadDeMedia,
  ObterDownloadTemporarioDeMedia,
  SolicitarUploadDeMedia,
} from "./servicos.js";

const negocioId = "0198f9a0-8b75-7000-8000-000000000001";
const utilizadorId = "0198f9a0-8b75-7000-8000-000000000002";
const momentoId = "0198f9a0-8b75-7000-8000-000000000003";
const ficheiroId = "0198f9a0-8b75-7000-8000-000000000004";

describe("HTTP de media", () => {
  it("publica OpenAPI e responde no envelope canónico", async () => {
    const aplicacao = Fastify();
    aplicacao.setValidatorCompiler(validatorCompiler);
    aplicacao.setSerializerCompiler(serializerCompiler);
    await aplicacao.register(swagger, {
      openapi: { info: { title: "Media", version: "1" }, openapi: "3.1.0" },
      transform: jsonSchemaTransform,
    });
    const armazenamento = new ArmazenamentoPrivadoDeMediaEmMemoria();
    const repositorio = new RepositorioDeMediaEmMemoria();
    repositorio.papeis.set(`${negocioId}:${utilizadorId}`, "EDITOR");
    await registrarHttpDeMedia(aplicacao, {
      associarAoBloco: new AssociarMediaAoBloco(repositorio),
      confirmarUpload: new ConfirmarUploadDeMedia({
        fila: new FilaDeProcessamentoDeMediaEmMemoria(repositorio),
        repositorio,
      }),
      obterContexto: async () => ({ negocioId, utilizadorId }),
      obterDownload: new ObterDownloadTemporarioDeMedia({
        armazenamento,
        obterInstanteAtual: () => new Date(),
        repositorio,
      }),
      solicitarUpload: new SolicitarUploadDeMedia({
        armazenamento,
        gerarId: () => ficheiroId,
        obterInstanteAtual: () => new Date("2026-08-14T12:00:00.000Z"),
        repositorio,
      }),
    });
    await aplicacao.ready();

    const resposta = await aplicacao.inject({
      body: { mime: "image/png", tamanhoEmBytes: 24, tipo: "IMAGEM" },
      method: "POST",
      url: `/v1/momentos/${momentoId}/ficheiros/uploads`,
    });
    expect(resposta.statusCode).toBe(201);
    expect(resposta.json()).toMatchObject({
      dados: { estado: "PENDENTE", ficheiroId },
    });
    const documento = aplicacao.swagger();
    expect(documento.paths).toHaveProperty(
      "/v1/momentos/{momentoId}/ficheiros/uploads",
    );
    expect(documento.paths).toHaveProperty(
      "/v1/blocos/{blocoId}/ficheiros/{ficheiroId}",
    );
    await aplicacao.close();
  });
});
