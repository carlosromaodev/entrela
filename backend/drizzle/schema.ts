import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  bigint,
  bigserial,
  char,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const codigoDeIdioma = pgEnum('codigo_de_idioma', ['pt-AO', 'en'])
export const estadoDoUtilizador = pgEnum('estado_do_utilizador', [
  'ATIVO',
  'SUSPENSO',
  'ELIMINADO',
])
export const tipoDeNegocio = pgEnum('tipo_de_negocio', [
  'PESSOAL',
  'EMPRESARIAL',
  'PARCEIRO',
])
export const estadoDoNegocio = pgEnum('estado_do_negocio', [
  'ATIVO',
  'SUSPENSO',
  'ENCERRADO',
])
export const papelDoMembro = pgEnum('papel_do_membro', [
  'PROPRIETARIO',
  'ADMINISTRADOR',
  'EDITOR',
  'OPERADOR',
  'ANALISTA',
  'FATURACAO',
])
export const estadoDaMembresia = pgEnum('estado_da_membresia', [
  'CONVIDADO',
  'ATIVO',
  'REVOGADO',
])
export const categoriaDaExperiencia = pgEnum('categoria_da_experiencia', [
  'EMPRESAS',
  'EVENTOS',
  'MOMENTOS',
  'PRESENTES',
  'CONVITES',
  'EXPERIENCIAS',
])
export const estadoDaExperiencia = pgEnum('estado_da_experiencia', [
  'RASCUNHO',
  'PUBLICADA',
  'PAUSADA',
  'ARQUIVADA',
])
export const estadoDaVersao = pgEnum('estado_da_versao', [
  'RASCUNHO',
  'VALIDADA',
  'PUBLICADA',
  'SUBSTITUIDA',
])
export const tipoDePontoDeAcesso = pgEnum('tipo_de_ponto_de_acesso', [
  'URL',
  'QR',
  'NFC',
  'CODIGO_CURTO',
])
export const estadoDoPontoDeAcesso = pgEnum('estado_do_ponto_de_acesso', [
  'ATIVO',
  'REVOGADO',
  'EXPIRADO',
])
export const estadoDaSessao = pgEnum('estado_da_sessao', [
  'NOVA',
  'EM_ESPERA',
  'ATIVA',
  'CONCLUIDA',
  'NEGADA',
  'EXPIRADA',
  'PRE_VISUALIZACAO',
])
export const estadoDaRegra = pgEnum('estado_da_regra', [
  'RASCUNHO',
  'ATIVA',
  'DESATIVADA',
])

