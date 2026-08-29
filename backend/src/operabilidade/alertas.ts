export type TipoDeAlerta =
  | "SLO"
  | "JOB"
  | "WEBHOOK"
  | "BACKUP"
  | "LATENCIA"
  | "ACESSO_CROSS_TENANT"
  | "ANOMALIA_TOKEN";
export type AlertaOperacional = Readonly<{
  dono: string;
  runbook: string;
  severidade: "P1" | "P2" | "P3";
  tipo: TipoDeAlerta;
}>;
const politicas: Readonly<
  Record<TipoDeAlerta, Omit<AlertaOperacional, "tipo">>
> = Object.freeze({
  ACESSO_CROSS_TENANT: {
    dono: "seguranca",
    runbook: "runbooks/acesso-cross-tenant",
    severidade: "P1",
  },
  ANOMALIA_TOKEN: {
    dono: "seguranca",
    runbook: "runbooks/anomalia-token",
    severidade: "P1",
  },
  BACKUP: { dono: "plataforma", runbook: "runbooks/backup", severidade: "P1" },
  JOB: { dono: "backend", runbook: "runbooks/jobs", severidade: "P2" },
  LATENCIA: { dono: "backend", runbook: "runbooks/latencia", severidade: "P2" },
  SLO: { dono: "plataforma", runbook: "runbooks/slo", severidade: "P1" },
  WEBHOOK: {
    dono: "integracoes",
    runbook: "runbooks/webhooks",
    severidade: "P2",
  },
});
export function criarAlerta(tipo: TipoDeAlerta): AlertaOperacional {
  return { tipo, ...politicas[tipo] };
}
