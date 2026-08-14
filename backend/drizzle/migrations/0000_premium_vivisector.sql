CREATE TYPE "public"."categoria_da_experiencia" AS ENUM('EMPRESAS', 'EVENTOS', 'MOMENTOS', 'PRESENTES', 'CONVITES', 'EXPERIENCIAS');--> statement-breakpoint
CREATE TYPE "public"."codigo_de_idioma" AS ENUM('pt-AO', 'en');--> statement-breakpoint
CREATE TYPE "public"."estado_da_experiencia" AS ENUM('RASCUNHO', 'PUBLICADA', 'PAUSADA', 'ARQUIVADA');--> statement-breakpoint
CREATE TYPE "public"."estado_da_membresia" AS ENUM('CONVIDADO', 'ATIVO', 'REVOGADO');--> statement-breakpoint
CREATE TYPE "public"."estado_da_regra" AS ENUM('RASCUNHO', 'ATIVA', 'DESATIVADA');--> statement-breakpoint
CREATE TYPE "public"."estado_da_sessao" AS ENUM('NOVA', 'EM_ESPERA', 'ATIVA', 'CONCLUIDA', 'NEGADA', 'EXPIRADA', 'PRE_VISUALIZACAO');--> statement-breakpoint
CREATE TYPE "public"."estado_da_versao" AS ENUM('RASCUNHO', 'VALIDADA', 'PUBLICADA', 'SUBSTITUIDA');--> statement-breakpoint
CREATE TYPE "public"."estado_do_negocio" AS ENUM('ATIVO', 'SUSPENSO', 'ENCERRADO');--> statement-breakpoint
CREATE TYPE "public"."estado_do_ponto_de_acesso" AS ENUM('ATIVO', 'REVOGADO', 'EXPIRADO');--> statement-breakpoint
CREATE TYPE "public"."estado_do_utilizador" AS ENUM('ATIVO', 'SUSPENSO', 'ELIMINADO');--> statement-breakpoint
CREATE TYPE "public"."papel_do_membro" AS ENUM('PROPRIETARIO', 'ADMINISTRADOR', 'EDITOR', 'OPERADOR', 'ANALISTA', 'FATURACAO');--> statement-breakpoint
CREATE TYPE "public"."tipo_de_negocio" AS ENUM('PESSOAL', 'EMPRESARIAL', 'PARCEIRO');--> statement-breakpoint
CREATE TYPE "public"."tipo_de_ponto_de_acesso" AS ENUM('URL', 'QR', 'NFC', 'CODIGO_CURTO');--> statement-breakpoint
CREATE TABLE "blocos" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"chave_do_bloco" varchar(80) NOT NULL,
	"configuracao" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"posicao" integer NOT NULL,
	"tipo" varchar(40) NOT NULL,
	"versao_da_experiencia_id" uuid NOT NULL,
	"versao_do_esquema" integer DEFAULT 1 NOT NULL,
	"visibilidade_inicial" varchar(20) DEFAULT 'BLOQUEADO' NOT NULL,
	CONSTRAINT "blocos_chave_unica_na_versao" UNIQUE("versao_da_experiencia_id","chave_do_bloco"),
	CONSTRAINT "blocos_posicao_unica_na_versao" UNIQUE("versao_da_experiencia_id","posicao"),
	CONSTRAINT "blocos_posicao_positiva" CHECK ("blocos"."posicao" > 0)
);
--> statement-breakpoint
CREATE TABLE "direitos" (
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" varchar(24) NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"inicia_em" timestamp with time zone DEFAULT now() NOT NULL,
	"negocio_id" uuid,
	"referencia_id" uuid,
	"termina_em" timestamp with time zone,
	"tipo" varchar(48) NOT NULL,
	CONSTRAINT "direitos_sujeito_obrigatorio" CHECK ("direitos"."negocio_id" IS NOT NULL),
	CONSTRAINT "direitos_datas" CHECK ("direitos"."termina_em" IS NULL OR "direitos"."inicia_em" <= "direitos"."termina_em")
);
--> statement-breakpoint
CREATE TABLE "eventos_de_interacao" (
	"chave_de_idempotencia" varchar(160) NOT NULL,
	"chave_do_bloco" varchar(80),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"dados" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"experiencia_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"negocio_id" uuid NOT NULL,
	"ocorreu_em" timestamp with time zone NOT NULL,
	"origem" varchar(32) NOT NULL,
	"ponto_de_acesso_id" uuid,
	"sessao_de_interacao_id" uuid,
	"tipo" varchar(48) NOT NULL,
	"versao_da_experiencia_id" uuid NOT NULL,
	CONSTRAINT "eventos_de_interacao_idempotencia_unica" UNIQUE("experiencia_id","chave_de_idempotencia")
);
--> statement-breakpoint
CREATE TABLE "experiencias" (
	"arquivada_em" timestamp with time zone,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"categoria" "categoria_da_experiencia" NOT NULL,
	"configuracao" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_por_utilizador_id" uuid NOT NULL,
	"estado" "estado_da_experiencia" DEFAULT 'RASCUNHO' NOT NULL,
	"fuso_horario" varchar(64) DEFAULT 'Africa/Luanda' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"idioma_predefinido" "codigo_de_idioma" DEFAULT 'pt-AO' NOT NULL,
	"negocio_id" uuid NOT NULL,
	"publicada_em" timestamp with time zone,
	"versao_de_rascunho_atual_id" uuid,
	"versao_publicada_id" uuid
);
--> statement-breakpoint
CREATE TABLE "membros_do_negocio" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_da_membresia" DEFAULT 'CONVIDADO' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"negocio_id" uuid NOT NULL,
	"papel" "papel_do_membro" NOT NULL,
	"utilizador_id" uuid NOT NULL,
	CONSTRAINT "membros_do_negocio_negocio_utilizador_unico" UNIQUE("negocio_id","utilizador_id")
);
--> statement-breakpoint
CREATE TABLE "negocios" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"codigo_do_pais" char(2) NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_do_negocio" DEFAULT 'ATIVO' NOT NULL,
	"fuso_horario" varchar(64) DEFAULT 'Africa/Luanda' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"identificador_publico" varchar(80) NOT NULL,
	"idioma_predefinido" "codigo_de_idioma" DEFAULT 'pt-AO' NOT NULL,
	"nome_de_apresentacao" varchar(160) NOT NULL,
	"tipo" "tipo_de_negocio" NOT NULL,
	CONSTRAINT "negocios_identificador_publico_unique" UNIQUE("identificador_publico")
);
--> statement-breakpoint
CREATE TABLE "politicas_de_disponibilidade" (
	"abre_em" timestamp with time zone,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_em" timestamp with time zone,
	"fuso_horario" varchar(64) NOT NULL,
	"modo" varchar(24) NOT NULL,
	"versao_da_experiencia_id" uuid PRIMARY KEY NOT NULL,
	CONSTRAINT "politicas_de_disponibilidade_datas" CHECK ("politicas_de_disponibilidade"."abre_em" IS NULL OR "politicas_de_disponibilidade"."expira_em" IS NULL OR "politicas_de_disponibilidade"."abre_em" <= "politicas_de_disponibilidade"."expira_em")
);
--> statement-breakpoint
CREATE TABLE "pontos_de_acesso" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"canal_de_origem" varchar(64),
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_do_ponto_de_acesso" DEFAULT 'ATIVO' NOT NULL,
	"experiencia_id" uuid NOT NULL,
	"hmac_do_token_publico" char(64) NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"inicia_em" timestamp with time zone,
	"maximo_de_usos" integer,
	"quantidade_de_usos" integer DEFAULT 0 NOT NULL,
	"termina_em" timestamp with time zone,
	"tipo" "tipo_de_ponto_de_acesso" NOT NULL,
	"versao_da_experiencia_id" uuid NOT NULL,
	CONSTRAINT "pontos_de_acesso_limite_positivo" CHECK ("pontos_de_acesso"."maximo_de_usos" IS NULL OR "pontos_de_acesso"."maximo_de_usos" > 0),
	CONSTRAINT "pontos_de_acesso_quantidade_valida" CHECK ("pontos_de_acesso"."quantidade_de_usos" >= 0 AND ("pontos_de_acesso"."maximo_de_usos" IS NULL OR "pontos_de_acesso"."quantidade_de_usos" <= "pontos_de_acesso"."maximo_de_usos"))
);
--> statement-breakpoint
CREATE TABLE "registos_de_auditoria" (
	"acao" varchar(80) NOT NULL,
	"alvo_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"dados_ocultos" jsonb,
	"hmac_do_ip" char(64),
	"id" uuid PRIMARY KEY NOT NULL,
	"negocio_id" uuid NOT NULL,
	"tipo_do_alvo" varchar(48) NOT NULL,
	"utilizador_responsavel_id" uuid
);
--> statement-breakpoint
CREATE TABLE "regras" (
	"acoes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"chave_da_regra" varchar(80) NOT NULL,
	"condicoes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_da_regra" DEFAULT 'RASCUNHO' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"prioridade" integer DEFAULT 0 NOT NULL,
	"tipo_de_gatilho" varchar(48) NOT NULL,
	"versao_da_experiencia_id" uuid NOT NULL,
	"versao_do_esquema" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "regras_chave_unica_na_versao" UNIQUE("versao_da_experiencia_id","chave_da_regra")
);
--> statement-breakpoint
CREATE TABLE "sessoes_de_interacao" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_da_sessao" DEFAULT 'NOVA' NOT NULL,
	"experiencia_id" uuid NOT NULL,
	"hmac_do_identificador_anonimo" char(64),
	"id" uuid PRIMARY KEY NOT NULL,
	"idioma" "codigo_de_idioma" DEFAULT 'pt-AO' NOT NULL,
	"iniciada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ponto_de_acesso_id" uuid,
	"terminada_em" timestamp with time zone,
	"versao_da_experiencia_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traducoes_da_experiencia" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"experiencia_id" uuid NOT NULL,
	"idioma" "codigo_de_idioma" NOT NULL,
	"metadados_de_partilha" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resumo" text,
	"titulo" varchar(160) NOT NULL,
	CONSTRAINT "traducoes_da_experiencia_experiencia_id_idioma_pk" PRIMARY KEY("experiencia_id","idioma")
);
--> statement-breakpoint
CREATE TABLE "traducoes_do_bloco" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"bloco_id" uuid NOT NULL,
	"conteudo" jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"idioma" "codigo_de_idioma" NOT NULL,
	CONSTRAINT "traducoes_do_bloco_bloco_id_idioma_pk" PRIMARY KEY("bloco_id","idioma")
);
--> statement-breakpoint
CREATE TABLE "utilizadores" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text,
	"estado" "estado_do_utilizador" DEFAULT 'ATIVO' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"idioma_preferido" "codigo_de_idioma" DEFAULT 'pt-AO' NOT NULL,
	"nome_de_apresentacao" varchar(120) NOT NULL,
	"telefone_e164" varchar(32),
	CONSTRAINT "utilizadores_contacto_obrigatorio" CHECK ("utilizadores"."email" IS NOT NULL OR "utilizadores"."telefone_e164" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "versoes_da_experiencia" (
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_por_utilizador_id" uuid NOT NULL,
	"estado" "estado_da_versao" DEFAULT 'RASCUNHO' NOT NULL,
	"experiencia_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"numero" integer NOT NULL,
	"publicada_em" timestamp with time zone,
	"soma_de_verificacao_da_definicao" char(64),
	CONSTRAINT "versoes_da_experiencia_numero_unico" UNIQUE("experiencia_id","numero"),
	CONSTRAINT "versoes_da_experiencia_numero_positivo" CHECK ("versoes_da_experiencia"."numero" > 0)
);
--> statement-breakpoint
ALTER TABLE "blocos" ADD CONSTRAINT "blocos_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direitos" ADD CONSTRAINT "direitos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_de_interacao" ADD CONSTRAINT "eventos_de_interacao_experiencia_id_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_de_interacao" ADD CONSTRAINT "eventos_de_interacao_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_de_interacao" ADD CONSTRAINT "eventos_de_interacao_ponto_de_acesso_id_pontos_de_acesso_id_fk" FOREIGN KEY ("ponto_de_acesso_id") REFERENCES "public"."pontos_de_acesso"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_de_interacao" ADD CONSTRAINT "eventos_de_interacao_sessao_de_interacao_id_sessoes_de_interacao_id_fk" FOREIGN KEY ("sessao_de_interacao_id") REFERENCES "public"."sessoes_de_interacao"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_de_interacao" ADD CONSTRAINT "eventos_de_interacao_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiencias" ADD CONSTRAINT "experiencias_criado_por_utilizador_id_utilizadores_id_fk" FOREIGN KEY ("criado_por_utilizador_id") REFERENCES "public"."utilizadores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiencias" ADD CONSTRAINT "experiencias_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membros_do_negocio" ADD CONSTRAINT "membros_do_negocio_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membros_do_negocio" ADD CONSTRAINT "membros_do_negocio_utilizador_id_utilizadores_id_fk" FOREIGN KEY ("utilizador_id") REFERENCES "public"."utilizadores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "politicas_de_disponibilidade" ADD CONSTRAINT "politicas_de_disponibilidade_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pontos_de_acesso" ADD CONSTRAINT "pontos_de_acesso_experiencia_id_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pontos_de_acesso" ADD CONSTRAINT "pontos_de_acesso_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registos_de_auditoria" ADD CONSTRAINT "registos_de_auditoria_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registos_de_auditoria" ADD CONSTRAINT "registos_de_auditoria_utilizador_responsavel_id_utilizadores_id_fk" FOREIGN KEY ("utilizador_responsavel_id") REFERENCES "public"."utilizadores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regras" ADD CONSTRAINT "regras_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_de_interacao" ADD CONSTRAINT "sessoes_de_interacao_experiencia_id_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_de_interacao" ADD CONSTRAINT "sessoes_de_interacao_ponto_de_acesso_id_pontos_de_acesso_id_fk" FOREIGN KEY ("ponto_de_acesso_id") REFERENCES "public"."pontos_de_acesso"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_de_interacao" ADD CONSTRAINT "sessoes_de_interacao_versao_da_experiencia_id_versoes_da_experiencia_id_fk" FOREIGN KEY ("versao_da_experiencia_id") REFERENCES "public"."versoes_da_experiencia"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traducoes_da_experiencia" ADD CONSTRAINT "traducoes_da_experiencia_experiencia_id_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traducoes_do_bloco" ADD CONSTRAINT "traducoes_do_bloco_bloco_id_blocos_id_fk" FOREIGN KEY ("bloco_id") REFERENCES "public"."blocos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versoes_da_experiencia" ADD CONSTRAINT "versoes_da_experiencia_criado_por_utilizador_id_utilizadores_id_fk" FOREIGN KEY ("criado_por_utilizador_id") REFERENCES "public"."utilizadores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versoes_da_experiencia" ADD CONSTRAINT "versoes_da_experiencia_experiencia_id_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "direitos_por_negocio_e_tipo" ON "direitos" USING btree ("negocio_id","tipo","estado");--> statement-breakpoint
CREATE INDEX "eventos_de_interacao_por_experiencia" ON "eventos_de_interacao" USING btree ("experiencia_id","ocorreu_em");--> statement-breakpoint
CREATE INDEX "eventos_de_interacao_por_sessao" ON "eventos_de_interacao" USING btree ("sessao_de_interacao_id","ocorreu_em");--> statement-breakpoint
CREATE INDEX "experiencias_por_negocio_e_categoria" ON "experiencias" USING btree ("negocio_id","categoria");--> statement-breakpoint
CREATE INDEX "experiencias_publicadas" ON "experiencias" USING btree ("versao_publicada_id");--> statement-breakpoint
CREATE INDEX "membros_do_negocio_por_utilizador" ON "membros_do_negocio" USING btree ("utilizador_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pontos_de_acesso_hmac_unico" ON "pontos_de_acesso" USING btree ("hmac_do_token_publico");--> statement-breakpoint
CREATE INDEX "pontos_de_acesso_por_experiencia" ON "pontos_de_acesso" USING btree ("experiencia_id","estado");--> statement-breakpoint
CREATE INDEX "auditoria_por_negocio" ON "registos_de_auditoria" USING btree ("negocio_id","criado_em");--> statement-breakpoint
CREATE INDEX "regras_por_versao_e_gatilho" ON "regras" USING btree ("versao_da_experiencia_id","tipo_de_gatilho");--> statement-breakpoint
CREATE INDEX "sessoes_de_interacao_por_experiencia" ON "sessoes_de_interacao" USING btree ("experiencia_id","estado");--> statement-breakpoint
CREATE UNIQUE INDEX "utilizadores_email_unico" ON "utilizadores" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "utilizadores_telefone_unico" ON "utilizadores" USING btree ("telefone_e164");