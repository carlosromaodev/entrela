export type PedidoDeRecordacao = Readonly<{
  estado: "PENDENTE" | "PROCESSANDO" | "PRONTO" | "FALHOU";
  experienciaId: string;
  formato: "HTML" | "PDF";
  id: string;
  negocioId: string;
  requerenteId: string;
  tipoDoRequerente: "CRIADOR" | "DESTINATARIO";
}>;
export interface RepositorioDeRecordacoes {
  verificarElegibilidade(
    e: Readonly<{
      experienciaId: string;
      negocioId: string;
      requerenteId: string;
      tipoDoRequerente: PedidoDeRecordacao["tipoDoRequerente"];
    }>,
  ): Promise<boolean>;
  criarOuObter(p: PedidoDeRecordacao): Promise<PedidoDeRecordacao>;
  guardarPronta(
    negocioId: string,
    pedidoId: string,
    objecto: string,
  ): Promise<boolean>;
  obterConteudo(
    negocioId: string,
    experienciaId: string,
  ): Promise<
    Readonly<{
      titulo: string;
      etapas: readonly string[];
      mediaIds: readonly string[];
    }>
  >;
}
export interface ArmazenamentoDeRecordacoes {
  guardar(objecto: string, bytes: Uint8Array, mime: string): Promise<void>;
  urlTemporaria(objecto: string, expiraEm: string): Promise<string>;
}
export interface RendererPdf {
  renderizar(html: string): Promise<Uint8Array>;
}
export interface ResolverMediaTemporario {
  resolver(mediaId: string, expiraEm: string): Promise<string>;
}
