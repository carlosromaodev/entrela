# ENTRELA — Essência, Motor e Categorias
## Aprofundamento de Casos de Uso (documento complementar à v1)

**Refere-se a:** ENTRELA — Visão de Produto, Ecossistema e Mapa Completo de Capacidades (v1)
**Data:** 2 de agosto de 2026
**Estado:** Substituído pela versão completa `entrela-essencia-casos-de-uso-v2 (1).md`; mantido apenas como registo da primeira fase de aprofundamento.

---

# 0. Diagnóstico — porque é que ainda soa a sonho

O documento v1 resolve um problema difícil: mapeia com rigor o espaço de possibilidades da Entrela, mostra que existe mercado e referência, e desenha uma arquitectura técnica plausível. É um mapa sólido.

Mas um mapa não é um destino. Há três razões concretas para a Entrela ainda parecer mais visão do que produto:

- **Os "casos de uso" são etiquetas, não histórias.** "Aniversário", "pedido de casamento", "activações" são temas — não casos de uso. Um caso de uso real tem situação, sujeito, passo a passo de utilização e resultado.
- **A essência está espalhada em quatro frases diferentes** (secções 2.1, 2.2, 2.3 e 17 da v1), nenhuma suficientemente afiada para caber, sozinha, numa reunião de investidor ou num briefing a alguém novo na equipa.
- **As categorias sobrepõem-se.** Um pedido de casamento é Momentos ou Convites? Um presente corporativo é Presentes ou Empresas? Sem fronteira clara, cada categoria fica vaga por tentar caber em tudo.

Este documento resolve os três problemas: renova a essência numa definição testável, propõe um modelo replicável por categoria, e aplica esse modelo, na íntegra, a Entrela Empresas e Entrela Eventos — como prova de conceito antes de replicar às restantes quatro.

---

# 1. Essência renovada

## 1.1 Definição nuclear

> A Entrela transforma qualquer ponto de contacto físico — um objecto, um convite, um presente, um bilhete, um espaço — numa experiência digital que reage a quem a abre, a quando a abre, e ao que essa pessoa faz.

## 1.2 Posicionamento

A Entrela não vende páginas bonitas. Páginas bonitas fazem-se num gerador de sites em vinte minutos. A Entrela vende uma camada de tempo, regra e resposta por cima de um momento físico — um copo, um convite, uma embalagem, um bilhete, uma placa à entrada de um museu. É essa camada — o motor — que é o produto. Não o QR Code, não o link, não o design. O QR e o link são apenas a porta; quem entra encontra uma experiência que sabe esperar, sabe reagir e sabe evoluir.

## 1.3 O teste das três camadas

Para uma ideia ser "um Entrela" — e não apenas uma página estática — deve ter, no mínimo, uma destas três camadas:

| Camada | Pergunta de teste | Exemplos já mapeados na v1 |
|---|---|---|
| **Tempo** | Muda ou abre consoante uma data, contagem ou sequência? | cápsula do tempo, contagem regressiva, revelação por etapas |
| **Regra** | Reage a uma acção — resposta, código, localização, pagamento, tarefa concluída? | desbloqueio por código, motor de lógica, pontuação |
| **Ligação física** | Nasce de, ou volta a, um ponto físico? | QR em embalagem, NFC em cartão, placa de um percurso |

Sem nenhuma das três camadas, é só uma página — e uma página não precisa da Entrela, precisa de um construtor de sites qualquer. Este teste serve para filtrar pedidos de funcionalidades e para explicar, em dez segundos, o que faz da Entrela um motor e não um construtor de páginas.

## 1.4 O que a Entrela não é

A secção 2.4 da v1 já acerta e mantém-se: a Entrela nunca deve apresentar-se como *apenas* gerador de QR, criador de convites, construtor de páginas, plataforma de jogos, site de buquês, sistema de eventos ou álbum digital. Cada uma dessas é uma porta; nenhuma delas é a casa.

---

# 2. O modelo replicável, categoria a categoria

Cada categoria — Momentos, Presentes, Convites, Eventos, Experiências, Empresas — passa a seguir o mesmo esqueleto, para ficarem comparáveis e nenhuma ficar vaga por preguiça:

