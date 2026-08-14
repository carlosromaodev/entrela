# Base de dados com Drizzle

Esta pasta concentra schemas, migrações versionadas e metadados do Drizzle Kit.

- [x] Criar o schema Drizzle da primeira fatia vertical a partir do contrato SQL canónico.
- [x] Criar `drizzle.config.ts` e activar os comandos de migração.
- [x] Gerar as migrações versionadas do schema, referências circulares e RLS.
- [x] Verificar a cobertura estrutural de `ENABLE` e `FORCE ROW LEVEL SECURITY` nas 14 tabelas isoladas.
- [x] Testar migração numa base vazia e numa base já migrada.
- [x] Provar RLS por `negocio_id` numa instância PostgreSQL 18 com pelo menos dois negócios.
- [ ] Completar tabelas das categorias posteriores quando cada fatia entrar em implementação.

As caixas concluídas possuem evidência em [003 — Núcleo partilhado, publicação e dados](../especificacoes/implementacoes/003-nucleo-partilhado-publicacao-e-dados.md) e [004 — Persistência real em PostgreSQL 18 e prova de RLS](../especificacoes/implementacoes/004-persistencia-real-em-postgresql-18.md).
