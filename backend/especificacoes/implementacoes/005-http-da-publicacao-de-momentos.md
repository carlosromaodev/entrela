# 005 — HTTP da publicação de Momentos

**Data de verificação:** 3 de Agosto de 2026
**Estado:** contrato HTTP implementado e testado; repositório Drizzle de publicação continua pendente

## Resultado entregue

- [x] `POST /v1/momentos/:momentoId/publicacoes` expõe o caso de uso `PublicarMomento`, já implementado e testado desde 003, através do mesmo padrão de injecção de dependências usado por `POST /v1/momentos`.
- [x] A rota só é registada quando `publicarMomento` é fornecido, sem alterar o comportamento de `POST /v1/momentos` (princípio aberto/fechado: nova capacidade, zero alteração da rota existente).
- [x] `negocioId` e `utilizadorId` continuam a vir exclusivamente da sessão assinada; o corpo do pedido não é lido para a publicação (o único parâmetro de entrada é o `momentoId` do caminho).
- [x] Publicação válida devolve `201` com `estado`, `abreEm`, `versaoId` e as duas portas (`URL` e `QR`) com tokens distintos.
- [x] Falta de sessão devolve `401` sem tocar no repositório.
- [x] Falta de `Direito(PUBLICAR_MOMENTO)` devolve `403` com o código canónico `DIREITO_INATIVO`.
- [x] Rascunho inválido (sem capa, etapa vazia, media não pronta, etc.) devolve `422` com o código canónico `MOMENTO_NAO_PUBLICAVEL`, sem vazar detalhes de outro negócio.
- [x] OpenAPI 3.1 documenta a nova rota (parâmetros, respostas e segurança) a partir dos mesmos schemas Zod usados pelos testes.

## Ciclo TDD

### Vermelho

Foram adicionados quatro cenários a `src/http/aplicacao-http.spec.ts` antes de qualquer schema, controlador ou rota existir: publicação válida, sem sessão, sem direito e rascunho inválido. Os quatro falharam com `404` (rota inexistente) ou `TypeError` ao tentar interpretar um schema de resposta ainda não criado.

### Verde

Foram adicionados apenas os componentes necessários para os quatro cenários passarem:

- `esquemaDosParametrosDoMomento` e `esquemaDaRespostaDaPublicacaoDoMomento` em `src/http/schemas/esquemas-dos-momentos.ts`;
- `src/http/controllers/publicar-momento.ts`;
- a rota `POST /v1/momentos/:momentoId/publicacoes` em `src/http/routes/registrar-rotas-de-momentos.ts`, condicionada à presença de `publicarMomento`;
- a dependência opcional `publicarMomento` em `src/app.ts`, seguindo o mesmo padrão de `criarMomento`.

### Evidência

```text
src/http/aplicacao-http.spec.ts: 11 testes aprovados (4 novos)
Suite completa: 15 ficheiros e 91 testes aprovados, 1 ficheiro e 2 testes ignorados (integração sem Postgres)
TypeScript strict: sem erros
Compilação: concluída
Cobertura: 90,23% statements, 73,66% branches, 94,44% functions, 91,16% lines
```

## Ainda não concluído

- [ ] Repositório Drizzle que implemente `RepositorioDePublicacaoDeMomentos` contra PostgreSQL real. Isto depende, por sua vez, de um caso de uso `AtualizarRascunhoDoMomento` (`PATCH /v1/momentos/:id`) que ainda não existe: hoje `CriarMomento` só persiste título, idioma e destinatário — capa, etapas e abertura ainda não têm caminho de escrita em produção, apenas nos repositórios em memória usados pelos testes.
- [ ] Wiring de `publicarMomento` em `src/lib/iniciar-backend.ts` (composição de produção); mantido de fora propositadamente enquanto o repositório Drizzle acima não existir, para não expor uma rota de produção sem persistência real por trás.
- [ ] Testar concorrência e rollback de `publicarAtomico` contra PostgreSQL real.

Como a publicação ainda não foi exercitada contra um repositório Drizzle real, `RF-MOM-05` e `RN-EST-04` permanecem `[ ]` nos documentos de requisitos, na mesma lógica que manteve `RF-CNT-01` por marcar entre os incrementos 002 e 004.