1. **Essência da categoria** — a frase que a distingue das outras cinco.
2. **Para quem é, especificamente** — não "empresas", mas "gestora de marketing de uma marca de bebidas em activação de festival".
3. **Casos de uso reais** — situação, passo a passo de utilização, o que o destinatário vive, resultado mensurável.
4. **Jornada** — o percurso de quem cria e de quem recebe, do gatilho ao fim.
5. **Funcionalidades — MVP vs. Depois** — a lista mestra da secção 5 da v1, cortada e priorizada para esta categoria, não copiada inteira.
6. **Fronteira com as outras categorias** — onde acaba esta e começa a seguinte.
7. **Modelo de receita específico** — o que se cobra de facto nesta categoria, não o modelo geral da secção 13.
8. **Exemplo ponta a ponta** — um cenário único, com nomes, números e tempos.

Abaixo, o modelo aplicado às duas categorias que referiste: Entrela Empresas e Entrela Eventos.

---

# 3. ENTRELA EMPRESAS

## 3.1 Essência da categoria

Entrela Empresas transforma cada ponto de contacto de uma marca com o público — uma campanha, uma embalagem, um stand, um cartão de visita — numa origem de dados e relação, não apenas numa impressão bonita.

## 3.2 Para quem é, especificamente

- Gestora ou gestor de marketing de uma marca de consumo (bebidas, cosmética, retalho) a preparar uma activação em feira, festival ou loja.
- Comercial B2B que troca dezenas de contactos em feiras e reuniões e perde o rasto à maioria ao terceiro dia.
- Agência de publicidade que gere campanhas para vários clientes ao mesmo tempo e precisa de white-label.
- Responsável de RH ou formação que precisa de um percurso de onboarding ou certificação interna sem depender de PDFs dispersos por e-mail.
- Empresa industrial ou de electrodomésticos que quer digitalizar manuais e suporte pós-venda sem reimprimir a cada actualização.
- Mediadora imobiliária que quer transformar uma placa "vende-se" numa fonte de leads qualificados.

## 3.3 Casos de uso reais

**Activação de marca num evento**
- Situação: uma marca de bebidas quer gerar interacção e captar contactos num stand de festival, sem depender só de amostras grátis.
- Como usa a Entrela: cria uma página de campanha com um jogo curto (roleta ou pergunta), imprime QR dinâmico nos copos e distribui pulseiras NFC aos primeiros visitantes; o formulário de contacto é o preço de entrada para o prémio.
- O que o visitante vive: aponta o telemóvel, joga em trinta segundos, deixa o número, recebe o prémio e um cupão com prazo.
- Resultado mensurável: leads por canal (copo vs. pulseira vs. cartaz), hora de pico, taxa de conversão do cupão.

**Cartão de visita que não morre numa gaveta**
- Situação: um comercial troca dezenas de cartões numa feira e a maioria fica esquecida.
- Como usa a Entrela: cartão físico com NFC/QR que abre um mini-perfil Entrela Empresas — portfólio, agenda de reunião embutida, botão de contacto directo.
- O que o interlocutor vive: encosta o telemóvel, vê o perfil, marca reunião sem sair da página.
- Resultado mensurável: taxa de reuniões marcadas por cartão distribuído, comparação entre comerciais.

**Manual digital que se actualiza sozinho**
- Situação: uma empresa de electrodomésticos gasta em reimpressões sempre que corrige um manual.
- Como usa a Entrela: QR na embalagem liga a um manual vivo — vídeo de instalação, garantia, pedido de suporte — editável sem tocar na embalagem já impressa.
- O que o cliente vive: em vez de procurar o folheto perdido, aponta o telemóvel e encontra sempre a versão mais recente.
- Resultado mensurável: redução de chamadas de suporte, taxa de registo de garantia.

**Onboarding sem PDF disperso**
- Situação: o RH de uma empresa média perde dias a integrar cada novo colaborador com documentos espalhados por e-mail.
- Como usa a Entrela: percurso com etapas que só desbloqueiam depois de lidas — política interna, vídeos, questionário, aceitação com assinatura simples — a terminar em certificado.
- O que o colaborador vive: um percurso guiado, uma etapa de cada vez, sem se perder em ficheiros.
- Resultado mensurável: tempo médio até concluir o onboarding, taxa de conclusão visível no painel de RH.

