# 010 — Integração contínua com PostgreSQL 18 e invariantes transaccionais

**Data de verificação:** 14 de Agosto de 2026

**Responsável técnico:** Codex, com implementação e auditoria orquestradas sob solicitação do proprietário do projecto

**Estado:** implementação e reprodução local concluídas; execução remota do GitHub Actions pendente de registo.

## Resultado entregue

- workflow do backend executado em alterações de `backend/**` e do próprio workflow;
- ambiente reprodutível com Node.js 24, `npm ci` e PostgreSQL 18;
- base vazia pertencente ao papel `entrela`, explicitamente sem privilégios de superutilizador, criação de bases ou papéis;
- verificação e aplicação integral das migrações antes dos testes;
- tipos, suíte unitária e de integração e compilação como condições obrigatórias;
- limite de quinze minutos e permissões do workflow reduzidas a leitura do repositório.

## Invariantes exercitadas

- isolamento RLS entre negócios com `FORCE ROW LEVEL SECURITY`;
- duas publicações concorrentes produzem exactamente um vencedor e somente o par de portas desse vencedor;
- falha intermédia da publicação reverte estado, versão e portas;
- falha intermédia da regeneração mantém a porta anterior activa;
- duas regenerações concorrentes são serializadas e não misturam portas de gerações diferentes.

## Evidência automatizada

Reprodução local numa base PostgreSQL `18-alpine` criada do zero, com o mesmo papel não-superutilizador do workflow:

- `npm run migracoes:verificar` aprovado;
- `npm run migracoes:aplicar` aprovado numa base vazia;
- `npm run verificar-tipos` aprovado;
- `npm run testar`: 20 ficheiros e 121 testes aprovados, sem testes ignorados;
- `npm run compilar` aprovado;
- `git diff --check` aprovado.

A execução remota, o SHA e a ligação do run serão registados aqui depois do primeiro push verde.

## Requisitos com evidência reforçada

Esta entrega não encerra requisitos novos. Ela acrescenta prova contínua a requisitos já concluídos:

- [x] [RF-CNT-05](../requisitos/README.md) e [RF-MOM-05](../requisitos/README.md) — publicação versionada e privada;
- [x] [RF-MOM-11](../requisitos/README.md) e [RN-MOM-08](../requisitos/README.md) — regeneração atómica com rollback;
- [x] [RNF-SEG-04](../requisitos/README.md) e [RN-GLO-07](../requisitos/README.md) — autorização por negócio e isolamento RLS;
- [x] [RN-EST-04](../requisitos/README.md) — publicação atómica sob concorrência e falha intermédia.

Permanecem pendentes, entre outros, `RNF-SEG-07`, `RNF-DES-02`, `RNF-QUA-01`, `RNF-DIS-04`, `RN-EST-03` e `RN-GLO-11`, pois exigem capacidades posteriores das 24 macrofatias.
