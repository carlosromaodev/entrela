# 009 — Consulta autenticada do rascunho de Momento

**Data de verificação:** 14 de Agosto de 2026

**Responsável técnico:** Codex, com implementação orquestrada sob solicitação do proprietário do projecto

**Estado:** caso de uso, contrato HTTP, arranque de produção e testes implementados.

## Resultado entregue

`GET /v1/momentos/:momentoId` permite retomar o editor com a projecção editorial do rascunho:

- identidade da experiência e da versão;
- título e destinatário opcional;
- idioma e modelo editorial;
- capa, etapas e política de abertura;
- estado fixo `RASCUNHO`.

A consulta deriva `negocioId` e `utilizadorId` exclusivamente da sessão assinada, exige `VER_CONTEUDO_PRIVADO`, trata inexistência e acesso cruzado de modo indistinguível e recusa versão já publicada. A resposta não expõe negócio, tokens, HMAC ou pontos de acesso.

## Evidência automatizada

- caso de uso: sucesso, papel insuficiente, inexistência/cross-tenant e transição inválida;
- HTTP: sessão obrigatória, UUID validado, resposta segura e OpenAPI;
- rascunho recém-criado com zero etapas é serializado sem erro;
- wiring de `criarAplicacao` e `iniciarBackend` usa o repositório Drizzle editorial;
- `npm run verificar-tipos`, `npm run testar`, `npm run compilar` e `npm run migracoes:verificar` aprovados.

## Requisito comprovado

- [x] [RF-CNT-13](../requisitos/README.md) — consulta segura e autenticada do rascunho editorial.
