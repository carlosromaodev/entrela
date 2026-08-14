# 006 — Actualização do rascunho de Momento (PATCH)

**Data de verificação:** 3 de Agosto de 2026
**Estado:** caso de uso e contrato HTTP implementados e testados; repositório Drizzle real continua pendente

## Contexto

Até este incremento, `CriarMomento` só persistia título, idioma e destinatário; não existia nenhum caminho para o criador definir capa, etapas ou abertura depois de criar o rascunho. Isto bloqueava, na prática, `PublicarMomento` (incremento 003) de ser exercitado com dados reais fora dos testes, porque nada os escrevia.

## Resultado entregue

- [x] `AtualizarRascunhoDoMomento` valida a entrada com Zod estrito e exige pelo menos um campo por pedido (`titulo`, `nomeDoDestinatario`, `idioma`, `modeloEditorial`, `capa`, `etapas` ou `abertura`).
- [x] Actualização parcial: só os campos enviados são substituídos; os restantes do rascunho permanecem intactos.
- [x] Reutiliza `validarEstruturaDasEtapas` (extraído de `PublicarMomento` neste mesmo incremento) para recusar etapas com ordem inválida, chave vazia/duplicada, texto acima de 1.600 caracteres, media acima do limite por tipo ou mais de uma/nenhuma revelação final — antes de persistir.
- [x] Só aceita edição de um negócio autorizado (`EDITAR_RASCUNHO`, já definida na política de acesso mas nunca usada antes deste incremento) e recusa acesso cruzado com o mesmo código de erro de um negócio inexistente.
- [x] Recusa editar um Momento já publicado com `ErroDeTransicaoDeEstado` (HTTP 409), preservando RN-GLO-11 (só rascunho é editável; publicado é imutável).
- [x] `PATCH /v1/momentos/:momentoId` expõe o caso de uso seguindo o mesmo padrão de injecção de dependências de `POST /v1/momentos` e `POST /v1/momentos/:momentoId/publicacoes` (dependência opcional, rota só registada quando fornecida).
- [x] OpenAPI 3.1 documenta a nova rota, incluindo os três novos códigos de erro possíveis (`400`, `403`, `409`, `422`).

## Refactor SOLID desta entrega

`PublicarMomento.validarRascunho` continha, misturada, validação estrutural das etapas (ordem, revelação final, limite de media) e validação de completude exclusiva da publicação (etapa sem conteúdo, media não pronta, total de media). A validação estrutural foi extraída para `src/service/utils/validar-etapas-do-momento.ts` e passou a ser partilhada por `PublicarMomento` e por `AtualizarRascunhoDoMomento` — sem duplicar regra, sem quebrar nenhum teste existente (princípio da responsabilidade única aplicado a uma função que antes fazia duas coisas).

## Ciclo TDD

### Vermelho

`src/service/atualizar-rascunho-do-momento.spec.ts` foi escrito primeiro, com sete cenários (actualização parcial, substituição de etapas, corpo vazio, etapas inválidas, papel sem permissão, negócio cruzado, Momento já publicado) — todos falharam porque `AtualizarRascunhoDoMomento` ainda não existia. Em seguida, quatro cenários HTTP foram adicionados a `aplicacao-http.spec.ts` e falharam com `404` até a rota existir.

### Verde

Foram adicionados apenas os componentes necessários:

- `src/repository/contratos/repositorio-de-edicao-de-momentos.ts` (novo contrato, seguindo o mesmo padrão de segregação de interface já usado entre `RepositorioDeMomentos` e `RepositorioDePublicacaoDeMomentos`);
- `RepositorioDePublicacaoDeMomentosEmMemoria` passou a implementar também este novo contrato (`atualizarRascunho`), sem alterar o seu comportamento anterior;
- `src/service/utils/validar-etapas-do-momento.ts` e o refactor de `publicar-momento.ts`;
- `src/service/atualizar-rascunho-do-momento.ts`;
- `esquemaDoCorpoParaAtualizarMomento` e `esquemaDaRespostaDaAtualizacaoDoMomento`;
- `src/http/controllers/atualizar-momento.ts`;
- a rota `PATCH /v1/momentos/:momentoId` e a dependência opcional `atualizarRascunhoDoMomento` em `app.ts`.

### Evidência

```text
src/service/atualizar-rascunho-do-momento.spec.ts: 7 testes aprovados
src/http/aplicacao-http.spec.ts: 14 testes aprovados (3 novos)
Suite completa: 16 ficheiros e 101 testes aprovados, 1 ficheiro/2 testes de integração ignorados sem Postgres
TypeScript strict: sem erros
Compilação: concluída
Cobertura: 90,93% statements, 75,61% branches, 94,05% functions, 91,7% lines
```

## Ainda não concluído

- [ ] Repositório Drizzle que implemente `RepositorioDeEdicaoDeMomentos` contra PostgreSQL real (mapear `capa`/`abertura` para `configuracao`/`politicas_de_disponibilidade`, e `etapas` para `blocos`/`traducoes_do_bloco`).
- [ ] Wiring de `atualizarRascunhoDoMomento` em `src/lib/iniciar-backend.ts`, mantido de fora propositadamente enquanto o repositório Drizzle acima não existir.
- [ ] Histórico de edição do rascunho com desfazer/restaurar (RF-CNT-09 dos requisitos funcionais); este incremento só substitui campos, não guarda versões intermédias do rascunho.

Como a actualização ainda não foi exercitada contra um repositório Drizzle real, nenhum RF adicional foi marcado `[x]` nos documentos de requisitos por causa deste incremento — a mesma disciplina aplicada a `RF-MOM-05`/`RN-EST-04` desde o incremento 005.
