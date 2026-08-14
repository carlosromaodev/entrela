# 007 — Repositório editorial de Momentos em PostgreSQL real

**Data de verificação:** 3 de Agosto de 2026
**Estado:** `AtualizarRascunhoDoMomento` e `PublicarMomento` ligados a PostgreSQL 18 real e wireados em produção

## Contexto

Os incrementos 005 e 006 deixaram propositadamente `PublicarMomento` e `AtualizarRascunhoDoMomento` sem repositório Drizzle, porque `CriarMomento` só persistia título/idioma/destinatário — não havia onde ler ou escrever capa, etapas ou abertura. Este incremento fecha esse ciclo.

## Resultado entregue

- [x] `RepositorioEditorialDeMomentosDrizzle` implementa **os dois contratos** (`RepositorioDeEdicaoDeMomentos` e `RepositorioDePublicacaoDeMomentos`) sobre as mesmas tabelas, evitando duas leituras divergentes do mesmo agregado.
- [x] Mapeamento de domínio para esquema: `titulo`/`nomeDoDestinatario` → `traducoes_da_experiencia`; `capa`/`modeloEditorial` → `experiencias.configuracao` (jsonb); `etapas` → `blocos` (posição, chave, `configuracao.final`, `configuracao.media`) + `traducoes_do_bloco` (texto); `abertura` → `politicas_de_disponibilidade`; portas publicadas → `pontos_de_acesso`.
- [x] Mudar de idioma em `atualizarRascunho` propaga a mudança para `traducoes_da_experiencia` **e** para todas as `traducoes_do_bloco` da versão em rascunho, evitando um estado inconsistente entre título e etapas.
- [x] Substituir a lista de etapas apaga as antigas (`traducoes_do_bloco` antes de `blocos`, respeitando a FK `ON DELETE RESTRICT`) e insere as novas na mesma transacção — nunca fica um estado parcial.
- [x] `possuiDireitoAtivo` consulta `direitos` com janela `inicia_em`/`termina_em` e `estado='ATIVO'`, sob o mesmo contexto RLS.
- [x] `publicarAtomico` actualiza `versoes_da_experiencia`, `experiencias` e insere as duas `pontos_de_acesso` (URL/QR) numa única transacção.
- [x] **Contratos ajustados para RLS real:** `RepositorioDeEdicaoDeMomentos.atualizarRascunho` e `PublicacaoDoMomento` passaram a exigir `negocioId` explicitamente — sem isso não é possível definir `app.negocio_id` antes de escrever. Ajustado em `AtualizarRascunhoDoMomento`, `PublicarMomento`, no repositório em memória e nos testes existentes, sem perder nenhuma cobertura.
- [x] Wireado em `src/lib/iniciar-backend.ts`: `PATCH /v1/momentos/:momentoId` e `POST /v1/momentos/:momentoId/publicacoes` já respondem em produção, não só em testes.
- [x] Teste de fumaça do binário compilado (`node dist/src/server.js`) contra o PostgreSQL 18 real: `/saude`, `/documentacao/json` e `/v1/categorias` responderam `200`, e a OpenAPI publicada lista as quatro rotas de Momentos (`POST /v1/momentos`, `PATCH /v1/momentos/{momentoId}`, `POST /v1/momentos/{momentoId}/publicacoes`, mais o catálogo).

## Ciclo TDD

### Vermelho → Verde

`src/repository/drizzle/repositorio-editorial-de-momentos-drizzle.integracao.spec.ts` foi escrito para correr apenas contra PostgreSQL real (`describe.skipIf`), com dois cenários:

1. **Ciclo completo:** criar rascunho (via `RepositorioDeMomentosDrizzle`, do incremento 003) → editar capa/etapas/abertura/título → ler de volta e confirmar os dados exactos → consultar papel e direito → publicar → reler e confirmar `estado: 'PUBLICADA'` com o título preservado.
2. **Isolamento cruzado nas tabelas novas:** um rascunho com etapas privadas criado no negócio A é invisível para o negócio B (`obterRascunho` devolve `null`) e não pode ser editado por ele (`atualizarRascunho` rejeita com `RASCUNHO_INEXISTENTE`), provando RLS em `blocos`/`traducoes_do_bloco` além do que o incremento 004 já tinha provado em `experiencias`/`negocios`.

### Evidência

```text
Execução contra PostgreSQL 18 real (URL_DE_BASE_DE_DADOS_DE_INTEGRACAO):
  ✓ cria, edita, publica e relê um Momento de ponta a ponta
  ✓ nega leitura e edição do rascunho a partir de outro negócio
Repetido três vezes sem colisão de dados (tokens/soma de verificação derivados do momentoId).

Suite completa (sem a variável de integração):
Test Files  16 passed | 2 skipped (18)
     Tests  101 passed | 4 skipped (105)
TypeScript strict: sem erros
Compilação: concluída

Teste de fumaça do binário compilado:
GET /saude              → 200
GET /documentacao/json  → 200
GET /v1/categorias      → 200
Rotas publicadas: POST /v1/momentos, PATCH /v1/momentos/{momentoId},
                  POST /v1/momentos/{momentoId}/publicacoes, GET /v1/categorias, GET /saude
```

## Requisitos afectados

- [x] [RF-CNT-05](../requisitos/README.md) — Versões: o criador continua a trabalhar em rascunho (PATCH real) e a publicação cria uma versão imutável com soma de verificação (tudo contra PostgreSQL real).
- [x] [RF-MOM-05](../requisitos/README.md) — Publicação privada: URL e QR privados criados, direito exigido, tudo persistido — não apenas em memória.
- [x] [RN-EST-04](../requisitos/README.md) — Publicação atómica: validado o mínimo de bloco de conteúdo e disponibilidade antes de publicar, numa transacção real.

## Fora deste incremento

- [ ] `RF-CNT-09` (histórico de edição do rascunho com desfazer/restaurar) — este repositório substitui campos, não versiona rascunhos intermédios.
- [ ] Migração de `chaveDoBloco`/`tipo`/`configuracao` para um esquema mais rico quando o motor de regras precisar de mais tipos de bloco além de `ETAPA` (ver `RF-CNT-03`/`RF-NUC-008` no documento complementar).
- [ ] Testar concorrência real (duas publicações simultâneas do mesmo rascunho) e rollback por falha a meio da transacção.
- [ ] Automatizar a subida do PostgreSQL de integração (continua manual via Docker, ver incremento 004).
