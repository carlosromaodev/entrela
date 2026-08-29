# Referência visual — Luma

Capturas realizadas em 26 de agosto de 2026 para estudo interno da experiência de autenticação e configuração. O login foi aberto numa sessão temporária e isolada, preservando a sessão autenticada existente.

Posteriormente, com autorização explícita, a sessão da conta foi terminada para validar o fluxo real de logout e observar a home pública e o login sem autenticação.

## Capturas disponíveis

### Login

| Proporção | Ficheiro |
| --- | --- |
| Desktop — 1440 × 1000 | `login-desktop-1440x1000.png` |
| Tablet — 768 × 1024 | `login-tablet-768x1024.png` |
| Mobile — 390 × 844 | `login-mobile-390x844.png` |

Capturas posteriores ao logout: `login-sessao-encerrada-desktop-viewport.jpg` e a referência mobile equivalente já existente em `login-mobile-390x844.png`.

### Home pública

- `home-publica-desktop-viewport.jpg`
- `home-publica-desktop-full.jpg`
- `home-publica-mobile-viewport.jpg`
- `home-publica-mobile-full.jpg`

A análise dimensional e as decisões da implementação estão em `comparacao-estrutural.md`.

### Resultado Entrela e QA

As capturas finais da implementação, geradas automaticamente nos três breakpoints, estão em `../qa-frontend/`:

- `home-desktop-full.png`, `home-tablet-full.png`, `home-mobile-full.png`;
- `login-desktop-full.png`, `login-tablet-full.png`, `login-mobile-full.png`;
- `report.json`, com dimensões, overflow, imagens, consola e violações WCAG.

O logotipo final usa um monograma SVG inline e wordmark tipográfico nos pontos críticos. Os PNGs originais continuam disponíveis como ativos, mas já não condicionam a visibilidade da marca no cabeçalho, hero ou cartão de login.

### Preferências da conta

As capturas desta secção abrangem a página inteira; a largura útil desconta a barra de deslocação do navegador.

| Contexto | Dimensão final | Ficheiro |
| --- | --- | --- |
| Desktop | 1425 × 1588 | `configuracoes-preferencias-desktop-full-1425x1588.jpg` |
| Tablet | 753 × 1588 | `configuracoes-preferencias-tablet-full-753x1588.jpg` |
| Mobile | 375 × 1553 | `configuracoes-preferencias-mobile-full-375x1553.jpg` |

### Configuração de cadastro num evento

As capturas desta secção também abrangem a página inteira.

| Contexto | Dimensão final | Ficheiro |
| --- | --- | --- |
| Desktop | 1425 × 1199 | `configuracao-evento-cadastro-desktop-full-1425x1199.jpg` |
| Tablet | 753 × 1220 | `configuracao-evento-cadastro-tablet-full-753x1220.jpg` |
| Mobile | 375 × 1450 | `configuracao-evento-cadastro-mobile-full-375x1450.jpg` |

### Verificação da marca Entrela

| Proporção | Ficheiro |
| --- | --- |
| Desktop — 1440 × 120 | `entrela-cabecalho-desktop-1440x120.png` |
| Mobile — 390 × 80 | `entrela-cabecalho-mobile-390x80.png` |

## Conceitos a aproveitar

- navegação principal persistente e simplificada no mobile;
- títulos curtos, descrições contextuais e bastante espaço em branco;
- configurações agrupadas por intenção, não pela estrutura técnica;
- controlos colocados junto da explicação da consequência;
- estados ligados/desligados imediatamente reconhecíveis;
- densidade reduzida e hierarquia tipográfica consistente;
- ações principais visíveis sem competir com o conteúdo.

## Limites de uso

Estas imagens são referências internas. Dados pessoais, pagamentos e áreas com informação sensível foram deliberadamente excluídos. A implementação da Entrela deve aproveitar princípios de interação, sem copiar a identidade visual, textos ou componentes proprietários da Luma.

## Paleta oficial da Entrela

A paleta extraída da referência enviada pelo projeto está documentada em `paleta-entrela.md` e representada em `paleta-entrela.svg`.
