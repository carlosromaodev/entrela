# Backend da Entrela

Monólito modular da plataforma Entrela, iniciado pelo MVP de Momentos.

## Estado actual

O MVP de Momentos tem, de ponta a ponta, criar, editar, publicar e catálogo ligados a um PostgreSQL 18 real: `POST /v1/momentos`, `PATCH /v1/momentos/:momentoId` e `POST /v1/momentos/:momentoId/publicacoes` estão implementados com Zod/OpenAPI, sessão assinada, política de acesso, UUIDv7 e RLS provado entre negócios (incluindo nas tabelas de blocos/etapas). Continuam pendentes: a rota pública de abertura/continuação do destinatário, upload de media, recordação e revogação de portas.

O histórico verificável está em [implementações](./especificacoes/implementacoes/README.md).

## Estrutura

```text
backend/
  drizzle/          schemas e migrações da base de dados
  src/
    http/           controladores, rotas e schemas Zod
    service/        casos de uso e testes co-localizados
      utils/
      errs/
    repository/     contratos e integrações com a base de dados
    lib/            configuração e integrações técnicas comuns
    app.ts           composição Fastify
    server.ts        entrada do processo
```

## Pré-requisitos

- Node.js 24 LTS;
- npm compatível com Node.js 24;
- PostgreSQL 18 será necessário a partir da primeira migração.

Com `nvm`:

```bash
nvm use
npm install
```

## Configuração local

Copiar `.env.exemplo` para `.env` e preencher valores locais. Nunca guardar uma chave real no repositório.

Variáveis obrigatórias:

- `URL_DA_BASE_DE_DADOS` — URL PostgreSQL;
- `CHAVE_DE_HMAC` — segredo exclusivo para tokens públicos;
- `CHAVE_DE_SESSAO` — segredo independente para assinatura de sessões.

As restantes variáveis possuem valores de desenvolvimento documentados em `.env.exemplo`.

## Comandos

```bash
npm run verificar-tipos
npm run testar
npm run testar:cobertura
npm run compilar
npm run desenvolver
npm run migracoes:gerar
npm run migracoes:aplicar
npm run migracoes:verificar
```

## Endpoints implementados

- `GET /saude` — saúde do processo sem consulta à base de dados;
- `GET /v1/categorias` — catálogo canónico das submarcas;
- `POST /v1/momentos` — criação autenticada do rascunho;
- `PATCH /v1/momentos/:momentoId` — actualização parcial autenticada do rascunho (título, capa, etapas, abertura, etc.);
- `POST /v1/momentos/:momentoId/publicacoes` — publicação autenticada do rascunho válido, com portas URL e QR;
- `GET /documentacao` — Swagger UI;
- `GET /documentacao/json` — documento OpenAPI 3.1.

Cada resposta própria inclui `x-id-da-requisicao`. Rotas inexistentes usam o envelope de erro canónico.
