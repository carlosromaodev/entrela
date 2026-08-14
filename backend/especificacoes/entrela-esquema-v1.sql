-- ENTRELA — esquema canónico v1 (PostgreSQL, nomenclatura em português)
--
-- Todos os identificadores de domínio estão em português, sem acentos para
-- compatibilidade técnica. IDs UUIDv7 são gerados pela aplicação/infraestrutura.
-- Tokens públicos, contactos e dados de pagamento nunca são guardados em claro.

CREATE TYPE codigo_de_idioma AS ENUM ('pt-AO', 'en');
CREATE TYPE estado_do_utilizador AS ENUM ('ATIVO', 'SUSPENSO', 'ELIMINADO');
CREATE TYPE tipo_de_negocio AS ENUM ('PESSOAL', 'EMPRESARIAL', 'PARCEIRO');
CREATE TYPE estado_do_negocio AS ENUM ('ATIVO', 'SUSPENSO', 'ENCERRADO');
CREATE TYPE papel_do_membro AS ENUM ('PROPRIETARIO', 'ADMINISTRADOR', 'EDITOR', 'OPERADOR', 'ANALISTA', 'FATURACAO');
CREATE TYPE estado_da_membresia AS ENUM ('CONVIDADO', 'ATIVO', 'REVOGADO');
CREATE TYPE categoria_da_experiencia AS ENUM ('EMPRESAS', 'EVENTOS', 'MOMENTOS', 'PRESENTES', 'CONVITES', 'EXPERIENCIAS');
CREATE TYPE estado_da_experiencia AS ENUM ('RASCUNHO', 'PUBLICADA', 'PAUSADA', 'ENCERRADA', 'ARQUIVADA');
CREATE TYPE modo_de_acesso AS ENUM ('PUBLICO', 'NAO_LISTADA', 'LISTA_AUTORIZADA', 'PALAVRA_PASSE', 'PASSE_OBRIGATORIO');
CREATE TYPE estado_da_versao AS ENUM ('RASCUNHO', 'VALIDADA', 'PUBLICADA', 'SUBSTITUIDA');
CREATE TYPE visibilidade_do_ficheiro AS ENUM ('PRIVADO', 'PUBLICO');
CREATE TYPE estado_de_moderacao AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');
CREATE TYPE tipo_de_participante AS ENUM ('DESTINATARIO', 'CONVIDADO', 'PARTICIPANTE', 'VISITANTE', 'LEAD', 'COLABORADOR');
CREATE TYPE tipo_de_ponto_de_acesso AS ENUM ('URL', 'QR', 'NFC', 'CODIGO_CURTO');
CREATE TYPE estado_do_ponto_de_acesso AS ENUM ('ATIVO', 'REVOGADO', 'EXPIRADO');
CREATE TYPE estado_da_sessao AS ENUM ('NOVA', 'EM_ESPERA', 'ATIVA', 'CONCLUIDA', 'NEGADA', 'EXPIRADA', 'PRE_VISUALIZACAO');
CREATE TYPE escopo_da_regra AS ENUM ('SESSAO', 'PARTICIPANTE', 'EXPERIENCIA');
CREATE TYPE estado_da_regra AS ENUM ('RASCUNHO', 'ATIVA', 'DESATIVADA');
CREATE TYPE estado_da_execucao_da_regra AS ENUM ('SUCESSO', 'FALHA', 'IGNORADA');
CREATE TYPE estado_do_convite AS ENUM ('RASCUNHO', 'ENVIADO', 'ABERTO', 'CONFIRMADO', 'RECUSADO', 'EXPIRADO');
CREATE TYPE estado_da_resposta_de_presenca AS ENUM ('PENDENTE', 'SIM', 'NAO', 'TALVEZ');
CREATE TYPE provedor_de_pagamento AS ENUM ('STRIPE', 'LOCAL_AO');
CREATE TYPE tipo_de_pedido AS ENUM ('COMPRA_DE_EXPERIENCIA', 'BILHETE', 'ETIQUETA_FISICA', 'DONATIVO', 'ASSINATURA');
CREATE TYPE estado_do_pedido AS ENUM ('RASCUNHO', 'AGUARDA_PAGAMENTO', 'PAGO', 'CANCELADO', 'REEMBOLSADO', 'FALHOU');
CREATE TYPE estado_do_pagamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHOU', 'CANCELADO', 'REEMBOLSADO');
CREATE TYPE estado_do_bilhete AS ENUM ('EMITIDO', 'CANCELADO', 'VALIDADO', 'ANULADO');
CREATE TYPE estado_do_registo_de_entrada AS ENUM ('ACEITE', 'RECUSADO', 'DUPLICADO');

