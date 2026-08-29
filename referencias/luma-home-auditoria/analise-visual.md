# Auditoria visual do hero da Luma

Capturas e medições realizadas em 27 de agosto de 2026. A referência foi estudada para compreender composição e movimento; a Entrela mantém marca, texto, imagens e paleta próprios.

## Fotografias analisadas

- `hero-desktop-1440x1000.png` — estado de repouso.
- `hero-desktop-hover-corrida.png` — moldura visual activa.
- `hero-desktop-hover-lancamento.png` — palavra rosa activa.
- `hero-desktop-hover-fogo.png` — palavra azul activa.
- `hero-mobile-390x844.png` — variante mobile actualmente publicada.
- `../luma-login/home-publica-mobile-viewport.jpg` — variante mobile anterior com colagem.

## Tipografia e composição

- Stack: `-apple-system`, `BlinkMacSystemFont`, `Inter`, `Roboto`, `Segoe UI`, `Helvetica Neue`, Arial e sans-serif.
- Título desktop: `80px`, peso `500`, entrelinha `73.6px`, espaçamento `-0.8px`.
- Título mobile: `40px`, peso `500`, entrelinha `39.2px`.
- Cada linha usa uma máscara com `20px` de respiro vertical e `overflow: hidden`.
- A entrada dura `1.2s`, usa `cubic-bezier(.16, 1, .3, 1)` e atrasos de `250ms`, `400ms` e `550ms`.
- Texto de apoio desktop: `450px`, `20/30px`, três linhas. Mobile: `16/24px`, quatro linhas.
- O conjunto central ocupa aproximadamente 510px de altura e deixa uma grande área de silêncio em redor.

## Efeito no texto

- As expressões do parágrafo são links reais, não elementos decorativos.
- No repouso usam o mesmo tom secundário do parágrafo.
- No hover mudam de cor em `300ms`: verde na primeira categoria, rosa na segunda e azul na terceira.
- Qualquer uma das três categorias activa o mesmo sistema visual periférico; o conteúdo das imagens permanece estável.

## Imagens em redor

- A Luma desenha as capas num canvas do tamanho do hero; a Entrela reproduz a composição com componentes HTML/CSS acessíveis e mais fáceis de manter.
- São onze cartões no desktop, com larguras aproximadas entre `113px` e `230px` em 1440px.
- Há três níveis: pequenos junto às laterais, médios nos quadrantes e grandes parcialmente cortados no topo e na base.
- A área central entre aproximadamente 30% e 70% da largura permanece livre.
- As capas ficam praticamente direitas; a rotação raramente ultrapassa um grau.
- Moldura clara de `6–8px`, raio entre `13–18px` e sombra construída em várias camadas.
- No mobile, cinco cartões medem aproximadamente `111–140px`, começam perto de `y=500px` e formam duas linhas assimétricas.

## Aplicação na Entrela

- Repouso desktop tipográfico e sem cartões visíveis.
- “Celebrar”, “surpreender” e “convidar” são links interactivos com cores semanticamente distintas.
- Ao explorar um link, onze cartões Entrela surgem nas bordas e a palavra final do título muda para “momento”, “presente” ou “convite”.
- Mobile apresenta cinco cartões por padrão porque não depende de hover.
- O antigo fundo escuro expansivo foi removido para preservar legibilidade e serenidade.
- Movimento reduzido, foco de teclado e leitura por tecnologias assistivas permanecem suportados.
