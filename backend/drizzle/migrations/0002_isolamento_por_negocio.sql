-- O repository define este contexto com SET LOCAL em cada transacção.
CREATE FUNCTION negocio_atual() RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.negocio_id', true), '')::uuid
$$;

ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_negocios ON negocios
  USING (id = negocio_atual()) WITH CHECK (id = negocio_atual());

ALTER TABLE membros_do_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_do_negocio FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_membros_do_negocio ON membros_do_negocio
  USING (negocio_id = negocio_atual())
  WITH CHECK (negocio_id = negocio_atual());

ALTER TABLE experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencias FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_experiencias ON experiencias
  USING (negocio_id = negocio_atual())
  WITH CHECK (negocio_id = negocio_atual());

ALTER TABLE versoes_da_experiencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE versoes_da_experiencia FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_versoes_da_experiencia ON versoes_da_experiencia
  USING (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = versoes_da_experiencia.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = versoes_da_experiencia.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE traducoes_da_experiencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE traducoes_da_experiencia FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_traducoes_da_experiencia ON traducoes_da_experiencia
  USING (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = traducoes_da_experiencia.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = traducoes_da_experiencia.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE blocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_blocos ON blocos
  USING (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = blocos.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = blocos.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE traducoes_do_bloco ENABLE ROW LEVEL SECURITY;
ALTER TABLE traducoes_do_bloco FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_traducoes_do_bloco ON traducoes_do_bloco
  USING (EXISTS (
    SELECT 1
    FROM blocos
    JOIN versoes_da_experiencia ON versoes_da_experiencia.id = blocos.versao_da_experiencia_id
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE blocos.id = traducoes_do_bloco.bloco_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM blocos
    JOIN versoes_da_experiencia ON versoes_da_experiencia.id = blocos.versao_da_experiencia_id
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE blocos.id = traducoes_do_bloco.bloco_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE politicas_de_disponibilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE politicas_de_disponibilidade FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_politicas_de_disponibilidade ON politicas_de_disponibilidade
  USING (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = politicas_de_disponibilidade.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = politicas_de_disponibilidade.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE pontos_de_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_de_acesso FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_pontos_de_acesso ON pontos_de_acesso
  USING (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = pontos_de_acesso.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = pontos_de_acesso.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE sessoes_de_interacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_de_interacao FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_sessoes_de_interacao ON sessoes_de_interacao
  USING (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = sessoes_de_interacao.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiencias
    WHERE experiencias.id = sessoes_de_interacao.experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE regras ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_regras ON regras
  USING (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = regras.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM versoes_da_experiencia
    JOIN experiencias ON experiencias.id = versoes_da_experiencia.experiencia_id
    WHERE versoes_da_experiencia.id = regras.versao_da_experiencia_id
      AND experiencias.negocio_id = negocio_atual()
  ));

ALTER TABLE eventos_de_interacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_de_interacao FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_eventos_de_interacao ON eventos_de_interacao
  USING (negocio_id = negocio_atual())
  WITH CHECK (negocio_id = negocio_atual());

ALTER TABLE direitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE direitos FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_direitos ON direitos
  USING (negocio_id = negocio_atual())
  WITH CHECK (negocio_id = negocio_atual());

ALTER TABLE registos_de_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE registos_de_auditoria FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_registos_de_auditoria ON registos_de_auditoria
  USING (negocio_id = negocio_atual())
  WITH CHECK (negocio_id = negocio_atual());
