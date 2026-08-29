import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { RepositorioDeComunicacoes } from "../comunicacoes/contratos.js";
import type { RemoverContribuicaoIndividual } from "../moderacao/servico.js";
import type { GerirConsentimento } from "./servicos.js";
const finalidade = z.enum([
  "OPERACIONAL",
  "MARKETING_PROPRIO",
  "MARKETING_TERCEIROS",
  "MEDIA_PUBLICA",
]);
const envelope = z.object({ dados: z.record(z.string(), z.unknown()) });
export async function registrarHttpDePrivacidade(
  app: FastifyInstance,
  d: Readonly<{
    consentimento: GerirConsentimento;
    contexto: () => Promise<{ negocioId: string }>;
    moderacao: RemoverContribuicaoIndividual;
    comunicacoes: RepositorioDeComunicacoes;
  }>,
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/v1/contactos/:contactoId/consentimentos",
      {
        schema: {
          body: z.object({ finalidade, versao: z.string() }),
          params: z.object({ contactoId: z.uuid() }),
          response: { 201: envelope },
          tags: ["Pessoas"],
        },
      },
      async (req, res) =>
        res
          .status(201)
          .send({
            dados: await d.consentimento.conceder({
              ...req.body,
              contactoId: req.params.contactoId,
              contexto: await d.contexto(),
            }),
          }),
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/v1/contactos/:contactoId/consentimentos/:finalidade",
      {
        schema: {
          params: z.object({ contactoId: z.uuid(), finalidade }),
          response: { 200: envelope },
          tags: ["Pessoas"],
        },
      },
      async (req, res) =>
        res.send({
          dados: {
            revogado: await d.consentimento.revogar({
              contactoId: req.params.contactoId,
              finalidade: req.params.finalidade,
              contexto: await d.contexto(),
            }),
          },
        }),
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/v1/contactos/:contactoId/opt-outs",
      {
        schema: {
          body: z.object({ finalidade }),
          params: z.object({ contactoId: z.uuid() }),
          response: { 200: envelope },
          tags: ["Comunicações"],
        },
      },
      async (req, res) => {
        const c = await d.contexto();
        await d.comunicacoes.suprimirContacto(
          c.negocioId,
          req.params.contactoId,
          req.body.finalidade,
        );
        return res.send({ dados: { suprimido: true } });
      },
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/v1/contribuicoes/:contribuicaoId",
      {
        schema: {
          body: z.object({ moderadorId: z.uuid(), motivo: z.string().min(3) }),
          params: z.object({ contribuicaoId: z.uuid() }),
          response: { 200: envelope },
          tags: ["Moderação"],
        },
      },
      async (req, res) => {
        const c = await d.contexto();
        return res.send({
          dados: await d.moderacao.executar({
            ...req.body,
            ...req.params,
            negocioId: c.negocioId,
          }),
        });
      },
    );
}
