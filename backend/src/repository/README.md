# Repositórios

Contratos e implementações de persistência ficam nesta camada.

- O service depende de contratos, nunca de Drizzle directamente.
- Adaptadores Drizzle convertem linhas da base em tipos do domínio.
- Repositórios em memória são usados em testes de casos de uso.
- SQL directo permanece restrito a relatórios analíticos de leitura.
