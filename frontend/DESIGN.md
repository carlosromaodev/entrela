# Design público da Entrela

## Direção

A interface pública deve transmitir intimidade, cuidado e simplicidade. A composição usa bastante espaço negativo, tipografia de grande escala e superfícies discretas. A referência da Luma foi usada para estudar proporção e hierarquia; identidade, textos, imagens e comportamento permanecem próprios da Entrela.

## Paleta

- `#FDFCFB` — marfim: superfície principal e base luminosa.
- `#D8BFD8` — malva-pérola: assinatura emocional, foco e estados suaves.
- `#11110F` — tinta funcional: texto e ações de alto contraste.

O preto funcional não integra a paleta emocional enviada, mas é necessário para legibilidade e conformidade de contraste.

## Hierarquia

- Home desktop: título até `80px`, peso `500`, entrelinha `0.92`.
- Home mobile: título entre `38px` e `44px`.
- Login: título `20/24px`, corpo `15/22px`, controlos com `38px`.
- Largura do cartão de autenticação: `360px`; área interna: `320px`.

## Componentes públicos

- `MarcaEntrela`: única implementação do símbolo e wordmark do cabeçalho.
- `CabecalhoPublico`: navegação comum da home e autenticação.
- `PaginaInicial`: narrativa e entrada na criação.
- `PaginaDeLogin`: autenticação por email com estados inicial, inválido e enviado.

## Princípios de interação

1. A ação principal é escura, única e imediatamente reconhecível.
2. Ações indisponíveis são identificadas como “Em breve”; não fingem integração.
3. Erros aparecem junto do campo, com `aria-invalid` e anúncio por `role="alert"`.
4. O foco usa a cor malva-pérola e não depende apenas de mudança de cor.
5. Movimento respeita `prefers-reduced-motion`.

## Movimento editorial

- O título entra em três máscaras, com `1.2s` e atrasos de `150ms` (`250ms`, `400ms`, `550ms`).
- Texto de apoio e acções concluem a entrada antes de `1.5s`; a interface não deve parecer bloqueada pela animação.
- No desktop, a colagem surge ao explorar as palavras “celebrar”, “surpreender” e “convidar”; o centro permanece livre para leitura.
- Os onze cartões aparecem das bordas para dentro com `26ms` de diferença e permanecem estáveis após a chegada.
- Paralaxe só responde ao rato; não existe flutuação permanente no mobile nem movimento sem intenção.
- Conteúdo abaixo da dobra revela-se uma única vez quando entra no viewport.

## Responsividade

- `≤ 760px`: conteúdo começa abaixo do cabeçalho, ações secundárias desaparecem e o cartão ocupa a largura disponível até `360px`.
- `≤ 420px`: título da home reduz sem quebrar o ritmo; cartões visuais usam o terço inferior da primeira dobra.
- Desktop: a zona central da home recebe uma proteção luminosa para garantir legibilidade sobre as imagens.
- Desktop: os cartões ficam ocultos no repouso e formam uma moldura periférica durante a exploração do texto.
- Mobile: cinco cartões ficam visíveis no terço inferior, entre `115px` e `142px`, com centro dominante e laterais cortadas.

## Evitar

- copiar textos, ícones, logotipo ou imagens da referência;
- introduzir novos hexadecimais sem função documentada;
- criar variantes locais de cabeçalho ou marca;
- usar gradientes decorativos fora das áreas narrativa e de autenticação;
- habilitar botões de autenticação sem integração real.
