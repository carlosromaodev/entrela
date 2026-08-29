export type TipoDeMedia = "AUDIO" | "IMAGEM" | "VIDEO";
export type EstadoDoMedia = "PENDENTE" | "PROCESSANDO" | "PRONTO" | "FALHOU";

export type FicheiroDeMedia = Readonly<{
  altura?: number;
  criadoPorUtilizadorId: string;
  duracaoEmMilissegundos?: number;
  estado: EstadoDoMedia;
  experienciaId: string;
  id: string;
  largura?: number;
  mimeDeclarado: string;
  mimeDetetado?: string;
  negocioId: string;
  objectoOriginal: string;
  objectoSeguro?: string;
  problemaTecnico?: string;
  somaSha256?: string;
  tamanhoDeclarado: number;
  tamanhoVerificado?: number;
  tipo: TipoDeMedia;
}>;

export const limitesDeMedia = {
  AUDIO: 20 * 1024 * 1024,
  IMAGEM: 10 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
} as const;

export const mimesPermitidos = {
  AUDIO: ["audio/mpeg"],
  IMAGEM: ["image/jpeg", "image/png"],
  VIDEO: ["video/mp4"],
} as const satisfies Record<TipoDeMedia, readonly string[]>;