const instanteDeCriacao = () =>
  timestamp('criado_em', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull()
const instanteDeAtualizacao = () =>
  timestamp('atualizado_em', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull()

export const utilizadores = pgTable(
  'utilizadores',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    email: text('email'),
    estado: estadoDoUtilizador('estado').default('ATIVO').notNull(),
    id: uuid('id').primaryKey(),
    idiomaPreferido: codigoDeIdioma('idioma_preferido')
      .default('pt-AO')
      .notNull(),
    nomeDeApresentacao: varchar('nome_de_apresentacao', { length: 120 }).notNull(),
    telefoneE164: varchar('telefone_e164', { length: 32 }),
  },
  (tabela) => [
    uniqueIndex('utilizadores_email_unico').on(tabela.email),
    uniqueIndex('utilizadores_telefone_unico').on(tabela.telefoneE164),
    check(
      'utilizadores_contacto_obrigatorio',
      sql`${tabela.email} IS NOT NULL OR ${tabela.telefoneE164} IS NOT NULL`,
    ),
  ],
)

export const negocios = pgTable('negocios', {
  atualizadoEm: instanteDeAtualizacao(),
  codigoDoPais: char('codigo_do_pais', { length: 2 }).notNull(),
  criadoEm: instanteDeCriacao(),
  estado: estadoDoNegocio('estado').default('ATIVO').notNull(),
  fusoHorario: varchar('fuso_horario', { length: 64 })
    .default('Africa/Luanda')
    .notNull(),
  id: uuid('id').primaryKey(),
  identificadorPublico: varchar('identificador_publico', { length: 80 })
    .notNull()
    .unique(),
  idiomaPredefinido: codigoDeIdioma('idioma_predefinido')
    .default('pt-AO')
    .notNull(),
  nomeDeApresentacao: varchar('nome_de_apresentacao', { length: 160 }).notNull(),
  tipo: tipoDeNegocio('tipo').notNull(),
})

export const membrosDoNegocio = pgTable(
  'membros_do_negocio',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    estado: estadoDaMembresia('estado').default('CONVIDADO').notNull(),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    papel: papelDoMembro('papel').notNull(),
    utilizadorId: uuid('utilizador_id')
      .notNull()
      .references(() => utilizadores.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    unique('membros_do_negocio_negocio_utilizador_unico').on(
      tabela.negocioId,
      tabela.utilizadorId,
    ),
    index('membros_do_negocio_por_utilizador').on(tabela.utilizadorId),
  ],
)

export const desafiosDeAutenticacao = pgTable(
  'desafios_de_autenticacao',
  {
    consumidoEm: timestamp('consumido_em', { mode: 'date', withTimezone: true }),
    criadoEm: instanteDeCriacao(),
    emailNormalizado: text('email_normalizado').notNull(),
    expiraEm: timestamp('expira_em', { mode: 'date', withTimezone: true }).notNull(),
    hmacToken: char('hmac_token', { length: 64 }).notNull(),
    id: uuid('id').primaryKey(),
  },
  (tabela) => [
    uniqueIndex('desafios_de_autenticacao_hmac_unico').on(tabela.hmacToken),
    index('desafios_de_autenticacao_por_email').on(
      tabela.emailNormalizado,
      tabela.criadoEm,
    ),
    index('desafios_de_autenticacao_por_expiracao').on(tabela.expiraEm),
  ],
)

export const contasPessoais = pgTable('contas_pessoais', {
  criadoEm: instanteDeCriacao(),
  negocioId: uuid('negocio_id')
    .notNull()
    .unique()
    .references(() => negocios.id, { onDelete: 'restrict' }),
  utilizadorId: uuid('utilizador_id')
    .primaryKey()
    .references(() => utilizadores.id, { onDelete: 'restrict' }),
})

export const sessoesDoCriador = pgTable(
  'sessoes_do_criador',
  {
    criadoEm: instanteDeCriacao(),
    expiraEm: timestamp('expira_em', { mode: 'date', withTimezone: true }).notNull(),
    hmacCsrf: char('hmac_csrf', { length: 64 }).notNull(),
    hmacToken: char('hmac_token', { length: 64 }).notNull(),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    revogadaEm: timestamp('revogada_em', { mode: 'date', withTimezone: true }),
    substituidaPorId: uuid('substituida_por_id').references(
      (): AnyPgColumn => sessoesDoCriador.id,
      { onDelete: 'restrict' },
    ),
    utilizadorId: uuid('utilizador_id')
      .notNull()
      .references(() => utilizadores.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    uniqueIndex('sessoes_do_criador_hmac_unico').on(tabela.hmacToken),
    index('sessoes_do_criador_por_utilizador').on(
      tabela.utilizadorId,
      tabela.expiraEm,
    ),
  ],
)

export const convitesDeMembro = pgTable(
  'convites_de_membro',
  {
    aceiteEm: timestamp('aceite_em', { mode: 'date', withTimezone: true }),
    criadoEm: instanteDeCriacao(),
    emailNormalizado: text('email_normalizado').notNull(),
    estado: varchar('estado', { length: 16 }).default('PENDENTE').notNull(),
    expiraEm: timestamp('expira_em', { mode: 'date', withTimezone: true }).notNull(),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    papel: papelDoMembro('papel').notNull(),
    revogadoEm: timestamp('revogado_em', { mode: 'date', withTimezone: true }),
  },
  (tabela) => [
    check(
      'convites_de_membro_estado_valido',
      sql`${tabela.estado} IN ('PENDENTE', 'ACEITE', 'REVOGADO', 'EXPIRADO')`,
    ),
    check('convites_de_membro_sem_proprietario', sql`${tabela.papel} <> 'PROPRIETARIO'`),
    uniqueIndex('convites_de_membro_pendente_unico')
      .on(tabela.negocioId, tabela.emailNormalizado)
      .where(sql`${tabela.estado} = 'PENDENTE'`),
  ],
)

export const relacoesEntreNegocios = pgTable(
  'relacoes_entre_negocios',
  {
    beneficiarioId: uuid('beneficiario_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    concedenteId: uuid('concedente_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    criadoEm: instanteDeCriacao(),
    estado: varchar('estado', { length: 12 }).default('ATIVA').notNull(),
    id: uuid('id').primaryKey(),
    revogadaEm: timestamp('revogada_em', { mode: 'date', withTimezone: true }),
    tipo: varchar('tipo', { length: 32 }).notNull(),
  },
  (tabela) => [
    check(
      'relacoes_entre_negocios_distintas',
      sql`${tabela.concedenteId} <> ${tabela.beneficiarioId}`,
    ),
    check(
      'relacoes_entre_negocios_tipo_valido',
      sql`${tabela.tipo} IN ('AGENCIA_CLIENTE', 'PARCEIRO_CLIENTE')`,
    ),
    check(
      'relacoes_entre_negocios_estado_valido',
      sql`${tabela.estado} IN ('ATIVA', 'REVOGADA')`,
    ),
    uniqueIndex('relacoes_entre_negocios_ativa_unica')
      .on(tabela.concedenteId, tabela.beneficiarioId, tabela.tipo)
      .where(sql`${tabela.estado} = 'ATIVA'`),
  ],
)

export const experiencias = pgTable(
  'experiencias',
  {
    arquivadaEm: timestamp('arquivada_em', { mode: 'date', withTimezone: true }),
    atualizadoEm: instanteDeAtualizacao(),
    categoria: categoriaDaExperiencia('categoria').notNull(),
    configuracao: jsonb('configuracao')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    criadoEm: instanteDeCriacao(),
    criadoPorUtilizadorId: uuid('criado_por_utilizador_id')
      .notNull()
      .references(() => utilizadores.id, { onDelete: 'restrict' }),
    estado: estadoDaExperiencia('estado').default('RASCUNHO').notNull(),
    fusoHorario: varchar('fuso_horario', { length: 64 })
      .default('Africa/Luanda')
      .notNull(),
    id: uuid('id').primaryKey(),
    idiomaPredefinido: codigoDeIdioma('idioma_predefinido')
      .default('pt-AO')
      .notNull(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    publicadaEm: timestamp('publicada_em', { mode: 'date', withTimezone: true }),
    versaoDeRascunhoAtualId: uuid('versao_de_rascunho_atual_id').references(
      (): AnyPgColumn => versoesDaExperiencia.id,
      { onDelete: 'restrict' },
    ),
    versaoPublicadaId: uuid('versao_publicada_id').references(
      (): AnyPgColumn => versoesDaExperiencia.id,
      { onDelete: 'restrict' },
    ),
  },
  (tabela) => [
    index('experiencias_por_negocio_e_categoria').on(
      tabela.negocioId,
      tabela.categoria,
    ),
    index('experiencias_publicadas').on(tabela.versaoPublicadaId),
  ],
)

export const versoesDaExperiencia = pgTable(
  'versoes_da_experiencia',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    criadoPorUtilizadorId: uuid('criado_por_utilizador_id')
      .notNull()
      .references(() => utilizadores.id, { onDelete: 'restrict' }),
    estado: estadoDaVersao('estado').default('RASCUNHO').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references((): AnyPgColumn => experiencias.id, {
        onDelete: 'restrict',
      }),
    id: uuid('id').primaryKey(),
    numero: integer('numero').notNull(),
    publicadaEm: timestamp('publicada_em', { mode: 'date', withTimezone: true }),
    somaDeVerificacao: char('soma_de_verificacao_da_definicao', { length: 64 }),
  },
  (tabela) => [
    unique('versoes_da_experiencia_numero_unico').on(
      tabela.experienciaId,
      tabela.numero,
    ),
    check('versoes_da_experiencia_numero_positivo', sql`${tabela.numero} > 0`),
  ],
)

export const relacoesEntreExperiencias = pgTable(
  'relacoes_entre_experiencias',
  {
    criadoEm: instanteDeCriacao(),
    experienciaDestinoId: uuid('experiencia_destino_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    experienciaOrigemId: uuid('experiencia_origem_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    revogadaEm: timestamp('revogada_em', { mode: 'date', withTimezone: true }),
    tipo: varchar('tipo', { length: 24 }).notNull(),
  },
  (tabela) => [
    check(
      'relacoes_entre_experiencias_distintas',
      sql`${tabela.experienciaOrigemId} <> ${tabela.experienciaDestinoId}`,
    ),
    check(
      'relacoes_entre_experiencias_tipo_valido',
      sql`${tabela.tipo} IN ('ORIGINA', 'COMPLEMENTA', 'CONTINUA', 'SUBSTITUI')`,
    ),
    unique(
      'relacoes_entre_experiencias_origem_destino_tipo_unico',
    ).on(
      tabela.experienciaOrigemId,
      tabela.experienciaDestinoId,
      tabela.tipo,
    ),
    index('relacoes_entre_experiencias_por_negocio').on(tabela.negocioId),
  ],
)

export const traducoesDaExperiencia = pgTable(
  'traducoes_da_experiencia',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    idioma: codigoDeIdioma('idioma').notNull(),
    metadadosDePartilha: jsonb('metadados_de_partilha')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    resumo: text('resumo'),
    titulo: varchar('titulo', { length: 160 }).notNull(),
  },
  (tabela) => [primaryKey({ columns: [tabela.experienciaId, tabela.idioma] })],
)

export const blocos = pgTable(
  'blocos',
  {
    atualizadoEm: instanteDeAtualizacao(),
    chaveDoBloco: varchar('chave_do_bloco', { length: 80 }).notNull(),
    configuracao: jsonb('configuracao')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    criadoEm: instanteDeCriacao(),
    id: uuid('id').primaryKey(),
    posicao: integer('posicao').notNull(),
    tipo: varchar('tipo', { length: 40 }).notNull(),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
    versaoDoEsquema: integer('versao_do_esquema').default(1).notNull(),
    visibilidadeInicial: varchar('visibilidade_inicial', { length: 20 })
      .default('BLOQUEADO')
      .notNull(),
  },
  (tabela) => [
    unique('blocos_chave_unica_na_versao').on(
      tabela.versaoDaExperienciaId,
      tabela.chaveDoBloco,
    ),
    unique('blocos_posicao_unica_na_versao').on(
      tabela.versaoDaExperienciaId,
      tabela.posicao,
    ),
    check('blocos_posicao_positiva', sql`${tabela.posicao} > 0`),
  ],
)

export const traducoesDoBloco = pgTable(
  'traducoes_do_bloco',
  {
    atualizadoEm: instanteDeAtualizacao(),
    blocoId: uuid('bloco_id')
      .notNull()
      .references(() => blocos.id, { onDelete: 'restrict' }),
    conteudo: jsonb('conteudo').$type<Record<string, unknown>>().notNull(),
    criadoEm: instanteDeCriacao(),
    idioma: codigoDeIdioma('idioma').notNull(),
  },
  (tabela) => [primaryKey({ columns: [tabela.blocoId, tabela.idioma] })],
)

export const ficheiros = pgTable(
  'ficheiros',
  {
    altura: integer('altura'),
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    criadoPorUtilizadorId: uuid('criado_por_utilizador_id')
      .notNull()
      .references(() => utilizadores.id, { onDelete: 'restrict' }),
    duracaoEmMilissegundos: bigint('duracao_em_milissegundos', {
      mode: 'number',
    }),
    estado: varchar('estado', { length: 16 }).default('PENDENTE').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    id: uuid('id').primaryKey(),
    largura: integer('largura'),
    mimeDeclarado: varchar('mime_declarado', { length: 100 }).notNull(),
    mimeDetetado: varchar('mime_detetado', { length: 100 }),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    objectoOriginal: text('objecto_original').notNull(),
    objectoSeguro: text('objecto_seguro'),
    problemaTecnico: varchar('problema_tecnico', { length: 80 }),
    somaSha256: char('soma_sha256', { length: 64 }),
    tamanhoDeclarado: bigint('tamanho_declarado', { mode: 'number' }).notNull(),
    tamanhoVerificado: bigint('tamanho_verificado', { mode: 'number' }),
    tipo: varchar('tipo', { length: 16 }).notNull(),
  },
  (tabela) => [
    check(
      'ficheiros_tipo_valido',
      sql`${tabela.tipo} IN ('AUDIO', 'IMAGEM', 'VIDEO')`,
    ),
    check(
      'ficheiros_estado_valido',
      sql`${tabela.estado} IN ('PENDENTE', 'PROCESSANDO', 'PRONTO', 'FALHOU')`,
    ),
    check('ficheiros_tamanho_positivo', sql`${tabela.tamanhoDeclarado} > 0`),
    unique('ficheiros_objecto_original_unico').on(
      tabela.negocioId,
      tabela.objectoOriginal,
    ),
    index('ficheiros_por_experiencia_e_estado').on(
      tabela.negocioId,
      tabela.experienciaId,
      tabela.estado,
    ),
  ],
)

export const ficheirosDoBloco = pgTable(
  'ficheiros_do_bloco',
  {
    blocoId: uuid('bloco_id')
      .notNull()
      .references(() => blocos.id, { onDelete: 'restrict' }),
    ficheiroId: uuid('ficheiro_id')
      .notNull()
      .references(() => ficheiros.id, { onDelete: 'restrict' }),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    primaryKey({ columns: [tabela.blocoId, tabela.ficheiroId] }),
    index('ficheiros_do_bloco_por_negocio').on(tabela.negocioId),
  ],
)

export const trabalhosDeMedia = pgTable(
  'trabalhos_de_media',
  {
    criadoEm: instanteDeCriacao(),
    donoDoLease: varchar('dono_do_lease', { length: 128 }),
    estado: varchar('estado', { length: 16 }).default('PENDENTE').notNull(),
    ficheiroId: uuid('ficheiro_id')
      .notNull()
      .references(() => ficheiros.id, { onDelete: 'restrict' }),
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    leaseExpiraEm: timestamp('lease_expira_em', {
      mode: 'date',
      withTimezone: true,
    }),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    tipo: varchar('tipo', { length: 40 }).notNull(),
  },
  (tabela) => [
    unique('trabalhos_de_media_ficheiro_tipo_unico').on(
      tabela.ficheiroId,
      tabela.tipo,
    ),
    index('trabalhos_de_media_pendentes').on(
      tabela.negocioId,
      tabela.estado,
      tabela.criadoEm,
    ),
  ],
)

export const politicasDeDisponibilidade = pgTable(
  'politicas_de_disponibilidade',
  {
    abreEm: timestamp('abre_em', { mode: 'date', withTimezone: true }),
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    expiraEm: timestamp('expira_em', { mode: 'date', withTimezone: true }),
    fusoHorario: varchar('fuso_horario', { length: 64 }).notNull(),
    modo: varchar('modo', { length: 24 }).notNull(),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .primaryKey()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    check(
      'politicas_de_disponibilidade_datas',
      sql`${tabela.abreEm} IS NULL OR ${tabela.expiraEm} IS NULL OR ${tabela.abreEm} <= ${tabela.expiraEm}`,
    ),
  ],
)

export const pontosDeAcesso = pgTable(
  'pontos_de_acesso',
  {
    atualizadoEm: instanteDeAtualizacao(),
    canalDeOrigem: varchar('canal_de_origem', { length: 64 }),
    criadoEm: instanteDeCriacao(),
    estado: estadoDoPontoDeAcesso('estado').default('ATIVO').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    hmacDoTokenPublico: char('hmac_do_token_publico', { length: 64 }).notNull(),
    id: uuid('id').primaryKey(),
    iniciaEm: timestamp('inicia_em', { mode: 'date', withTimezone: true }),
    maximoDeUsos: integer('maximo_de_usos'),
    quantidadeDeUsos: integer('quantidade_de_usos').default(0).notNull(),
    terminaEm: timestamp('termina_em', { mode: 'date', withTimezone: true }),
    tipo: tipoDePontoDeAcesso('tipo').notNull(),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    uniqueIndex('pontos_de_acesso_hmac_unico').on(tabela.hmacDoTokenPublico),
    index('pontos_de_acesso_por_experiencia').on(
      tabela.experienciaId,
      tabela.estado,
    ),
    check(
      'pontos_de_acesso_limite_positivo',
      sql`${tabela.maximoDeUsos} IS NULL OR ${tabela.maximoDeUsos} > 0`,
    ),
    check(
      'pontos_de_acesso_quantidade_valida',
      sql`${tabela.quantidadeDeUsos} >= 0 AND (${tabela.maximoDeUsos} IS NULL OR ${tabela.quantidadeDeUsos} <= ${tabela.maximoDeUsos})`,
    ),
  ],
)

export const sessoesDeInteracao = pgTable(
  'sessoes_de_interacao',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    estado: estadoDaSessao('estado').default('NOVA').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    hmacDoIdentificadorAnonimo: char('hmac_do_identificador_anonimo', {
      length: 64,
    }),
    id: uuid('id').primaryKey(),
    idioma: codigoDeIdioma('idioma').default('pt-AO').notNull(),
    iniciadaEm: timestamp('iniciada_em', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    pontoDeAcessoId: uuid('ponto_de_acesso_id').references(
      () => pontosDeAcesso.id,
      { onDelete: 'restrict' },
    ),
    terminadaEm: timestamp('terminada_em', { mode: 'date', withTimezone: true }),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    index('sessoes_de_interacao_por_experiencia').on(
      tabela.experienciaId,
      tabela.estado,
    ),
    uniqueIndex('sessoes_de_interacao_ponto_anonimo_unico').on(
      tabela.pontoDeAcessoId,
      tabela.hmacDoIdentificadorAnonimo,
    ),
  ],
)

export const progressosDaSessao = pgTable(
  'progressos_da_sessao',
  {
    atualizadoEm: instanteDeAtualizacao(),
    posicaoAtual: integer('posicao_atual').notNull(),
    sessaoId: uuid('sessao_id')
      .primaryKey()
      .references(() => sessoesDeInteracao.id, { onDelete: 'restrict' }),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    check('progressos_da_sessao_posicao_positiva', sql`${tabela.posicaoAtual} > 0`),
    index('progressos_da_sessao_por_versao').on(
      tabela.versaoDaExperienciaId,
    ),
  ],
)

export const regras = pgTable(
  'regras',
  {
    acoes: jsonb('acoes').$type<readonly unknown[]>().default([]).notNull(),
    atualizadoEm: instanteDeAtualizacao(),
    chaveDaRegra: varchar('chave_da_regra', { length: 80 }).notNull(),
    condicoes: jsonb('condicoes')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    criadoEm: instanteDeCriacao(),
    estado: estadoDaRegra('estado').default('RASCUNHO').notNull(),
    id: uuid('id').primaryKey(),
    prioridade: integer('prioridade').default(0).notNull(),
    tipoDeGatilho: varchar('tipo_de_gatilho', { length: 48 }).notNull(),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
    versaoDoEsquema: integer('versao_do_esquema').default(1).notNull(),
  },
  (tabela) => [
    unique('regras_chave_unica_na_versao').on(
      tabela.versaoDaExperienciaId,
      tabela.chaveDaRegra,
    ),
    index('regras_por_versao_e_gatilho').on(
      tabela.versaoDaExperienciaId,
      tabela.tipoDeGatilho,
    ),
  ],
)

export const eventosDeInteracao = pgTable(
  'eventos_de_interacao',
  {
    chaveDeIdempotencia: varchar('chave_de_idempotencia', { length: 160 }).notNull(),
    chaveDoBloco: varchar('chave_do_bloco', { length: 80 }),
    criadoEm: instanteDeCriacao(),
    dados: jsonb('dados').$type<Record<string, unknown>>().default({}).notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    ocorreuEm: timestamp('ocorreu_em', { mode: 'date', withTimezone: true }).notNull(),
    origem: varchar('origem', { length: 32 }).notNull(),
    pontoDeAcessoId: uuid('ponto_de_acesso_id').references(
      () => pontosDeAcesso.id,
      { onDelete: 'restrict' },
    ),
    sessaoDeInteracaoId: uuid('sessao_de_interacao_id').references(
      () => sessoesDeInteracao.id,
      { onDelete: 'restrict' },
    ),
    tipo: varchar('tipo', { length: 48 }).notNull(),
    versaoDaExperienciaId: uuid('versao_da_experiencia_id')
      .notNull()
      .references(() => versoesDaExperiencia.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    unique('eventos_de_interacao_idempotencia_unica').on(
      tabela.experienciaId,
      tabela.chaveDeIdempotencia,
    ),
    index('eventos_de_interacao_por_experiencia').on(
      tabela.experienciaId,
      tabela.ocorreuEm,
    ),
    index('eventos_de_interacao_por_sessao').on(
      tabela.sessaoDeInteracaoId,
      tabela.ocorreuEm,
    ),
  ],
)

export const direitos = pgTable(
  'direitos',
  {
    criadoEm: instanteDeCriacao(),
    estado: varchar('estado', { length: 24 }).notNull(),
    id: uuid('id').primaryKey(),
    iniciaEm: timestamp('inicia_em', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    negocioId: uuid('negocio_id').references(() => negocios.id, {
      onDelete: 'restrict',
    }),
    referenciaId: uuid('referencia_id'),
    terminaEm: timestamp('termina_em', { mode: 'date', withTimezone: true }),
    tipo: varchar('tipo', { length: 48 }).notNull(),
  },
  (tabela) => [
    check('direitos_sujeito_obrigatorio', sql`${tabela.negocioId} IS NOT NULL`),
    check(
      'direitos_datas',
      sql`${tabela.terminaEm} IS NULL OR ${tabela.iniciaEm} <= ${tabela.terminaEm}`,
    ),
    index('direitos_por_negocio_e_tipo').on(
      tabela.negocioId,
      tabela.tipo,
      tabela.estado,
    ),
  ],
)

export const consentimentos = pgTable(
  'consentimentos',
  {
    concedidoEm: timestamp('concedido_em', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    contactoId: uuid('contacto_id').notNull(),
    finalidade: varchar('finalidade', { length: 48 }).notNull(),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    revogadoEm: timestamp('revogado_em', { mode: 'date', withTimezone: true }),
    versao: varchar('versao', { length: 40 }).notNull(),
  },
  (tabela) => [
    uniqueIndex('consentimentos_ativo_unico')
      .on(tabela.negocioId, tabela.contactoId, tabela.finalidade)
      .where(sql`${tabela.revogadoEm} IS NULL`),
  ],
)

export const respostasPessoais = pgTable(
  'respostas_pessoais',
  {
    chave: varchar('chave', { length: 80 }).notNull(),
    classificacao: varchar('classificacao', { length: 32 }).notNull(),
    contactoId: uuid('contacto_id').notNull(),
    finalidade: varchar('finalidade', { length: 48 }).notNull(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    papeisPermitidos: varchar('papeis_permitidos', { length: 32 })
      .array()
      .notNull(),
    reterAte: timestamp('reter_ate', { mode: 'date', withTimezone: true }).notNull(),
    valorProtegido: text('valor_protegido').notNull(),
  },
  (tabela) => [
    primaryKey({ columns: [tabela.negocioId, tabela.contactoId, tabela.chave] }),
    index('respostas_pessoais_por_retencao').on(
      tabela.negocioId,
      tabela.reterAte,
    ),
  ],
)

export const supressoes = pgTable(
  'supressoes',
  {
    contactoId: uuid('contacto_id').notNull(),
    criadoEm: instanteDeCriacao(),
    finalidade: varchar('finalidade', { length: 48 }).notNull(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    primaryKey({
      columns: [tabela.negocioId, tabela.contactoId, tabela.finalidade],
    }),
  ],
)

export const mensagensOutbox = pgTable(
  'mensagens_outbox',
  {
    contactoId: uuid('contacto_id').notNull(),
    criadoEm: instanteDeCriacao(),
    estado: varchar('estado', { length: 16 }).default('PENDENTE').notNull(),
    finalidade: varchar('finalidade', { length: 48 }).notNull(),
    id: uuid('id').primaryKey(),
    leaseExpiraEm: timestamp('lease_expira_em', {
      mode: 'date',
      withTimezone: true,
    }),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    payloadProtegido: text('payload_protegido').notNull(),
    tentativas: integer('tentativas').default(0).notNull(),
    tentarEm: timestamp('tentar_em', { mode: 'date', withTimezone: true }),
    trabalhador: varchar('trabalhador', { length: 128 }),
  },
  (tabela) => [
    check('mensagens_outbox_tentativas_validas', sql`${tabela.tentativas} >= 0`),
    index('mensagens_outbox_pendentes').on(
      tabela.negocioId,
      tabela.estado,
      tabela.tentarEm,
      tabela.criadoEm,
    ),
  ],
)

export const contribuicoes = pgTable(
  'contribuicoes',
  {
    conteudoProtegido: text('conteudo_protegido'),
    criadoEm: instanteDeCriacao(),
    estado: varchar('estado', { length: 16 }).default('ATIVA').notNull(),
    id: uuid('id').primaryKey(),
    motivo: text('motivo'),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    removidaEm: timestamp('removida_em', { mode: 'date', withTimezone: true }),
    removidaPor: uuid('removida_por').references(() => utilizadores.id, {
      onDelete: 'restrict',
    }),
  },
  (tabela) => [index('contribuicoes_por_negocio_e_estado').on(tabela.negocioId, tabela.estado)],
)

export const conclusoesDeDestinatarios = pgTable(
  'conclusoes_de_destinatarios',
  {
    concluidaEm: timestamp('concluida_em', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    destinatarioId: uuid('destinatario_id').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    primaryKey({
      columns: [tabela.negocioId, tabela.experienciaId, tabela.destinatarioId],
    }),
  ],
)

export const pedidosDeRecordacao = pgTable(
  'pedidos_de_recordacao',
  {
    atualizadoEm: instanteDeAtualizacao(),
    criadoEm: instanteDeCriacao(),
    estado: varchar('estado', { length: 20 }).default('PENDENTE').notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    formato: varchar('formato', { length: 12 }).notNull(),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    objecto: text('objecto'),
    requerenteId: uuid('requerente_id').notNull(),
    tentativas: integer('tentativas').default(0).notNull(),
    tipoDoRequerente: varchar('tipo_do_requerente', { length: 16 }).notNull(),
  },
  (tabela) => [
    unique('pedidos_de_recordacao_idempotencia_unica').on(
      tabela.negocioId,
      tabela.experienciaId,
      tabela.requerenteId,
      tabela.tipoDoRequerente,
      tabela.formato,
    ),
    index('pedidos_de_recordacao_pendentes').on(
      tabela.negocioId,
      tabela.estado,
      tabela.criadoEm,
    ),
  ],
)

export const politicasDeRetencao = pgTable(
  'politicas_de_retencao',
  {
    avisosEnviados: integer('avisos_enviados').default(0).notNull(),
    eliminadaEm: timestamp('eliminada_em', { mode: 'date', withTimezone: true }),
    estado: varchar('estado', { length: 16 }).notNull(),
    experienciaId: uuid('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    exportacao: varchar('exportacao', { length: 16 }).default('NAO_PEDIDA').notNull(),
    instanteBase: timestamp('instante_base', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
  },
  (tabela) => [
    primaryKey({ columns: [tabela.negocioId, tabela.experienciaId] }),
    check(
      'politicas_de_retencao_avisos_validos',
      sql`${tabela.avisosEnviados} BETWEEN 0 AND 2`,
    ),
    check(
      'politicas_de_retencao_exportacao_antes_de_eliminar',
      sql`${tabela.eliminadaEm} IS NULL OR ${tabela.exportacao} = 'PRONTA'`,
    ),
    index('politicas_de_retencao_por_vencimento').on(
      tabela.negocioId,
      tabela.estado,
      tabela.instanteBase,
    ),
  ],
)

export const registosDeAuditoria = pgTable(
  'registos_de_auditoria',
  {
    acao: varchar('acao', { length: 80 }).notNull(),
    alvoId: uuid('alvo_id'),
    criadoEm: instanteDeCriacao(),
    dadosOcultos: jsonb('dados_ocultos').$type<Record<string, unknown>>(),
    hmacDoIp: char('hmac_do_ip', { length: 64 }),
    id: uuid('id').primaryKey(),
    negocioId: uuid('negocio_id')
      .notNull()
      .references(() => negocios.id, { onDelete: 'restrict' }),
    tipoDoAlvo: varchar('tipo_do_alvo', { length: 48 }).notNull(),
    utilizadorResponsavelId: uuid('utilizador_responsavel_id').references(
      () => utilizadores.id,
      { onDelete: 'restrict' },
    ),
  },
  (tabela) => [index('auditoria_por_negocio').on(tabela.negocioId, tabela.criadoEm)],
)

export type LinhaDaExperiencia = typeof experiencias.$inferSelect
export type NovaExperiencia = typeof experiencias.$inferInsert
