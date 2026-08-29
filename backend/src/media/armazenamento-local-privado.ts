import { createHmac, timingSafeEqual } from "node:crypto";
import { constants } from "node:fs";
import { mkdir, open, readFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { RateLimit } from "../lib/rate-limit.js";
import type { ArmazenamentoPrivadoDeMedia } from "./contratos.js";

type AutorizacaoLocal = Readonly<{
  expiraEm: string;
  mime?: string;
  objecto: string;
  operacao: "DOWNLOAD" | "UPLOAD";
  tamanhoMaximo?: number;
}>;

const autorizacaoLocal = z.strictObject({
  expiraEm: z.iso.datetime(),
  mime: z.string().max(100).optional(),
  objecto: z.string().max(500),
  operacao: z.enum(["DOWNLOAD", "UPLOAD"]),
  tamanhoMaximo: z.number().int().positive().optional(),
});

export class ArmazenamentoLocalPrivado implements ArmazenamentoPrivadoDeMedia {
  private readonly raiz: string;

  constructor(
    raiz: string,
    private readonly chaveDeAssinatura: string,
    private readonly origemHttp: string,
    private readonly obterInstanteAtual: () => Date = () => new Date(),
  ) {
    if (chaveDeAssinatura.length < 32) throw new Error("CHAVE_LOCAL_FRACA");
    this.raiz = resolve(raiz);
  }

  async preparar(): Promise<void> {
    await mkdir(this.raiz, { mode: 0o700, recursive: true });
  }

  async criarUploadAssinado(
    entrada: Readonly<{
      expiraEm: string;
      mime: string;
      objecto: string;
      tamanhoMaximo: number;
    }>,
  ) {
    const token = this.assinar({ ...entrada, operacao: "UPLOAD" });
    return {
      campos: { "Content-Type": entrada.mime },
      url: `${this.origemHttp}/media-local/uploads?token=${encodeURIComponent(token)}`,
    };
  }

  async criarDownloadAssinado(
    entrada: Readonly<{ expiraEm: string; objecto: string }>,
  ) {
    return `${this.origemHttp}/media-local/downloads?token=${encodeURIComponent(
      this.assinar({
        ...entrada,
        operacao: "DOWNLOAD",
      }),
    )}`;
  }

  async receberUpload(
    token: string,
    mime: string,
    bytes: Uint8Array,
  ): Promise<void> {
    const autorizacao = this.verificar(token, "UPLOAD");
    if (
      autorizacao.mime !== mime ||
      bytes.byteLength > (autorizacao.tamanhoMaximo ?? 0)
    ) {
      throw new Error("UPLOAD_FORA_DA_AUTORIZACAO");
    }
    await this.escrever(autorizacao.objecto, bytes);
  }

  async entregarDownload(token: string): Promise<Uint8Array> {
    const autorizacao = this.verificar(token, "DOWNLOAD");
    return this.lerObjectoPrivado(autorizacao.objecto, 100 * 1024 * 1024);
  }

  async lerObjectoPrivado(
    objecto: string,
    tamanhoMaximo: number,
  ): Promise<Uint8Array> {
    const bytes = await readFile(this.caminhoSeguro(objecto));
    if (bytes.byteLength > tamanhoMaximo)
      throw new Error("OBJECTO_EXCEDE_LIMITE");
    return bytes;
  }

  async guardarObjectoPrivado(
    objecto: string,
    conteudo: Uint8Array,
  ): Promise<void> {
    await this.escrever(objecto, conteudo);
  }

  private assinar(autorizacao: AutorizacaoLocal): string {
    this.caminhoSeguro(autorizacao.objecto);
    const corpo = Buffer.from(JSON.stringify(autorizacao)).toString(
      "base64url",
    );
    const assinatura = createHmac("sha256", this.chaveDeAssinatura)
      .update(corpo)
      .digest("base64url");
    return `${corpo}.${assinatura}`;
  }

  private verificar(
    token: string,
    operacao: AutorizacaoLocal["operacao"],
  ): AutorizacaoLocal {
    const [corpo, assinatura, excesso] = token.split(".");
    if (
      corpo === undefined ||
      assinatura === undefined ||
      excesso !== undefined
    ) {
      throw new Error("ASSINATURA_LOCAL_INVALIDA");
    }
    const esperada = createHmac("sha256", this.chaveDeAssinatura)
      .update(corpo)
      .digest();
    const recebida = Buffer.from(assinatura, "base64url");
    if (
      recebida.length !== esperada.length ||
      !timingSafeEqual(recebida, esperada)
    ) {
      throw new Error("ASSINATURA_LOCAL_INVALIDA");
    }
    const dados = autorizacaoLocal.parse(
      JSON.parse(Buffer.from(corpo, "base64url").toString()),
    );
    const autorizacao: AutorizacaoLocal = {
      expiraEm: dados.expiraEm,
      ...(dados.mime === undefined ? {} : { mime: dados.mime }),
      objecto: dados.objecto,
      operacao: dados.operacao,
      ...(dados.tamanhoMaximo === undefined
        ? {}
        : { tamanhoMaximo: dados.tamanhoMaximo }),
    };
    if (
      autorizacao.operacao !== operacao ||
      new Date(autorizacao.expiraEm).getTime() <=
        this.obterInstanteAtual().getTime()
    ) {
      throw new Error("AUTORIZACAO_LOCAL_EXPIRADA");
    }
    this.caminhoSeguro(autorizacao.objecto);
    return autorizacao;
  }

  private caminhoSeguro(objecto: string): string {
    if (!/^[a-zA-Z0-9/_-]{1,500}$/.test(objecto))
      throw new Error("OBJECTO_LOCAL_INVALIDO");
    const caminho = resolve(this.raiz, objecto);
    if (!caminho.startsWith(`${this.raiz}${sep}`))
      throw new Error("OBJECTO_FORA_DA_RAIZ");
    return caminho;
  }

  private async escrever(objecto: string, bytes: Uint8Array): Promise<void> {
    const caminho = this.caminhoSeguro(objecto);
    await mkdir(dirname(caminho), { mode: 0o700, recursive: true });
    const ficheiro = await open(
      caminho,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_TRUNC |
        constants.O_NOFOLLOW,
      0o600,
    );
    try {
      await ficheiro.writeFile(bytes);
    } finally {
      await ficheiro.close();
    }
  }
}

export async function registrarHttpDoArmazenamentoLocal(
  aplicacao: FastifyInstance,
  armazenamento: ArmazenamentoLocalPrivado,
  limite?: Readonly<{ janelaEmSegundos: number; maximoPorIp: number; rateLimit: RateLimit }>,
): Promise<void> {
  function limitar(requisicao: Readonly<{ ip: string }>, resposta: { code: (codigo: number) => { send: (corpo: unknown) => unknown } }): unknown {
    if (
      limite !== undefined &&
      !limite.rateLimit.verificar(requisicao.ip, limite.maximoPorIp, limite.janelaEmSegundos)
    ) {
      return resposta.code(429).send({ erro: { codigo: "LIMITE_EXCEDIDO", mensagem: "Demasiadas tentativas." } });
    }
    return undefined;
  }
  if (!aplicacao.hasContentTypeParser("application/octet-stream")) {
    aplicacao.addContentTypeParser(
      "application/octet-stream",
      { parseAs: "buffer" },
      (_requisicao, corpo, concluir) => concluir(null, corpo),
    );
  }
  aplicacao.put<{ Querystring: { token: string }; Body: Buffer }>(
    "/media-local/uploads",
    async (requisicao, resposta) => {
      const bloqueada = limitar(requisicao, resposta);
      if (bloqueada !== undefined) return bloqueada;
      await armazenamento.receberUpload(
        requisicao.query.token,
        requisicao.headers["content-type"] ?? "",
        requisicao.body,
      );
      return resposta.status(204).send();
    },
  );
  aplicacao.get<{ Querystring: { token: string } }>(
    "/media-local/downloads",
    async (requisicao, resposta) => {
      const bloqueada = limitar(requisicao, resposta);
      if (bloqueada !== undefined) return bloqueada;
      const bytes = await armazenamento.entregarDownload(
        requisicao.query.token,
      );
      return resposta
        .header("cache-control", "private, no-store")
        .header("content-type", "application/octet-stream")
        .send(Buffer.from(bytes));
    },
  );
}
