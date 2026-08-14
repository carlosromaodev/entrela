# Entrela — Convenções de nomenclatura

**Estado:** obrigatório para todo código novo e para qualquer geração assistida por IA.  
**Língua do domínio:** português de Angola.  
**Excepções:** siglas, protocolos, formatos e nomes de fornecedores.

---

## 1. Regra principal

Tabelas, colunas, classes, interfaces, tipos, funções, métodos, eventos de domínio, rotas e pastas criadas pela equipa usam português.

Os identificadores não usam acentos nem cedilhas para manter compatibilidade entre SQL, TypeScript, URLs e ferramentas:

```text
Experiencia          experiencias          criarExperiencia
SessaoDeInteracao    sessoes_de_interacao  criarOuRetomarSessao
PontoDeAcesso        pontos_de_acesso      resolverPontoDeAcesso
```

Não são aceites nomes mistos como `criarExperience`, `getSessao`, `user_id` ou `access_points`.

As pastas técnicas fixas `src`, `http`, `controllers`, `routes`, `schemas`, `service`, `utils`, `errs`, `repository`, `lib` e `drizzle` são excepções estruturais explícitas. Dentro delas, nomes de domínio, ficheiros, classes, funções e métodos continuam em português.

### Siglas e nomes que se mantêm

`id`, UUID, SQL, JSON, JSONB, HTTP, URL, QR, NFC, NDEF, HMAC, MIME, UTC, IANA, ISO, IP, API, PDF, HTML, CSS, PostgreSQL e Stripe mantêm a grafia técnica. `LOCAL_AO` é o identificador temporário de um adaptador de pagamento local, não o nome de um método de pagamento.

---

## 2. Formato por camada

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabela SQL | `snake_case`, plural | `eventos_de_interacao` |
| Coluna SQL | `snake_case`, singular | `experiencia_id`, `criado_em` |
| Enum SQL | `snake_case` | `estado_da_experiencia` |
| Valor de enum | `MAIUSCULAS_COM_UNDERSCORE` | `EM_ESPERA`, `NAO_LISTADA` |
| Classe, interface, tipo | `PascalCase`, singular | `VersaoDaExperiencia` |
| Função e método | `camelCase`, verbo no infinitivo | `publicarExperiencia()` |
| Constante | `MAIUSCULAS_COM_UNDERSCORE` | `LIMITE_DE_ETAPAS_DO_MOMENTO` |
| Rota | minúsculas, hífen, sem acentos | `/v1/momentos/:id/publicacoes` |
| Evento de domínio | `MAIUSCULAS_COM_UNDERSCORE` | `EXPERIENCIA_ABERTA` |
| Pasta própria | minúsculas, hífen, sem acentos | `casos-de-uso/` |
| Ficheiro TypeScript | `PascalCase.ts` para classe/componente; `kebab-case.ts` para módulo | `CriarMomento.ts`, `validar-versao.ts` |

---

## 3. Vocabulário canónico

| Conceito | Tabela | Classe/tipo |
|---|---|---|
| Pessoa autenticada | `utilizadores` | `Utilizador` |
| Tenant/dono | `negocios` | `Negocio` |
| Membro de um negócio | `membros_do_negocio` | `MembroDoNegocio` |
| Experiência publicada ou rascunho | `experiencias` | `Experiencia` |
| Versão imutável/editável | `versoes_da_experiencia` | `VersaoDaExperiencia` |
| Etapa/estrutura da experiência | `nos_da_experiencia` | `NoDaExperiencia` |
| Unidade renderizável | `blocos` | `Bloco` |
| Ficheiro de media | `ficheiros` | `Ficheiro` |
| Condição e efeito declarativo | `regras` | `Regra` |
| Execução idempotente de regra | `execucoes_da_regra` | `ExecucaoDaRegra` |
| Porta digital/física | `pontos_de_acesso` | `PontoDeAcesso` |
| Autorização/token individual | `concessoes_de_acesso` | `ConcessaoDeAcesso` |
| Visitante/convidado/destinatário | `participantes_da_experiencia` | `ParticipanteDaExperiencia` |
| Sessão pública | `sessoes_de_interacao` | `SessaoDeInteracao` |
| Facto de utilização | `eventos_de_interacao` | `EventoDeInteracao` |
| Confirmação de presença | `respostas_de_presenca` | `RespostaDePresenca` |
| Entrada de evento | `registos_de_entrada` | `RegistoDeEntrada` |
| Pedido comercial | `pedidos` | `Pedido` |
| Pagamento | `pagamentos` | `Pagamento` |
| Direito obtido após pagamento/piloto | `direitos` | `Direito` |
| Reembolso | `reembolsos` | `Reembolso` |

