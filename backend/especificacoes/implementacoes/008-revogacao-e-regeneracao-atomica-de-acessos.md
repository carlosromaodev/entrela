# 008 — Revogação e regeneração atómica de acessos

**Data de verificação:** 14 de Agosto de 2026

**Responsável técnico:** Codex, com auditoria orquestrada sob solicitação do proprietário do projecto

**Estado:** implementado e testado; integração PostgreSQL executa quando `URL_DA_BASE_DE_DADOS_DE_INTEGRACAO` aponta para PostgreSQL 18.

## Resultado entregue

- `REVOGAR` substitui as portas activas por conjunto vazio numa única transacção.
- `REGENERAR` revoga portas antigas e cria URL/QR novos na mesma transacção.
- A linha da experiência é bloqueada com `FOR UPDATE`, serializando regenerações concorrentes.
- A versão publicada é validada antes de tocar nas portas.
- Falha de inserção provoca rollback e mantém a porta anterior `ATIVO`.
- O double em memória segue o mesmo contrato de substituição indivisível.

## Evidência automatizada

- testes unitários do caso de uso preservam autorização, transição de estado e formato das portas;
- teste de integração força conflito de HMAC e comprova rollback;
- depois de uma regeneração válida, a integração comprova uma porta anterior `REVOGADO` e a substituta `ATIVO`;
- `npm run verificar-tipos`, `npm run testar`, `npm run compilar` e `npm run migracoes:verificar` aprovados.

## Requisitos comprovados

- [x] [RF-MOM-11](../requisitos/README.md) — revogação e regeneração transaccional das portas de Momentos.
- [x] [RN-MOM-08](../requisitos/README.md) — invalidação das portas anteriores sem alterar a publicação e com rollback integral.

O requisito genérico `RF-ACE-08` permanece `[ ]` porque as restantes categorias ainda não implementaram esta capacidade.
