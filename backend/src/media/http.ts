import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type {
  AssociarMediaAoBloco,
  ConfirmarUploadDeMedia,
  ObterDownloadTemporarioDeMedia,
  SolicitarUploadDeMedia,
} from "./servicos.js";

const parametrosDoMomento = z.strictObject({ momentoId: z.uuid() });
const parametrosDoFicheiro = z.strictObject({ ficheiroId: z.uuid() });
const corpoDoUpload = z.strictObject({
  mime: z.string(),
  tamanhoEmBytes: z.number().int().positive(),
  tipo: z.enum(["AUDIO", "IMAGEM", "VIDEO"]),
});
const dadosDoUpload = z.object({
  estado: z.literal("PENDENTE"),
  expiraEm: z.iso.datetime(),
  ficheiroId: z.uuid(),
  upload: z.object({
    campos: z.record(z.string(), z.string()),
    url: z.url(),
  }),
});
const dadosDaConfirmacao = z.object({
  estado: z.enum(["PENDENTE", "PROCESSANDO", "PRONTO", "FALHOU"]),
  ficheiroId: z.uuid(),
});
const dadosDoDownload = z.object({ expiraEm: z.iso.datetime(), url: z.url() });
const respostaDoUpload = z.object({ dados: dadosDoUpload });
const respostaDaConfirmacao = z.object({ dados: dadosDaConfirmacao });
const respostaDoDownload = z.object({ dados: dadosDoDownload });

export type ContextoAutenticadoDeMedia = Readonly<{
  negocioId: string;
  utilizadorId: string;
}>;

export type DependenciasHttpDeMedia = Readonly<{
  associarAoBloco: AssociarMediaAoBloco;
  confirmarUpload: ConfirmarUploadDeMedia;
  obterContexto: (
    requisicao: FastifyRequest,
  ) => Promise<ContextoAutenticadoDeMedia>;
  obterDownload: ObterDownloadTemporarioDeMedia;
  solicitarUpload: SolicitarUploadDeMedia;
}>;

export async function registrarHttpDeMedia(
  aplicacao: FastifyInstance,
  dependencias: DependenciasHttpDeMedia,
): Promise<void> {
  aplicacao.withTypeProvider<ZodTypeProvider>().post(
    "/v1/momentos/:momentoId/ficheiros/uploads",
    {
      schema: {
        body: corpoDoUpload,
        params: parametrosDoMomento,
        response: { 201: respostaDoUpload },
        summary: "Solicitar upload privado de media",
        tags: ["Media"],
      },
    },
    async (requisicao, resposta) => {
      const contexto = await dependencias.obterContexto(requisicao);
      const resultado = await dependencias.solicitarUpload.executar({
        ...requisicao.body,
        contexto,
        experienciaId: requisicao.params.momentoId,
      });
      return resposta.status(201).send({ dados: resultado });
    },
  );

  aplicacao.withTypeProvider<ZodTypeProvider>().post(
    "/v1/blocos/:blocoId/ficheiros/:ficheiroId",
    {
      schema: {
        params: z.strictObject({ blocoId: z.uuid(), ficheiroId: z.uuid() }),
        response: {
          201: z.object({
            dados: z.object({ blocoId: z.uuid(), ficheiroId: z.uuid() }),
          }),
        },
        summary: "Associar media pronto ao bloco",
        tags: ["Media"],
      },
    },
    async (requisicao, resposta) => {
      const contexto = await dependencias.obterContexto(requisicao);
      const resultado = await dependencias.associarAoBloco.executar({
        ...requisicao.params,
        contexto,
      });
      return resposta.status(201).send({ dados: resultado });
    },
  );

  aplicacao.withTypeProvider<ZodTypeProvider>().post(
    "/v1/ficheiros/:ficheiroId/confirmacoes",
    {
      schema: {
        params: parametrosDoFicheiro,
        response: { 202: respostaDaConfirmacao },
        summary: "Confirmar upload e agendar processamento",
        tags: ["Media"],
      },
    },
    async (requisicao, resposta) => {
      const contexto = await dependencias.obterContexto(requisicao);
      const resultado = await dependencias.confirmarUpload.executar({
        contexto,
        ficheiroId: requisicao.params.ficheiroId,
      });
      return resposta.status(202).send({ dados: resultado });
    },
  );

  aplicacao.withTypeProvider<ZodTypeProvider>().post(
    "/v1/ficheiros/:ficheiroId/downloads",
    {
      schema: {
        params: parametrosDoFicheiro,
        response: { 201: respostaDoDownload },
        summary: "Criar URL temporária de media autorizado",
        tags: ["Media"],
      },
    },
    async (requisicao, resposta) => {
      const contexto = await dependencias.obterContexto(requisicao);
      const resultado = await dependencias.obterDownload.executar({
        contexto,
        ficheiroId: requisicao.params.ficheiroId,
      });
      return resposta.status(201).send({ dados: resultado });
    },
  );
}
