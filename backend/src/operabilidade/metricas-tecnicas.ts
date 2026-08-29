const ROTAS = new Set([
  "saude",
  "readiness",
  "momentos_criar",
  "momentos_editar",
  "momentos_publicar",
  "momentos_publico",
  "media",
  "outra",
] as const);
type Rota =
  | "saude"
  | "readiness"
  | "momentos_criar"
  | "momentos_editar"
  | "momentos_publicar"
  | "momentos_publico"
  | "media"
  | "outra";
type Contadores = Readonly<{
  erros: number;
  latenciaTotalMs: number;
  requisicoes: number;
}>;
export class MetricasTecnicas {
  private readonly valores = new Map<
    string,
    { erros: number; latenciaTotalMs: number; requisicoes: number }
  >();
  registarHttp(
    entrada: Readonly<{ duracaoMs: number; rota: string; status: number }>,
  ) {
    const rota: Rota = ROTAS.has(entrada.rota as Rota)
      ? (entrada.rota as Rota)
      : "outra";
    const classe = `${Math.floor(entrada.status / 100)}xx`;
    const chave = `${rota}:${classe}`;
    const v = this.valores.get(chave) ?? {
      erros: 0,
      latenciaTotalMs: 0,
      requisicoes: 0,
    };
    v.requisicoes++;
    v.latenciaTotalMs += Math.max(0, entrada.duracaoMs);
    if (entrada.status >= 500) v.erros++;
    this.valores.set(chave, v);
  }
  obter(): ReadonlyMap<string, Contadores> {
    return this.valores;
  }
}