-- Identidade e pertença ----------------------------------------------------

CREATE TABLE utilizadores (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    telefone_e164 varchar(32) UNIQUE,
    nome_de_apresentacao varchar(120) NOT NULL,
    idioma_preferido codigo_de_idioma NOT NULL DEFAULT 'pt-AO',
    estado estado_do_utilizador NOT NULL DEFAULT 'ATIVO',
    email_verificado_em timestamptz,
    telefone_verificado_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT utilizadores_contacto_obrigatorio CHECK (email IS NOT NULL OR telefone_e164 IS NOT NULL)
);

CREATE TABLE negocios (
    id uuid PRIMARY KEY,
    tipo tipo_de_negocio NOT NULL,
    nome_de_apresentacao varchar(160) NOT NULL,
    identificador_publico varchar(80) NOT NULL UNIQUE,
    codigo_do_pais char(2) NOT NULL,
    idioma_predefinido codigo_de_idioma NOT NULL DEFAULT 'pt-AO',
    fuso_horario varchar(64) NOT NULL DEFAULT 'Africa/Luanda',
    estado estado_do_negocio NOT NULL DEFAULT 'ATIVO',
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE membros_do_negocio (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    utilizador_id uuid NOT NULL REFERENCES utilizadores(id) ON DELETE RESTRICT,
    papel papel_do_membro NOT NULL,
    estado estado_da_membresia NOT NULL DEFAULT 'CONVIDADO',
    entrou_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (negocio_id, utilizador_id)
);

CREATE TABLE perfis_de_negocio (
    negocio_id uuid PRIMARY KEY REFERENCES negocios(id) ON DELETE RESTRICT,
    nome_legal varchar(255),
    identificacao_fiscal_cifrada bytea,
    email_de_faturacao text,
    configuracao_da_marca jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE relacoes_entre_negocios (
    id uuid PRIMARY KEY,
    negocio_fornecedor_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    negocio_cliente_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    tipo varchar(32) NOT NULL,
    estado varchar(24) NOT NULL,
    inicia_em timestamptz,
    termina_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT relacoes_entre_negocios_distintas CHECK (negocio_fornecedor_id <> negocio_cliente_id),
    CONSTRAINT relacoes_entre_negocios_datas CHECK (termina_em IS NULL OR inicia_em IS NULL OR inicia_em <= termina_em)
);

-- Experiências, versões e conteúdo ---------------------------------------

CREATE TABLE experiencias (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    criado_por_utilizador_id uuid NOT NULL REFERENCES utilizadores(id) ON DELETE RESTRICT,
    categoria categoria_da_experiencia NOT NULL,
    estado estado_da_experiencia NOT NULL DEFAULT 'RASCUNHO',
    idioma_predefinido codigo_de_idioma NOT NULL DEFAULT 'pt-AO',
    fuso_horario varchar(64) NOT NULL DEFAULT 'Africa/Luanda',
    modo_de_acesso modo_de_acesso NOT NULL DEFAULT 'NAO_LISTADA',
    versao_de_rascunho_atual_id uuid,
    versao_publicada_id uuid,
    configuracao jsonb NOT NULL DEFAULT '{}'::jsonb,
    publicada_em timestamptz,
    encerrada_em timestamptz,
    arquivada_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE versoes_da_experiencia (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    numero integer NOT NULL,
    estado estado_da_versao NOT NULL DEFAULT 'RASCUNHO',
    criado_por_utilizador_id uuid NOT NULL REFERENCES utilizadores(id) ON DELETE RESTRICT,
    soma_de_verificacao_da_definicao char(64),
    publicada_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, numero)
);

ALTER TABLE experiencias
    ADD CONSTRAINT experiencias_versao_de_rascunho_atual_fk
        FOREIGN KEY (versao_de_rascunho_atual_id) REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    ADD CONSTRAINT experiencias_versao_publicada_fk
        FOREIGN KEY (versao_publicada_id) REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT;

CREATE TABLE traducoes_da_experiencia (
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    idioma codigo_de_idioma NOT NULL,
    titulo varchar(160) NOT NULL,
    resumo text,
    metadados_de_partilha jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (experiencia_id, idioma)
);

CREATE TABLE locais (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    nome varchar(160) NOT NULL,
    endereco jsonb NOT NULL DEFAULT '{}'::jsonb,
    latitude numeric(9,6),
    longitude numeric(9,6),
    codigo_do_pais char(2),
    fuso_horario varchar(64),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT locais_coordenadas_completas CHECK (
        (latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

CREATE TABLE objetos_fisicos (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    tipo varchar(64) NOT NULL,
    rotulo varchar(160) NOT NULL,
    referencia_de_serie varchar(160),
    estado varchar(24) NOT NULL DEFAULT 'ATIVO',
    metadados jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ancoras_fisicas (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    tipo varchar(32) NOT NULL,
    local_id uuid REFERENCES locais(id) ON DELETE RESTRICT,
    objeto_fisico_id uuid REFERENCES objetos_fisicos(id) ON DELETE RESTRICT,
    rotulo varchar(160) NOT NULL,
    restricao_geografica jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE nos_da_experiencia (
    id uuid PRIMARY KEY,
    versao_da_experiencia_id uuid NOT NULL REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    chave_do_no varchar(80) NOT NULL,
    tipo varchar(40) NOT NULL,
    posicao integer NOT NULL,
    ancora_fisica_id uuid REFERENCES ancoras_fisicas(id) ON DELETE RESTRICT,
    configuracao jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (versao_da_experiencia_id, chave_do_no),
    UNIQUE (versao_da_experiencia_id, posicao)
);

CREATE TABLE blocos (
    id uuid PRIMARY KEY,
    versao_da_experiencia_id uuid NOT NULL REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    no_da_experiencia_id uuid REFERENCES nos_da_experiencia(id) ON DELETE RESTRICT,
    chave_do_bloco varchar(80) NOT NULL,
    tipo varchar(40) NOT NULL,
    posicao integer NOT NULL,
    visibilidade_inicial varchar(20) NOT NULL DEFAULT 'BLOQUEADO',
    configuracao jsonb NOT NULL DEFAULT '{}'::jsonb,
    versao_do_esquema integer NOT NULL DEFAULT 1,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (versao_da_experiencia_id, chave_do_bloco),
    UNIQUE (no_da_experiencia_id, posicao)
);

CREATE TABLE traducoes_do_bloco (
    bloco_id uuid NOT NULL REFERENCES blocos(id) ON DELETE RESTRICT,
    idioma codigo_de_idioma NOT NULL,
    conteudo jsonb NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (bloco_id, idioma)
);

CREATE TABLE ficheiros (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    chave_de_armazenamento varchar(512) NOT NULL UNIQUE,
    tipo_mime varchar(127) NOT NULL,
    tamanho_em_bytes bigint NOT NULL CHECK (tamanho_em_bytes >= 0),
    soma_de_verificacao char(64) NOT NULL,
    visibilidade visibilidade_do_ficheiro NOT NULL DEFAULT 'PRIVADO',
    estado_de_moderacao estado_de_moderacao NOT NULL DEFAULT 'PENDENTE',
    criado_por_utilizador_id uuid NOT NULL REFERENCES utilizadores(id) ON DELETE RESTRICT,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ficheiros_do_bloco (
    bloco_id uuid NOT NULL REFERENCES blocos(id) ON DELETE RESTRICT,
    ficheiro_id uuid NOT NULL REFERENCES ficheiros(id) ON DELETE RESTRICT,
    funcao varchar(32) NOT NULL,
    idioma codigo_de_idioma,
    posicao integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (bloco_id, ficheiro_id, funcao, posicao)
);

CREATE TABLE politicas_de_disponibilidade (
    versao_da_experiencia_id uuid PRIMARY KEY REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    modo varchar(24) NOT NULL,
    fuso_horario varchar(64) NOT NULL,
    abre_em timestamptz,
    expira_em timestamptz,
    apresentacao_de_espera varchar(32) NOT NULL DEFAULT 'CONTAGEM_REGRESSIVA',
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT politicas_de_disponibilidade_datas CHECK (abre_em IS NULL OR expira_em IS NULL OR abre_em <= expira_em)
);

-- Participantes, portas de entrada e sessões ------------------------------

CREATE TABLE contactos (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    nome_cifrado bytea,
    email_cifrado bytea,
    telefone_cifrado bytea,
    hmac_do_email_normalizado char(64),
    hmac_do_telefone_normalizado char(64),
    origem varchar(32) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT contactos_valor_obrigatorio CHECK (nome_cifrado IS NOT NULL OR email_cifrado IS NOT NULL OR telefone_cifrado IS NOT NULL)
);

CREATE INDEX contactos_por_email_idx ON contactos (negocio_id, hmac_do_email_normalizado);
CREATE INDEX contactos_por_telefone_idx ON contactos (negocio_id, hmac_do_telefone_normalizado);

CREATE TABLE participantes_da_experiencia (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    contacto_id uuid REFERENCES contactos(id) ON DELETE RESTRICT,
    utilizador_id uuid REFERENCES utilizadores(id) ON DELETE RESTRICT,
    tipo tipo_de_participante NOT NULL,
    estado varchar(24) NOT NULL DEFAULT 'ATIVO',
    atributos jsonb NOT NULL DEFAULT '{}'::jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consentimentos (
    id uuid PRIMARY KEY,
    contacto_id uuid REFERENCES contactos(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    finalidade varchar(40) NOT NULL,
    estado varchar(24) NOT NULL,
    versao_da_politica varchar(32) NOT NULL,
    concedido_em timestamptz,
    revogado_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT consentimentos_sujeito_obrigatorio CHECK (contacto_id IS NOT NULL OR participante_da_experiencia_id IS NOT NULL)
);

CREATE TABLE segmentos_de_publico (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    nome varchar(80) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, nome)
);

CREATE TABLE membros_do_segmento (
    segmento_de_publico_id uuid NOT NULL REFERENCES segmentos_de_publico(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid NOT NULL REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    criado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (segmento_de_publico_id, participante_da_experiencia_id)
);

CREATE TABLE concessoes_de_acesso (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    hmac_do_token char(64) NOT NULL UNIQUE,
    escopo jsonb NOT NULL DEFAULT '{}'::jsonb,
    expira_em timestamptz,
    maximo_de_usos integer CHECK (maximo_de_usos IS NULL OR maximo_de_usos > 0),
    quantidade_de_usos integer NOT NULL DEFAULT 0 CHECK (quantidade_de_usos >= 0),
    estado estado_do_ponto_de_acesso NOT NULL DEFAULT 'ATIVO',
    transferivel boolean NOT NULL DEFAULT false,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT concessoes_de_acesso_limite CHECK (maximo_de_usos IS NULL OR quantidade_de_usos <= maximo_de_usos)
);

CREATE TABLE pontos_de_acesso (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    ancora_fisica_id uuid REFERENCES ancoras_fisicas(id) ON DELETE RESTRICT,
    tipo tipo_de_ponto_de_acesso NOT NULL,
    hmac_do_token_publico char(64) NOT NULL UNIQUE,
    chave_do_no_de_destino varchar(80),
    rotulo varchar(120) NOT NULL,
    canal_de_origem varchar(64),
    estado estado_do_ponto_de_acesso NOT NULL DEFAULT 'ATIVO',
    inicia_em timestamptz,
    termina_em timestamptz,
    maximo_de_usos integer CHECK (maximo_de_usos IS NULL OR maximo_de_usos > 0),
    quantidade_de_usos integer NOT NULL DEFAULT 0 CHECK (quantidade_de_usos >= 0),
    nivel_de_verificacao varchar(16) NOT NULL DEFAULT 'PRESENCA',
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pontos_de_acesso_datas CHECK (termina_em IS NULL OR inicia_em IS NULL OR inicia_em <= termina_em),
    CONSTRAINT pontos_de_acesso_limite CHECK (maximo_de_usos IS NULL OR quantidade_de_usos <= maximo_de_usos)
);

CREATE TABLE associacoes_de_etiquetas_nfc (
    ponto_de_acesso_id uuid PRIMARY KEY REFERENCES pontos_de_acesso(id) ON DELETE RESTRICT,
    hmac_do_uid_da_etiqueta char(64),
    versao_do_token_ndef integer NOT NULL DEFAULT 1,
    estado estado_do_ponto_de_acesso NOT NULL DEFAULT 'ATIVO',
    associada_em timestamptz NOT NULL DEFAULT now(),
    revogada_em timestamptz
);

CREATE TABLE convites (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid NOT NULL REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    concessao_de_acesso_id uuid NOT NULL REFERENCES concessoes_de_acesso(id) ON DELETE RESTRICT,
    estado estado_do_convite NOT NULL DEFAULT 'RASCUNHO',
    canal varchar(24),
    enviado_em timestamptz,
    aberto_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, participante_da_experiencia_id)
);

CREATE TABLE entregas_de_convite (
    id uuid PRIMARY KEY,
    convite_id uuid NOT NULL REFERENCES convites(id) ON DELETE RESTRICT,
    canal varchar(24) NOT NULL,
    identificador_da_mensagem_no_provedor varchar(255),
    estado varchar(24) NOT NULL,
    enviado_em timestamptz,
    codigo_de_erro varchar(64),
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE respostas_de_presenca (
    id uuid PRIMARY KEY,
    convite_id uuid NOT NULL REFERENCES convites(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid NOT NULL REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    estado estado_da_resposta_de_presenca NOT NULL DEFAULT 'PENDENTE',
    quantidade_de_acompanhantes integer NOT NULL DEFAULT 0 CHECK (quantidade_de_acompanhantes >= 0),
    respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
    respondido_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (convite_id)
);

CREATE TABLE sessoes_de_interacao (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    ponto_de_acesso_id uuid REFERENCES pontos_de_acesso(id) ON DELETE RESTRICT,
    identificador_anonimo_do_visitante char(64),
    idioma codigo_de_idioma NOT NULL DEFAULT 'pt-AO',
    estado estado_da_sessao NOT NULL DEFAULT 'NOVA',
    iniciada_em timestamptz NOT NULL DEFAULT now(),
    terminada_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Regras, eventos e progresso ---------------------------------------------

CREATE TABLE regras (
    id uuid PRIMARY KEY,
    versao_da_experiencia_id uuid NOT NULL REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    chave_da_regra varchar(80) NOT NULL,
    nome varchar(160) NOT NULL,
    escopo escopo_da_regra NOT NULL,
    estado estado_da_regra NOT NULL DEFAULT 'RASCUNHO',
    prioridade integer NOT NULL DEFAULT 0,
    tipo_de_gatilho varchar(48) NOT NULL,
    condicoes jsonb NOT NULL DEFAULT '{}'::jsonb,
    acoes jsonb NOT NULL DEFAULT '[]'::jsonb,
    versao_do_esquema integer NOT NULL DEFAULT 1,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (versao_da_experiencia_id, chave_da_regra)
);

CREATE TABLE alvos_da_regra (
    id uuid PRIMARY KEY,
    regra_id uuid NOT NULL REFERENCES regras(id) ON DELETE RESTRICT,
    tipo varchar(32) NOT NULL,
    chave varchar(80) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (regra_id, tipo, chave)
);

CREATE TABLE eventos_de_interacao (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    versao_da_experiencia_id uuid NOT NULL REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    sessao_de_interacao_id uuid REFERENCES sessoes_de_interacao(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    ponto_de_acesso_id uuid REFERENCES pontos_de_acesso(id) ON DELETE RESTRICT,
    chave_do_no varchar(80),
    chave_do_bloco varchar(80),
    chave_da_regra varchar(80),
    tipo varchar(48) NOT NULL,
    ocorreu_em timestamptz NOT NULL,
    registado_em timestamptz NOT NULL DEFAULT now(),
    chave_de_idempotencia varchar(160) NOT NULL,
    origem varchar(32) NOT NULL,
    idioma codigo_de_idioma,
    pais_aproximado char(2),
    classe_do_dispositivo varchar(24),
    dados jsonb NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE (experiencia_id, chave_de_idempotencia)
);

CREATE INDEX eventos_de_interacao_por_experiencia_idx ON eventos_de_interacao (experiencia_id, ocorreu_em DESC);
CREATE INDEX eventos_de_interacao_por_sessao_idx ON eventos_de_interacao (sessao_de_interacao_id, ocorreu_em DESC);

CREATE TABLE execucoes_da_regra (
    id uuid PRIMARY KEY,
    regra_id uuid NOT NULL REFERENCES regras(id) ON DELETE RESTRICT,
    evento_de_interacao_id uuid NOT NULL REFERENCES eventos_de_interacao(id) ON DELETE RESTRICT,
    chave_do_escopo varchar(160) NOT NULL,
    estado estado_da_execucao_da_regra NOT NULL,
    resultado jsonb NOT NULL DEFAULT '{}'::jsonb,
    chave_de_idempotencia varchar(240) NOT NULL UNIQUE,
    executada_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (regra_id, evento_de_interacao_id, chave_do_escopo)
);

CREATE TABLE progresso_dos_participantes (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    sessao_de_interacao_id uuid REFERENCES sessoes_de_interacao(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    chave_do_escopo varchar(160) NOT NULL,
    chave_do_no varchar(80) NOT NULL,
    estado varchar(24) NOT NULL,
    iniciado_em timestamptz,
    concluido_em timestamptz,
    ultima_versao_da_experiencia_id uuid REFERENCES versoes_da_experiencia(id) ON DELETE RESTRICT,
    versao integer NOT NULL DEFAULT 1,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, chave_do_escopo, chave_do_no),
    CONSTRAINT progresso_dos_participantes_sujeito_obrigatorio CHECK (sessao_de_interacao_id IS NOT NULL OR participante_da_experiencia_id IS NOT NULL)
);

CREATE TABLE submissoes (
    id uuid PRIMARY KEY,
    bloco_id uuid NOT NULL REFERENCES blocos(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    sessao_de_interacao_id uuid REFERENCES sessoes_de_interacao(id) ON DELETE RESTRICT,
    dados_cifrados bytea NOT NULL,
    estado_de_moderacao estado_de_moderacao NOT NULL DEFAULT 'PENDENTE',
    submetida_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT submissoes_sujeito_obrigatorio CHECK (participante_da_experiencia_id IS NOT NULL OR sessao_de_interacao_id IS NOT NULL)
);

CREATE TABLE contribuicoes (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    bloco_id uuid NOT NULL REFERENCES blocos(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    sessao_de_interacao_id uuid REFERENCES sessoes_de_interacao(id) ON DELETE RESTRICT,
    dados_cifrados bytea NOT NULL,
    estado_de_moderacao estado_de_moderacao NOT NULL DEFAULT 'PENDENTE',
    submetida_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT contribuicoes_sujeito_obrigatorio CHECK (participante_da_experiencia_id IS NOT NULL OR sessao_de_interacao_id IS NOT NULL)
);

-- Comércio, pagamentos e direitos -----------------------------------------

CREATE TABLE contas_de_faturacao (
    negocio_id uuid PRIMARY KEY REFERENCES negocios(id) ON DELETE RESTRICT,
    nome_legal varchar(255),
    perfil_fiscal_cifrado bytea,
    email_de_faturacao text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contas_do_provedor_de_pagamento (
    id uuid PRIMARY KEY,
    negocio_id uuid REFERENCES negocios(id) ON DELETE RESTRICT,
    provedor provedor_de_pagamento NOT NULL,
    referencia_do_comerciante_cifrada bytea NOT NULL,
    codigo_do_pais char(2) NOT NULL,
    capacidades jsonb NOT NULL DEFAULT '{}'::jsonb,
    estado varchar(24) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (negocio_id, provedor)
);

CREATE TABLE pedidos (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    contacto_comprador_id uuid REFERENCES contactos(id) ON DELETE RESTRICT,
    utilizador_comprador_id uuid REFERENCES utilizadores(id) ON DELETE RESTRICT,
    experiencia_id uuid REFERENCES experiencias(id) ON DELETE RESTRICT,
    negocio_parceiro_id uuid REFERENCES negocios(id) ON DELETE RESTRICT,
    tipo tipo_de_pedido NOT NULL,
    estado estado_do_pedido NOT NULL DEFAULT 'RASCUNHO',
    moeda char(3) NOT NULL,
    subtotal_em_unidade_minima bigint NOT NULL CHECK (subtotal_em_unidade_minima >= 0),
    taxa_em_unidade_minima bigint NOT NULL DEFAULT 0 CHECK (taxa_em_unidade_minima >= 0),
    imposto_em_unidade_minima bigint NOT NULL DEFAULT 0 CHECK (imposto_em_unidade_minima >= 0),
    total_em_unidade_minima bigint NOT NULL CHECK (total_em_unidade_minima >= 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pedidos_total_confere CHECK (total_em_unidade_minima = subtotal_em_unidade_minima + taxa_em_unidade_minima + imposto_em_unidade_minima)
);

CREATE TABLE itens_do_pedido (
    id uuid PRIMARY KEY,
    pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
    tipo_da_referencia varchar(48) NOT NULL,
    referencia_id uuid,
    quantidade integer NOT NULL CHECK (quantidade > 0),
    valor_unitario_em_unidade_minima bigint NOT NULL CHECK (valor_unitario_em_unidade_minima >= 0),
    valor_total_em_unidade_minima bigint NOT NULL CHECK (valor_total_em_unidade_minima >= 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT itens_do_pedido_total_confere CHECK (valor_total_em_unidade_minima = quantidade * valor_unitario_em_unidade_minima)
);

CREATE TABLE pagamentos (
    id uuid PRIMARY KEY,
    pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
    conta_do_provedor_de_pagamento_id uuid REFERENCES contas_do_provedor_de_pagamento(id) ON DELETE RESTRICT,
    provedor provedor_de_pagamento NOT NULL,
    identificador_no_provedor varchar(255) NOT NULL,
    tipo_de_metodo varchar(64),
    estado estado_do_pagamento NOT NULL DEFAULT 'PENDENTE',
    valor_em_unidade_minima bigint NOT NULL CHECK (valor_em_unidade_minima >= 0),
    moeda char(3) NOT NULL,
    chave_de_idempotencia varchar(160) NOT NULL UNIQUE,
    iniciado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz,
    codigo_de_falha varchar(64),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provedor, identificador_no_provedor)
);

CREATE TABLE eventos_de_webhook_de_pagamento (
    id uuid PRIMARY KEY,
    provedor provedor_de_pagamento NOT NULL,
    identificador_do_evento_no_provedor varchar(255) NOT NULL,
    assinatura_valida boolean NOT NULL,
    dados_cifrados bytea NOT NULL,
    recebido_em timestamptz NOT NULL DEFAULT now(),
    processado_em timestamptz,
    erro_de_processamento varchar(255),
    UNIQUE (provedor, identificador_do_evento_no_provedor)
);

CREATE TABLE reembolsos (
    id uuid PRIMARY KEY,
    pagamento_id uuid NOT NULL REFERENCES pagamentos(id) ON DELETE RESTRICT,
    valor_em_unidade_minima bigint NOT NULL CHECK (valor_em_unidade_minima > 0),
    motivo varchar(255),
    estado varchar(24) NOT NULL,
    solicitado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz
);

CREATE TABLE direitos (
    id uuid PRIMARY KEY,
    negocio_id uuid REFERENCES negocios(id) ON DELETE RESTRICT,
    utilizador_id uuid REFERENCES utilizadores(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    pagamento_de_origem_id uuid REFERENCES pagamentos(id) ON DELETE RESTRICT,
    tipo varchar(48) NOT NULL,
    tipo_da_referencia varchar(48),
    referencia_id uuid,
    estado varchar(24) NOT NULL,
    inicia_em timestamptz NOT NULL DEFAULT now(),
    termina_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT direitos_sujeito_obrigatorio CHECK (negocio_id IS NOT NULL OR utilizador_id IS NOT NULL OR participante_da_experiencia_id IS NOT NULL),
    CONSTRAINT direitos_datas CHECK (termina_em IS NULL OR inicia_em <= termina_em)
);

-- Perfis específicos das seis categorias ----------------------------------

CREATE TABLE perfis_de_momento (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    participante_destinatario_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    permite_descarregar_recordacao boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE perfis_de_presente (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    objeto_fisico_id uuid REFERENCES objetos_fisicos(id) ON DELETE RESTRICT,
    entrega_confirmada_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registos_de_posse_do_objeto (
    id uuid PRIMARY KEY,
    objeto_fisico_id uuid NOT NULL REFERENCES objetos_fisicos(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    contacto_id uuid REFERENCES contactos(id) ON DELETE RESTRICT,
    inicia_em timestamptz NOT NULL,
    termina_em timestamptz,
    motivo_da_transferencia varchar(160),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT registos_de_posse_do_objeto_sujeito_obrigatorio CHECK (participante_da_experiencia_id IS NOT NULL OR contacto_id IS NOT NULL),
    CONSTRAINT registos_de_posse_do_objeto_datas CHECK (termina_em IS NULL OR inicia_em <= termina_em)
);

CREATE TABLE perfis_de_convite (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    prazo_de_resposta timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE perfis_de_evento (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    local_id uuid REFERENCES locais(id) ON DELETE RESTRICT,
    inicia_em timestamptz NOT NULL,
    termina_em timestamptz,
    capacidade integer CHECK (capacidade IS NULL OR capacidade > 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT perfis_de_evento_datas CHECK (termina_em IS NULL OR inicia_em <= termina_em)
);

CREATE TABLE sessoes_do_evento (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    nome varchar(160) NOT NULL,
    inicia_em timestamptz NOT NULL,
    termina_em timestamptz,
    capacidade integer CHECK (capacidade IS NULL OR capacidade > 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT sessoes_do_evento_datas CHECK (termina_em IS NULL OR inicia_em <= termina_em)
);

CREATE TABLE zonas_do_evento (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    nome varchar(100) NOT NULL,
    capacidade integer CHECK (capacidade IS NULL OR capacidade > 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, nome)
);

CREATE TABLE tipos_de_bilhete (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    nome varchar(100) NOT NULL,
    preco_em_unidade_minima bigint NOT NULL CHECK (preco_em_unidade_minima >= 0),
    moeda char(3) NOT NULL,
    capacidade integer CHECK (capacidade IS NULL OR capacidade > 0),
    estado varchar(24) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, nome)
);

CREATE TABLE bilhetes (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    tipo_de_bilhete_id uuid NOT NULL REFERENCES tipos_de_bilhete(id) ON DELETE RESTRICT,
    participante_da_experiencia_id uuid REFERENCES participantes_da_experiencia(id) ON DELETE RESTRICT,
    item_do_pedido_id uuid REFERENCES itens_do_pedido(id) ON DELETE RESTRICT,
    hmac_do_token char(64) NOT NULL UNIQUE,
    estado estado_do_bilhete NOT NULL DEFAULT 'EMITIDO',
    emitido_em timestamptz NOT NULL DEFAULT now(),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registos_de_entrada (
    id uuid PRIMARY KEY,
    bilhete_id uuid NOT NULL REFERENCES bilhetes(id) ON DELETE RESTRICT,
    zona_do_evento_id uuid REFERENCES zonas_do_evento(id) ON DELETE RESTRICT,
    operador_utilizador_id uuid REFERENCES utilizadores(id) ON DELETE RESTRICT,
    estado estado_do_registo_de_entrada NOT NULL,
    tentado_em timestamptz NOT NULL DEFAULT now(),
    chave_de_idempotencia varchar(160) NOT NULL UNIQUE
);

CREATE TABLE perfis_de_campanha (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    objetivo varchar(80) NOT NULL,
    captura_de_lead_ativa boolean NOT NULL DEFAULT false,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cupoes (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    codigo varchar(80) NOT NULL,
    estado varchar(24) NOT NULL,
    expira_em timestamptz,
    maximo_de_resgates integer CHECK (maximo_de_resgates IS NULL OR maximo_de_resgates > 0),
    quantidade_de_resgates integer NOT NULL DEFAULT 0 CHECK (quantidade_de_resgates >= 0),
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, codigo),
    CONSTRAINT cupoes_limite_de_resgates CHECK (maximo_de_resgates IS NULL OR quantidade_de_resgates <= maximo_de_resgates)
);

CREATE TABLE perfis_de_percurso (
    experiencia_id uuid PRIMARY KEY REFERENCES experiencias(id) ON DELETE RESTRICT,
    modo varchar(24) NOT NULL DEFAULT 'INDIVIDUAL',
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE paragens_do_percurso (
    id uuid PRIMARY KEY,
    experiencia_id uuid NOT NULL REFERENCES experiencias(id) ON DELETE RESTRICT,
    local_id uuid REFERENCES locais(id) ON DELETE RESTRICT,
    ancora_fisica_id uuid REFERENCES ancoras_fisicas(id) ON DELETE RESTRICT,
    chave_do_no varchar(80) NOT NULL,
    posicao integer NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (experiencia_id, chave_do_no),
    UNIQUE (experiencia_id, posicao)
);

-- Auditoria e índices ------------------------------------------------------

CREATE TABLE registos_de_auditoria (
    id uuid PRIMARY KEY,
    negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
    utilizador_responsavel_id uuid REFERENCES utilizadores(id) ON DELETE RESTRICT,
    acao varchar(80) NOT NULL,
    tipo_do_alvo varchar(48) NOT NULL,
    alvo_id uuid,
    antes_com_dados_ocultos jsonb,
    depois_com_dados_ocultos jsonb,
    hmac_do_ip char(64),
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX experiencias_por_negocio_e_categoria_idx ON experiencias (negocio_id, categoria);
CREATE INDEX experiencias_publicadas_idx ON experiencias (versao_publicada_id) WHERE estado = 'PUBLICADA';
CREATE INDEX pontos_de_acesso_por_experiencia_idx ON pontos_de_acesso (experiencia_id, estado);
CREATE INDEX sessoes_de_interacao_por_experiencia_idx ON sessoes_de_interacao (experiencia_id, estado);
CREATE INDEX regras_por_versao_e_gatilho_idx ON regras (versao_da_experiencia_id, tipo_de_gatilho) WHERE estado = 'ATIVA';
CREATE INDEX pedidos_por_negocio_e_estado_idx ON pedidos (negocio_id, estado);
CREATE INDEX pagamentos_por_pedido_e_estado_idx ON pagamentos (pedido_id, estado);

-- Invariantes a validar no serviço, RLS ou trigger de migração:
-- 1. Filhos e experiência pertencem ao mesmo negocio_id.
-- 2. Versões apontadas por experiencias pertencem à própria experiência.
-- 3. O perfil específico corresponde a experiencias.categoria.
-- 4. Uma versão PUBLICADA é imutável.
-- 5. Regras só referenciam blocos/nós da própria versão.
-- 6. Períodos de posse do mesmo objeto não se sobrepõem.
-- 7. Cada negócio mantém pelo menos um membro PROPRIETARIO ATIVO.
