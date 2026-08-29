import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { PedirRecordacao } from "./servicos.js";
export async function registrarHttpDeRecordacoes(
  app: FastifyInstance,
  d: Readonly<{
    contexto: () => Promise<{
      negocioId: string;
      requerenteId: string;
      tipoDoRequerente: "CRIADOR" | "DESTINATARIO";
    }>;
    pedir: PedirRecordacao;
  }>,
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/v1/experiencias/:experienciaId/recordacoes",
      {
        schema: {
          body: z.object({ formato: z.enum(["HTML", "PDF"]) }),
          params: z.object({ experienciaId: z.uuid() }),
          response: {
            202: z.object({
              dados: z.object({ estado: z.string(), id: z.uuid() }),
            }),
          },
          tags: ["Recordações"],
          summary: "Pedir ou reutilizar recordação",
        },
      },
      async (req, res) => {
        const c = await d.contexto();
        const p = await d.pedir.executar({ ...c, ...req.body, ...req.params });
        return res.status(202).send({ dados: { estado: p.estado, id: p.id } });
      },
    );
}
