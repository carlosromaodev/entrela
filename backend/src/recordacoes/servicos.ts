import { z } from "zod";
import type {
  ArmazenamentoDeRecordacoes,
  PedidoDeRecordacao,
  RendererPdf,
  RepositorioDeRecordacoes,
  ResolverMediaTemporario,
} from "./contratos.js";
const esc = (v: string) =>
  v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export class PedirRecordacao {
  constructor(
    private readonly repo: RepositorioDeRecordacoes,
    private readonly gerarId: () => string,
  ) {}
  async executar(entrada: unknown) {
    const e = z
      .strictObject({
        experienciaId: z.uuid(),
        formato: z.enum(["HTML", "PDF"]),
        negocioId: z.uuid(),
        requerenteId: z.uuid(),
        tipoDoRequerente: z.enum(["CRIADOR", "DESTINATARIO"]),
      })
      .parse(entrada);
    if (!(await this.repo.verificarElegibilidade(e)))
      throw new Error("RECORDACAO_NAO_ELEGIVEL");
    const p: PedidoDeRecordacao = {
      ...e,
      estado: "PENDENTE",
      id: this.gerarId(),
    };
    return this.repo.criarOuObter(p);
  }
}
export class GerarRecordacao {
  constructor(
    private readonly repo: RepositorioDeRecordacoes,
    private readonly storage: ArmazenamentoDeRecordacoes,
    private readonly media: ResolverMediaTemporario,
    private readonly pdf: RendererPdf,
    private readonly agora: () => Date,
  ) {}
  async executar(p: PedidoDeRecordacao) {
    const c = await this.repo.obterConteudo(p.negocioId, p.experienciaId);
    const expira = new Date(this.agora().getTime() + 300_000).toISOString();
    const urls = await Promise.all(
      c.mediaIds.map((id) => this.media.resolver(id, expira)),
    );
    const html = `<!doctype html><html lang="pt"><meta charset="utf-8"><title>${esc(c.titulo)}</title><body><h1>${esc(c.titulo)}</h1>${c.etapas.map((x) => `<section><p>${esc(x)}</p></section>`).join("")}${urls.map((x) => `<a rel="noreferrer" href="${esc(x)}">Media</a>`).join("")}</body></html>`;
    const bytes =
      p.formato === "HTML"
        ? Buffer.from(html)
        : await this.pdf.renderizar(html);
    const objecto = `negocios/${p.negocioId}/recordacoes/${p.id}.${p.formato.toLowerCase()}`;
    await this.storage.guardar(
      objecto,
      bytes,
      p.formato === "HTML" ? "text/html; charset=utf-8" : "application/pdf",
    );
    if (!(await this.repo.guardarPronta(p.negocioId, p.id, objecto)))
      throw new Error("PEDIDO_NAO_PROCESSANDO");
    return { objecto };
  }
}
export class RendererPdfFake implements RendererPdf {
  async renderizar(_html: string): Promise<Uint8Array> {
    throw new Error("RENDERER_PDF_NAO_CONFIGURADO");
  }
}
