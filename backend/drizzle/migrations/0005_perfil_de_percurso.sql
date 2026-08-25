CREATE TABLE perfis_de_percurso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES negocios(id),
  experiencia_id UUID NOT NULL REFERENCES experiencias(id),
  nome VARCHAR(120) NOT NULL,
  idioma VARCHAR(5) NOT NULL CHECK (idioma IN ('pt-AO', 'en')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE paragens_do_percurso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES perfis_de_percurso(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL CHECK (ordem > 0),
  local_id UUID NOT NULL REFERENCES locais(id),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  raio_proximidade_metros INTEGER NOT NULL DEFAULT 50 CHECK (raio_proximidade_metros > 0),
  conteudo_bloco_id UUID REFERENCES blocos(id),
  UNIQUE (perfil_id, ordem)
);

CREATE INDEX idx_perfis_de_percurso_negocio ON perfis_de_percurso(negocio_id);
CREATE INDEX idx_paragens_perfil_ordem ON paragens_do_percurso(perfil_id, ordem);
