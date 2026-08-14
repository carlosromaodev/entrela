# 004 — Persistência real em PostgreSQL 18 e prova de RLS

**Data de verificação:** 3 de Agosto de 2026
**Runtime verificado:** PostgreSQL 18 (imagem `postgres:18-alpine`), Node.js 24.18.1
**Estado:** migrações e isolamento por negócio comprovados numa instância real; wiring de produção usa a mesma cadeia de código já testada em memória

## Resultado entregue

- [x] As três migrações versionadas (`0000`, `0001`, `0002`) aplicam-se sem erro numa base PostgreSQL 18 vazia.
- [x] Reaplicar as mesmas migrações numa base já migrada é seguro e não produz alterações nem erros (idempotência confirmada via `drizzle-kit migrate`).
- [x] As 14 tabelas isoladas ficam com `relrowsecurity` e `relforcerowsecurity` activos na base real, confirmando o que a migração declara.
- [x] `RepositorioDeMomentosDrizzle.criarRascunho` e `obterPapelDoUtilizador` — o mesmo código usado por `POST /v1/momentos` em produção — foram exercitados contra PostgreSQL real, não apenas contra o repositório em memória.
- [x] Leitura e escrita dentro do próprio negócio funcionam quando o contexto `app.negocio_id` corresponde à linha.
- [x] Leitura cruzada entre negócios devolve zero linhas (a política `USING` filtra silenciosamente, sem erro nem fuga de dados).
- [x] Escrita cruzada (tentar gravar `negocio_id` de A estando o contexto definido como B) é recusada pelo PostgreSQL com `SQLSTATE 42501` — `new row violates row-level security policy`.
- [x] Documentado um requisito operacional crítico até agora implícito: a ligação da aplicação **não pode** usar um papel superutilizador do PostgreSQL, porque um superutilizador ignora RLS mesmo com `FORCE ROW LEVEL SECURITY`. A prova só é válida porque a migração foi aplicada e é usada por um papel (`entrela`) que não é superutilizador.

## Ciclo TDD

### Vermelho

Antes deste incremento, `src/repository/drizzle/isolamento-por-negocio.spec.ts` só validava o texto da migração SQL (verificação estrutural). Não existia nenhum teste a exercitar RLS contra um PostgreSQL real, e os itens correspondentes em [`drizzle/README.md`](../../drizzle/README.md) e em 003 estavam explicitamente assinalados como pendentes.

### Verde

Foi criado `src/repository/drizzle/isolamento-por-negocio.integracao.spec.ts`, guardado por `describe.skipIf(!process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO)` para nunca correr por omissão nem exigir infraestrutura em máquinas sem PostgreSQL disponível. Passos executados manualmente para produzir a evidência:

```bash
docker run -d --name entrela_postgres_teste \
  -e POSTGRES_PASSWORD=postgres -p 5544:5432 postgres:18-alpine

docker exec -i entrela_postgres_teste psql -U postgres \
  -c "CREATE ROLE entrela LOGIN PASSWORD 'entrela';"
docker exec -i entrela_postgres_teste psql -U postgres \
  -c "CREATE DATABASE entrela OWNER entrela;"

URL_DA_BASE_DE_DADOS='postgresql://entrela:entrela@localhost:5544/entrela' \
  npx drizzle-kit migrate   # base vazia → 3 migrações aplicadas

URL_DA_BASE_DE_DADOS='postgresql://entrela:entrela@localhost:5544/entrela' \
  npx drizzle-kit migrate   # reaplicação → sem erros, sem alterações

URL_DE_BASE_DE_DADOS_DE_INTEGRACAO='postgresql://entrela:entrela@localhost:5544/entrela' \
  npx vitest run src/repository/drizzle/isolamento-por-negocio.integracao.spec.ts
```

### Evidência

```text
isolamento por negócio num PostgreSQL 18 real
  ✓ permite ao repositório de produção ler e escrever dentro do próprio negócio
  ✓ nega leitura e escrita cruzada entre negócios com RLS forçado

Suite completa (sem a variável de integração definida):
Test Files  15 passed | 1 skipped (16)
     Tests  91 passed | 2 skipped (93)
TypeScript strict: sem erros
Compilação: concluída
Cobertura: 90,23% statements, 73,66% branches, 94,44% functions, 91,16% lines
```

## Como reproduzir

O teste de integração nunca corre em `npm run testar` por omissão — precisa de `URL_DE_BASE_DE_DADOS_DE_INTEGRACAO` explicitamente definida, apontando para um papel que **não** seja superutilizador do PostgreSQL. Isto evita que a suite unitária dependa de infraestrutura externa e mantém a pirâmide de testes (RNF-QUA-01) com a camada de integração claramente separada.

## Requisitos afectados

- [RF-CNT-01](../requisitos/README.md) — criação de rascunho — evidência completa de ponta a ponta.
- [RNF-SEG-04](../requisitos/README.md) — RLS real com `FORCE ROW LEVEL SECURITY` — provado contra instância real.
- [RN-GLO-07](../requisitos/README.md) — isolamento entre negócios — provado contra instância real.
- [`drizzle/README.md`](../../drizzle/README.md) — migração em base vazia/já migrada e prova de RLS — concluído.

## Fora deste incremento

- [ ] Testar rollback e concorrência real da publicação (`publicarAtomico`) contra PostgreSQL — depende do incremento 005 e de um repositório Drizzle de publicação.
- [ ] Automatizar a subida do PostgreSQL de integração (docker-compose) em vez do procedimento manual acima.
- [ ] Provar RLS nas tabelas que ainda não têm nenhum caminho de escrita em produção (`regras`, `eventos_de_interacao`, `sessoes_de_interacao`, `direitos`, `registos_de_auditoria`).
