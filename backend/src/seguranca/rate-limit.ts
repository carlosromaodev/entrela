import type { Pool } from "pg";
export type DecisaoDeLimite = Readonly<{
  permitido: boolean;
  restantes: number;
  tentarNovamenteEmSegundos: number;
}>;
export interface LimitadorDistribuido {
  consumir(
    chaveHmac: string,
    limite: number,
    janelaSegundos: number,
    agora: Date,
  ): Promise<DecisaoDeLimite>;
}
export class LimitadorPostgresql implements LimitadorDistribuido {
  constructor(private readonly pool: Pool) {}
  async consumir(
    chaveHmac: string,
    limite: number,
    janelaSegundos: number,
    agora: Date,
  ) {
    if (!/^[a-f0-9]{64}$/.test(chaveHmac))
      throw new Error("CHAVE_DE_LIMITE_NAO_PSEUDONIMIZADA");
    const r = await this.pool.query<{ quantidade: number; termina_em: Date }>(
      `INSERT INTO limites_de_taxa(chave_hmac,inicia_em,termina_em,quantidade) VALUES($1,$2,$2::timestamptz+make_interval(secs=>$3),1) ON CONFLICT(chave_hmac) DO UPDATE SET quantidade=CASE WHEN limites_de_taxa.termina_em<=$2 THEN 1 ELSE limites_de_taxa.quantidade+1 END,inicia_em=CASE WHEN limites_de_taxa.termina_em<=$2 THEN $2 ELSE limites_de_taxa.inicia_em END,termina_em=CASE WHEN limites_de_taxa.termina_em<=$2 THEN $2::timestamptz+make_interval(secs=>$3) ELSE limites_de_taxa.termina_em END RETURNING quantidade,termina_em`,
      [chaveHmac, agora.toISOString(), janelaSegundos],
    );
    const x = r.rows[0]!;
    return {
      permitido: x.quantidade <= limite,
      restantes: Math.max(0, limite - x.quantidade),
      tentarNovamenteEmSegundos: Math.max(
        0,
        Math.ceil((x.termina_em.getTime() - agora.getTime()) / 1000),
      ),
    };
  }
}
export class LimitadorEmMemoria implements LimitadorDistribuido {
  private readonly dados = new Map<string, { fim: number; n: number }>();
  async consumir(k: string, l: number, j: number, a: Date) {
    const agora = a.getTime(),
      x = this.dados.get(k);
    const v =
      x === undefined || x.fim <= agora
        ? { fim: agora + j * 1000, n: 1 }
        : { ...x, n: x.n + 1 };
    this.dados.set(k, v);
    return {
      permitido: v.n <= l,
      restantes: Math.max(0, l - v.n),
      tentarNovamenteEmSegundos: Math.ceil((v.fim - agora) / 1000),
    };
  }
}
