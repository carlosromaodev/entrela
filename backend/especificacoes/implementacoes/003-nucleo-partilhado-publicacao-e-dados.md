# 003 — Núcleo partilhado, publicação e dados

**Data de verificação:** 2 de Agosto de 2026  
**Responsável técnico pela execução:** Codex, sob solicitação do proprietário do projecto  
**Estado:** núcleo executável; aplicação das migrações num PostgreSQL 18 real ainda pendente

## Resultado entregue

- [x] Catálogo canónico exposto por `GET /v1/categorias`, com exactamente seis categorias e estado real de disponibilidade.
- [x] Política central cobre os seis papéis de negócio e aplica menor privilégio.
- [x] `POST /v1/momentos` valida corpo strict e deriva `negocioId`/`utilizadorId` da sessão assinada.
- [x] Sessão do criador usa HMAC-SHA-256, expiração e comparação de tempo constante com chave independente.
- [x] IDs de produção são UUIDv7 e preservam ordenação temporal.
- [x] A máquina de estados recusa transições não declaradas.
- [x] Disponibilidade usa o relógio UTC do servidor e diferencia `EM_ESPERA`, `ATIVA`, `NEGADA` e `EXPIRADA`.
- [x] Motor declarativo limita factos, operadores e acções por allowlist e evita execução duplicada por chave.
- [x] Tokens públicos possuem 256 bits aleatórios, HMAC em repouso e nunca são incluídos na persistência de publicação.
- [x] `PublicarMomento` exige acesso e direito activo, valida capa/etapas/media, congela a versão e cria portas URL/QR distintas.
- [x] Schema Drizzle da primeira fatia possui 15 tabelas, constraints, índices e três migrações versionadas.
- [x] Migração RLS cobre 14 tabelas com `ENABLE` e `FORCE ROW LEVEL SECURITY`; teste estrutural protege a cobertura.
- [x] Cabeçalhos defensivos, limite de corpo e ocultação de autorização/cookies nos logs foram aplicados.

## Evidência automatizada

```text
Catálogo e HTTP: contrato Zod/OpenAPI e isolamento do contexto da sessão
Política de acesso: matriz dos seis papéis
Motor: condições, prioridade, allowlists e idempotência de avaliação
Publicação: 6 cenários
RLS: 15 cenários estruturais
Suite completa: 15 ficheiros e 87 testes aprovados
Cobertura unitária: 90% statements, 69,85% branches, 94,31% functions e 90,93% lines
Drizzle Kit: esquema e metadados válidos
TypeScript strict: sem erros
Compilação: concluída
```

## Limite da evidência

Os testes de RLS verificam a migração, mas não substituem a execução num PostgreSQL 18. Enquanto não houver uma instância disponível, continuam pendentes:

- [ ] aplicar as três migrações numa base vazia;
- [ ] reaplicar numa base no último estado;
- [ ] provar leitura e escrita permitidas no negócio A;
- [ ] provar leitura e escrita negadas do negócio A para o negócio B;
- [ ] testar rollback e concorrência da publicação real.

Pagamentos, fornecedores angolanos, Stripe, e-mail, armazenamento, antivírus, observabilidade externa, restauro e aprovação jurídica também continuam fora da evidência deste incremento.
