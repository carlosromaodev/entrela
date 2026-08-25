CREATE TABLE participantes_da_experiencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id),
  contacto_id UUID REFERENCES contactos(id),
  utilizador_id UUID REFERENCES utilizadores(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('destinatario', 'convidado', 'visitante', 'lead')),
  atributos JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE segmentos_de_publico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id),
  nome VARCHAR(100) NOT NULL
);

CREATE TABLE membros_do_segmento (
  segmento_id UUID NOT NULL REFERENCES segmentos_de_publico(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES participantes_da_experiencia(id) ON DELETE CASCADE,
  PRIMARY KEY (segmento_id, participante_id)
);
