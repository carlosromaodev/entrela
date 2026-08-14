# 002 — Caso de uso CriarMomento

**Data de verificação:** 2 de Agosto de 2026  
**Estado:** núcleo do caso de uso implementado e testado; entrega HTTP e PostgreSQL pendentes

## Resultado entregue

- [x] `CriarMomento` possui entrada desconhecida validada por schema Zod strict.
- [x] Título respeita o limite de 1 a 100 caracteres e destinatário opcional respeita 1 a 80.
- [x] Idioma aceita apenas `pt-AO` ou `en`, e o fuso precisa existir na base IANA do runtime.
- [x] Dados inválidos falham antes de consultar autorização ou persistência.
- [x] Apenas contexto autorizado pelo contrato do repositório pode criar o rascunho.
- [x] Experiência, versão inicial e conteúdo são enviados ao repositório como um único agregado.
- [x] O rascunho nasce em `MOMENTOS`/`RASCUNHO`, com versão número 1 e sem versão publicada.
- [x] O teste do caso de uso está em `src/service/criar-momento.spec.ts`, ao lado da implementação.
- [x] Existe um repositório em memória para testes, separado do futuro adaptador Drizzle.

## Ciclo TDD

### Vermelho

O teste foi criado primeiro e falhou porque `CriarMomento`, os erros e o repositório de Momentos ainda não existiam.

### Verde

Foram adicionados:

- `src/service/criar-momento.ts` e o seu `.spec.ts`;
- `src/service/utils/validar-entrada.ts` e `validar-fuso-horario.ts`;
- erros tipados em `src/service/errs/`;
- contrato em `src/repository/contratos/`;
- implementação de teste em `src/repository/em-memoria/`.

### Evidência

```text
CriarMomento: 3 testes aprovados
Suite completa: 5 ficheiros e 11 testes aprovados
Cobertura de src/service/criar-momento.ts: 100% de statements e linhas
TypeScript strict: sem erros
Compilação: concluída
```

## Ainda não concluído

- [x] Expor `POST /v1/momentos` com schemas de corpo, resposta e erro. [Evidência](./003-nucleo-partilhado-publicacao-e-dados.md)
- [x] Derivar `negocioId` e `utilizadorId` de uma sessão autenticada, nunca do corpo HTTP. [Evidência](./003-nucleo-partilhado-publicacao-e-dados.md)
- [x] Implementar o repositório Drizzle e a transacção PostgreSQL. [Evidência](./003-nucleo-partilhado-publicacao-e-dados.md)
- [x] Gerar UUIDv7 na composição de produção. [Evidência](./003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] Testar isolamento e RLS numa instância PostgreSQL 18.

Como a persistência ainda não foi exercitada num PostgreSQL 18 real, `RF-CNT-01` permanece `[ ]` no documento de requisitos funcionais.
