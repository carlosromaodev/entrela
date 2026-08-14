# Especificações de implementação — Entrela

Esta pasta traduz a visão de produto em contratos que uma equipa de desenvolvimento ou uma ferramenta de geração assistida pode executar sem inventar modelos incompatíveis.

1. [Domínio e dados (esquema-primeiro)](./entrela-dominio-e-esquema-v1.md) — entidades, relações, tenancy, versões, QR/NFC, eventos, pagamentos e invariantes das seis categorias. O contrato executável de referência está em [SQL PostgreSQL](./entrela-esquema-v1.sql).
2. [Convenções de nomenclatura](./convencoes-de-nomenclatura.md) — português obrigatório para código de domínio, tabelas, classes, funções, métodos, rotas e pastas próprias.
3. [MVP 01 — Entrela Momentos](./entrela-mvp-momentos-v1.md) — a primeira fatia vertical navegável, de editor a publicação e recordação.
4. [Motor de regras](./entrela-motor-de-regras-v1.md) — tempo, regras declarativas, ligação física, estados, idempotência e manifestos por categoria.
5. [Arquitectura do backend](./arquitetura-do-servidor/README.md) — stack, módulos, API, migrações, segurança e plano de entrega.
6. [Requisitos consolidados](./requisitos/README.md) — RF, RNF, regras de negócio e checklist de execução para as seis categorias.
7. [Implementações verificadas](./implementacoes/README.md) — incrementos concluídos com testes, tipagem e evidência.

## Ordem de leitura e construção

1. Ler as convenções, o esquema e a arquitectura do backend como contratos canónicos.
2. Implementar o motor apenas no subconjunto necessário a Momentos.
3. Construir o MVP de Momentos de ponta a ponta.
4. Só depois adicionar Convites, reutilizando as mesmas entidades e eventos.

As categorias são submarcas da Entrela, não aplicações ou bases de dados separadas.
