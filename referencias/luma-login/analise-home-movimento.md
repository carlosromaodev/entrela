# Análise da home pública da Luma

Referência observada em 27 de agosto de 2026. O objectivo é estudar hierarquia, ritmo e composição — sem copiar marca, texto, imagens ou código.

## Medidas observadas

### Desktop

- Título: `80px`, peso `500`, entrelinha `0.92`, espaçamento `-0.8px`.
- Cada linha vive dentro de uma máscara com cerca de `20px` de respiro vertical.
- Entrada das linhas: `1.2s`, curva `cubic-bezier(.16, 1, .3, 1)`, atrasos de `250ms`, `400ms` e `550ms`.
- Texto de apoio: largura aproximada de `450px`, `20/30px`, contraste secundário.
- Acção principal: `45px` de altura, formato pílula, peso `500`.

### Mobile — 390 × 844

- Título: `40px`, entrelinha `39.2px`, três linhas e largura aproximada de `297px`.
- Texto de apoio: `343px`, `16/24px`, quatro linhas.
- Acção principal: `234 × 40px`; acção secundária começa cerca de `24px` abaixo.
- A colagem começa perto de `y=500px`: um cartão central de `130px`, laterais parcialmente cortadas e segunda linha assimétrica.

## O que dá qualidade ao movimento

1. A animação segue a leitura: marca, três linhas, apoio, acções e só depois imagens.
2. O recorte das máscaras produz precisão sem precisar de desfoque.
3. O intervalo de `150ms` é perceptível, mas não torna o carregamento lento.
4. Os cartões terminam estáveis; o interesse vem da composição, não de movimento permanente.
5. A versão mobile reorganiza a colagem em vez de apenas reduzir a versão desktop.

## Tradução para a Entrela

- Mantida a identidade Entrela, a paleta do projecto e o conteúdo próprio.
- Título reconstruído com três máscaras e a mesma disciplina temporal.
- Removidos desfoques de entrada e flutuação infinita dos cartões.
- Desktop organizado como moldura periférica; mobile com centro dominante e laterais cortadas.
- Texto e acções concluem a entrada antes dos cartões.
- Secção final revela-se uma vez ao entrar no viewport e respeita `prefers-reduced-motion`.
