# Backend Entrela — guia de implementação

> **Objectivo imediato:** construir o MVP de **Entrela Momentos** — da criação de uma revelação privada à abertura, progressão e recordação.

Este guia explica *como* o backend será implementado. As regras de produto e os nomes de domínio continuam nos documentos canónicos já existentes.

## Decisões fixas

- Um **monólito modular** para toda a Entrela; nenhuma submarca terá backend ou base de dados própria.
- **Node.js 24 LTS**, **TypeScript strict**, **Fastify 5**, **Zod 4** e `fastify-type-provider-zod`.
- **OpenAPI/Swagger** gerado directamente dos schemas Zod.
- **PostgreSQL 18**, sempre na última versão menor disponível, e **Drizzle ORM** para persistência de domínio.
- SQL directo apenas em relatórios e consultas analíticas complexas, sempre de leitura e parametrizado.
- Migrações SQL versionadas e revistas no repositório.
- O backend decide tempo, acesso, revelação e pagamento; o frontend apenas pede e apresenta.
- Código de domínio, pastas internas, classes, métodos, funções e tabelas usam português sem acentos.

## Leitura por necessidade

1. [Fundamentos e stack](./01-fundamentos-e-stack.md) — antes de criar o projecto.
2. [Organização do código](./02-organizacao-do-codigo.md) — antes de criar módulos ou ficheiros.
3. [API e contratos](./03-api-e-contratos.md) — antes de criar rotas.
4. [Dados e migrações](./04-dados-e-migracoes.md) — antes de alterar PostgreSQL.
5. [Identidade e acesso](./05-identidade-e-acesso.md) — antes de implementar sessão ou links públicos.
6. [Processamentos e integrações](./06-processamentos-e-integracoes.md) — antes de media, recordações ou pagamentos.
7. [Qualidade e entrega](./07-qualidade-e-entrega.md) — antes de considerar uma fatia pronta.

## Documentos canónicos

- [Convenções de nomenclatura](../convencoes-de-nomenclatura.md)
- [Domínio e dados](../entrela-dominio-e-esquema-v1.md)
- [Esquema SQL](../entrela-esquema-v1.sql)
- [Motor de regras](../entrela-motor-de-regras-v1.md)
- [MVP de Momentos](../entrela-mvp-momentos-v1.md)
- [Requisitos consolidados](../requisitos/README.md)

Se houver conflito, prevalecem primeiro os invariantes de produto e dados; esta pasta define a forma de os implementar.