**Campanha com conteúdo diferente por loja**
- Situação: uma agência gere uma marca com lojas em várias cidades e quer que o mesmo cartaz sirva conteúdo local.
- Como usa a Entrela: gera QR em massa, cada código redirecciona conforme a loja ou região, o painel compara desempenho loja a loja.
- O que o cliente na loja vive: o mesmo cartaz nacional, mas a promoção e o idioma correspondem à loja onde está.
- Resultado mensurável: comparação de desempenho por loja/região, ajuste de destino sem reimprimir.

## 3.4 Jornada

**Quem cria** (marca, agência ou comercial): define objectivo → escolhe modelo → configura captura de contacto e regra de desbloqueio → gera QR/NFC em massa ou individual → publica → acompanha painel em tempo real → exporta ou integra com CRM.

**Quem recebe** (cliente, lead ou colaborador): encontra o ponto físico → aponta o telemóvel → vive a experiência (jogo, manual, percurso) → deixa, ou não, um dado de contacto → recebe seguimento automático (cupão, agradecimento, próximo passo).

## 3.5 Funcionalidades — MVP vs. Depois

**MVP:** página de campanha (editor por blocos), QR dinâmico individual e em massa, captura de contacto simples com exportação, domínio personalizado, análises básicas (scans, origem, hora), cupão ou código único.

**Depois:** integração directa com CRM e webhooks, white-label completo, gestão de equipa e aprovação de campanhas, API pública, atribuição por canal e comparação entre campanhas, biblioteca de marca e modelos aprovados.

## 3.6 Fronteira com outras categorias

Entrela Empresas serve uma relação contínua entre marca e público — não está amarrada a uma data única. Quando essa relação se concentra numa ocasião com início e fim (uma conferência, um lançamento com data marcada), a operação passa para **Entrela Eventos**. Quando o objectivo é cultural, educativo ou turístico, sem geração de leads como fim principal, é **Entrela Experiências**. Um presente corporativo de fim de ano é **Entrela Presentes** com destinatário empresarial — não Entrela Empresas.

## 3.7 Modelo de receita específico

Assinatura empresarial (equipa, permissões, white-label, API); cobrança por volume de QR gerados em massa; taxa por integração de CRM/automação activa; relatórios e atribuição avançada como extra de plano superior.

## 3.8 Exemplo ponta a ponta

A marca "Savana" activa um stand na Feira Internacional de Luanda. Em vinte minutos, a equipa de marketing cria a página de campanha no Entrela Empresas com uma roleta de prémios e um formulário de duas perguntas — nome e WhatsApp. Imprime quinhentos copos com QR dinâmico e entrega pulseiras NFC aos primeiros cem visitantes. Cada leitura regista hora, zona do stand e prémio ganho. No fim do dia, o painel mostra trezentos e quarenta contactos captados — 61% pelo QR do copo, 39% pela pulseira — com pico entre as 18h e as 20h. A lista segue automaticamente, por webhook, para o CRM da agência, e cada contacto recebe uma mensagem de agradecimento com um cupão válido por sete dias.

---

# 4. ENTRELA EVENTOS

## 4.1 Essência da categoria

Entrela Eventos gere a experiência completa de uma ocasião com início e fim marcados — antes, durante e depois — para quem organiza não precisar de uma ferramenta diferente para cada etapa.

## 4.2 Para quem é, especificamente

- Wedding planner, ou o próprio casal, a organizar um casamento e a precisar de RSVP, mesas e lembretes sem folha de cálculo.
- Empresa ou agência que organiza uma conferência com bilhética paga, várias sessões e networking.
- Escola que organiza feira, formatura ou evento aberto a pais, e precisa de controlar horários e lotação.
- Promotor de evento social ou privado que vende bilhetes e precisa de controlo de acesso por zona.
- Organização comunitária ou religiosa que precisa de inscrição, comunicação por grupo e lembretes.

## 4.3 Casos de uso reais

**Casamento sem folha de cálculo**
- Situação: o casal quer saber, em tempo real, quem confirma presença, restrições alimentares e necessidade de transporte.
- Como usa a Entrela: o convite liga directamente à gestão do evento — RSVP com perguntas próprias, escolha de mesa, lembretes automáticos a sete e a um dia da data, QR de entrada individual.
- O que o convidado vive: confirma num toque, recebe lembrete a caminho da data, mostra o QR à entrada.
- Resultado mensurável: taxa de confirmação em tempo real, lista por restrição alimentar pronta para o catering.