`Negocio` é o único termo técnico para o tenant, incluindo criadores pessoais, empresas e parceiros. Não alternar com `Organizacao`. `ConcessaoDeAcesso` é a porta/token; `Direito` é o direito comercial de publicar, entrar, descarregar ou usar uma capacidade.

---

## 4. Colunas e estados canónicos

| Evitar | Usar |
|---|---|
| `organization_id` | `negocio_id` |
| `user_id` | `utilizador_id` |
| `experience_id` | `experiencia_id` |
| `created_at`, `updated_at` | `criado_em`, `atualizado_em` |
| `published_at` | `publicada_em` ou `publicado_em`, conforme o substantivo |
| `starts_at`, `ends_at` | `inicia_em`, `termina_em` |
| `opens_at`, `expires_at` | `abre_em`, `expira_em` |
| `status` | `estado` |
| `kind`, `type` | `tipo` |
| `scope` | `escopo` |
| `settings`, `configuration` | `configuracao` |
| `metadata` | `metadados` |
| `payload` | `dados` |
| `idempotency_key` | `chave_de_idempotencia` |
| `storage_key` | `chave_de_armazenamento` |
| `source_channel` | `canal_de_origem` |

Estados também são portugueses: `RASCUNHO`, `PUBLICADA`, `PAUSADA`, `ARQUIVADA`, `EM_ESPERA`, `ATIVA`, `CONCLUIDA`, `NEGADA`, `CONFIRMADO`, `FALHOU` e `REVOGADO`.

---

## 5. Funções, métodos e casos de uso

Os nomes descrevem uma intenção de negócio. Não usar `processar`, `gerir`, `handle` ou `utils` sem contexto.

```ts
criarMomento()
atualizarRascunhoDoMomento()
validarVersaoParaPublicacao()
criarSessaoDePreVisualizacao()
publicarMomento()
resolverPontoDeAcesso()
avaliarDisponibilidade()
criarOuRetomarSessao()
registarEventoDeInteracao()
avaliarRegras()
executarAcoesDaRegra()
desbloquearBloco()
obterProjecaoSegura()
revogarPontoDeAcesso()
regenerarPontosDeAcesso()
confirmarPagamentoPorWebhook()
concederDireito()
registarEntrada()
gerarFicheiroDaRecordacao()
```

Interfaces de repositório e serviços seguem a mesma regra:

```ts
interface RepositorioDeExperiencias {
  obterPorId(id: IdDaExperiencia): Promise<Experiencia | null>
  guardar(experiencia: Experiencia): Promise<void>
}

interface AvaliadorDeRegras {
  avaliar(evento: EventoDeInteracao): Promise<ProjecaoSegura>
}
```

---

## 6. Rotas públicas e de gestão

```text
POST   /v1/momentos
PATCH  /v1/momentos/:id
POST   /v1/momentos/:id/ficheiros
POST   /v1/momentos/:id/sessoes-de-pre-visualizacao
POST   /v1/momentos/:id/publicacoes
POST   /v1/momentos/:id/revogacoes-de-acesso

GET    /momento/:token
POST   /momento/:token/abrir
POST   /momento/:token/continuar
POST   /momento/:token/solicitacoes-de-recordacao
```

Verbos HTTP, `v1`, parâmetros `:id` e tokens mantêm a convenção técnica. As palavras de domínio da rota são portuguesas e nunca levam acentos.

---

## 7. Pastas do código próprio

```text
backend/
  drizzle/
  src/
    app.ts
    server.ts
    http/
      controllers/
      routes/
      schemas/
    service/
      utils/
      errs/
    repository/
    lib/

frontend/
  src/
    paginas/
    componentes/
    funcionalidades/
    servicos/
    estilos/
    testes/
```

No projecto actual já existem `frontend/src/paginas/`, `frontend/src/estilos/` e `frontend/src/principal.tsx` para o código próprio da página inicial. `backend/` e `frontend/` são os nomes fixos das aplicações. Pastas ou ficheiros impostos por ferramentas — `node_modules`, `public`, `dist`, `package.json`, `tsconfig.json`, `vite-env.d.ts`, `.git` e `README.md` — mantêm os nomes esperados pela ferramenta.

---

## 8. Aplicação obrigatória

1. O [esquema SQL](./entrela-esquema-v1.sql) é a fonte de verdade para nomes de tabelas e colunas.
2. Antes de gerar código, a ferramenta deve ler esta convenção, o esquema e o MVP.
3. Pull requests/revisões rejeitam nomes de domínio em inglês, salvo as excepções técnicas listadas.
4. Quando houver dúvida, acrescentar o termo a este vocabulário antes de criar uma segunda tradução para o mesmo conceito.
