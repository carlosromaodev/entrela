CREATE TABLE "progressos_da_sessao" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"posicao_atual" integer NOT NULL,
	"sessao_id" uuid PRIMARY KEY NOT NULL,
	"versao_da_experiencia_id" uuid NOT NULL,
	CONSTRAINT "progressos_da_sessao_posicao_positiva" CHECK ("progressos_da_sessao"."posicao_atual" > 0)
);
--> statement-breakpoint
ALTER TABLE "progressos_da_sessao" ADD CONSTRAINT "progressos_da_sessao_sessao_id_sessoes_de_interacao_id_fk" FOREIGN KEY ("sessao_id") REFERENCES "public"."sessoes_de_interacao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progressos_da_sessao" ADD CONSTRAINT "progressos_da_sessao_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "progressos_da_sessao_por_versao" ON "progressos_da_sessao" USING btree ("versao_da_experiencia_id");
--> statement-breakpoint
ALTER TABLE progressos_da_sessao ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressos_da_sessao FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_progressos_da_sessao ON progressos_da_sessao
  USING (
    EXISTS (
      SELECT 1
      FROM sessoes_de_interacao AS sessao
      JOIN experiencias AS experiencia
        ON experiencia.id = sessao.experiencia_id
      JOIN versoes_da_experiencia AS versao
        ON versao.id = progressos_da_sessao.versao_da_experiencia_id
       AND versao.experiencia_id = sessao.experiencia_id
      WHERE sessao.id = progressos_da_sessao.sessao_id
        AND experiencia.negocio_id = negocio_atual()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM sessoes_de_interacao AS sessao
      JOIN experiencias AS experiencia
        ON experiencia.id = sessao.experiencia_id
      JOIN versoes_da_experiencia AS versao
        ON versao.id = progressos_da_sessao.versao_da_experiencia_id
       AND versao.experiencia_id = sessao.experiencia_id
      WHERE sessao.id = progressos_da_sessao.sessao_id
        AND experiencia.negocio_id = negocio_atual()
    )
  );
