# 001 — Fundação HTTP e configuração

**Data de verificação:** 2 de Agosto de 2026  
**Runtime verificado:** Node.js 24.18.1  
**Estado:** implementado e testado

## Resultado entregue

- [x] Configuração do processo validada e normalizada com Zod 4.
- [x] Falha de configuração identifica os campos inválidos sem expor o valor do segredo.
- [x] Aplicação Fastify 5 criada por uma função de composição testável, sem iniciar porta durante testes.
- [x] `GET /saude` responde sem autenticação e sem consultar conteúdo ou base de dados.
- [x] OpenAPI 3.1 e Swagger UI são gerados a partir dos schemas Zod.
- [x] Rotas inexistentes devolvem o envelope de erro canónico e um UUID de requisição.
- [x] O ficheiro `.env.exemplo` é validado pelo mesmo schema Zod usado no arranque.
- [x] O artefacto compilado respondeu `200` em `/saude` e publicou `/documentacao/json` num teste de fumaça local.
- [x] Dependências de produção e desenvolvimento passaram pela auditoria npm sem vulnerabilidades conhecidas.
- [x] Código reorganizado em `src/http`, `src/service`, `src/repository`, `src/lib` e `drizzle`, sem `dist` dentro de `src`.
- [x] A verificação de saúde foi extraída para `VerificarSaudeDoBackend`, com teste `.spec.ts` na mesma pasta do caso de uso.

## Ciclo TDD

### Vermelho

Os testes foram escritos antes dos módulos. As duas suites falharam porque `criarAplicacao` e `carregarConfiguracao` ainda não existiam.

### Verde

Foram implementados somente os componentes necessários aos contratos:

- `src/lib/configuracao/carregar-configuracao.ts`;
- `src/app.ts` e `src/server.ts`;
- `src/http/controllers`, `src/http/routes` e `src/http/schemas`;
- `src/service/verificar-saude-do-backend.ts`;
- `src/lib/iniciar-backend.ts`.

### Verificação

```text
Test Files  4 passed (4)
Tests       8 passed (8)
Statements  83,72%
Lines       83,33%
Functions   81,25%
TypeScript strict: sem erros
Compilação: concluída
npm audit: 0 vulnerabilidades
```

Os limites mínimos de cobertura estão configurados em `vitest.config.ts` e fazem o comando falhar se houver regressão abaixo do patamar aceite.

## Testes que sustentam a entrega

- `src/lib/configuracao/carregar-configuracao.spec.ts` valida conversão, valores predefinidos, campos obrigatórios e ocultação de segredo.
- `src/http/aplicacao-http.spec.ts` valida saúde, metadados, UUID, Swagger UI, OpenAPI e erro 404.
- `src/lib/iniciar-backend.spec.ts` chama a composição de arranque e comprova falha segura sem configuração obrigatória.
- `src/service/verificar-saude-do-backend.spec.ts` valida o caso de uso junto da sua implementação.

## Fora deste incremento

- [ ] Criar a conexão Drizzle com PostgreSQL 18.
- [ ] Criar e executar a primeira migração versionada.
- [ ] Implementar RLS e provar isolamento entre negócios.
- [ ] Implementar autenticação, sessões e papéis.
- [ ] Implementar o primeiro caso de uso de Momentos.