**Conferência com bilhética e networking**
- Situação: uma empresa realiza a conferência anual com bilhetes early bird, standard e VIP, e quer medir participação por sessão.
- Como usa a Entrela: página com tipos de bilhete e códigos promocionais, check-in por QR em cada sala, troca de contactos por QR entre participantes, certificado automático no fim.
- O que o participante vive: entra sem fila com o QR do bilhete, troca contacto apontando o telemóvel a outro participante, recebe certificado por e-mail no dia seguinte.
- Resultado mensurável: ocupação por sessão, número de ligações trocadas, taxa de conversão early bird para standard.

**Feira escolar sem sobrelotação**
- Situação: a escola precisa de organizar horários de visita de pais sem juntar todos à mesma hora.
- Como usa a Entrela: inscrição com escolha de turno, mapa do evento, comunicação separada por grupo — pais, professores, alunos.
- O que o pai ou mãe vive: escolhe o horário que lhe convém, recebe lembrete e mapa no telemóvel.
- Resultado mensurável: distribuição de visitantes por turno, ausência de picos de lotação.

**Festa privada com controlo de zona VIP**
- Situação: o promotor quer vender bilhete geral e VIP e impedir que o bilhete geral aceda à zona VIP.
- Como usa a Entrela: bilhetes com QR diferenciado por tipo, controlo de acesso por zona no check-in, lista de espera automática quando esgota.
- O que o convidado vive: entra pela zona correspondente ao bilhete que comprou, sem confusão à porta.
- Resultado mensurável: lotação em tempo real por zona, no painel do operador.

**A página que não morre no dia seguinte**
- Situação: depois de qualquer evento, o organizador perde o contacto com quem participou.
- Como usa a Entrela: a página do evento transforma-se automaticamente em página de memória — fotografias, agradecimentos, gravações, convite para o próximo evento.
- O que o convidado vive: recebe, dias depois, uma recordação do evento e o primeiro acesso ao seguinte.
- Resultado mensurável: taxa de reengajamento para o evento seguinte.

## 4.4 Jornada

**Antes:** página do evento → registo e bilhetes → comunicação e lembretes → credenciais.
**Durante:** check-in por QR → controlo de zona e lotação → interacção (networking, votação, perguntas) → conteúdo exclusivo por sessão.
**Depois:** certificado → fotografias e gravações → pesquisa de satisfação → página de memória → convite para o próximo evento.

## 4.5 Funcionalidades — MVP vs. Depois

**MVP:** página do evento com RSVP ou bilhetes gratuitos/pagos, lembretes automáticos, check-in por QR, agenda, certificado de presença.

**Depois:** tipos de bilhete e códigos promocionais, controlo de acesso por zona e lotação, networking/troca de contactos por QR, transmissão ao vivo e conteúdo exclusivo por sessão, página de memória automática pós-evento.

## 4.6 Fronteira com outras categorias

Entrela Eventos começa onde o simples convite (Entrela Convites) passa a precisar de operação: bilhética paga, check-in, controlo de acesso, várias sessões. Um jantar entre amigos fica bem em Convites; uma conferência de trezentas pessoas precisa de Eventos.

## 4.7 Modelo de receita específico

Taxa de transacção sobre bilhetes vendidos; assinatura para organizadores recorrentes (agências, promotoras); cobrança acima de um número de participantes no plano gratuito; produtos físicos associados (credenciais, pulseiras NFC).

## 4.8 Exemplo ponta a ponta

A agência "Ponte Eventos" organiza uma conferência de tecnologia para trezentas pessoas em Luanda. Cria a página no Entrela Eventos com três tipos de bilhete — Early Bird, Standard, VIP — e um código promocional para parceiros; nos trinta dias antes, envia quatro lembretes automáticos e publica a agenda com os oradores. No dia, a equipa faz check-in por QR em três entradas ao mesmo tempo — o painel mostra duzentos e oitenta e sete check-ins de trezentos bilhetes vendidos, e avisa de sobrelotação na sala principal às 10h15. Nos intervalos, os participantes trocam contacto apontando o telemóvel uns aos outros, gerando seiscentas e vinte ligações registadas. No fim, cada participante recebe certificado automático, e a página transforma-se em página de memória com fotografias e gravações — usada, semanas depois, para vender a edição do ano seguinte.

---

# 5. Próximos passos

Esta primeira fase foi concluída e expandida na versão completa `entrela-essencia-casos-de-uso-v2 (1).md`, que cobre as seis categorias e deve ser usada para decisões de produto.
