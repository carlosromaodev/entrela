CREATE TABLE consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sujeito UUID NOT NULL REFERENCES participantes_da_experiencia(id),
  finalidade VARCHAR(100) NOT NULL,
  versao_politica VARCHAR(20) NOT NULL,
  concedido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  revogado_em TIMESTAMPTZ
);
