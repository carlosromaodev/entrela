import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
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
