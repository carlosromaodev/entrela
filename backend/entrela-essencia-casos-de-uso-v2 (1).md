# ENTRELA — Essência, Motor e Categorias
## Aprofundamento de Casos de Uso (documento complementar à v1)

**Refere-se a:** ENTRELA — Visão de Produto, Ecossistema e Mapa Completo de Capacidades (v1)
**Data:** 2 de agosto de 2026
**Estado:** Completo — modelo aplicado às 6 categorias (Empresas, Eventos, Momentos, Presentes, Convites, Experiências)

---

# 0. Diagnóstico — porque é que ainda soa a sonho

O documento v1 resolve um problema difícil: mapeia com rigor o espaço de possibilidades da Entrela, mostra que existe mercado e referência, e desenha uma arquitectura técnica plausível. É um mapa sólido.

Mas um mapa não é um destino. Há três razões concretas para a Entrela ainda parecer mais visão do que produto:

- **Os "casos de uso" são etiquetas, não histórias.** "Aniversário", "pedido de casamento", "activações" são temas — não casos de uso. Um caso de uso real tem situação, sujeito, passo a passo de utilização e resultado.
- **A essência está espalhada em quatro frases diferentes** (secções 2.1, 2.2, 2.3 e 17 da v1), nenhuma suficientemente afiada para caber, sozinha, numa reunião de investidor ou num briefing a alguém novo na equipa.
- **As categorias sobrepõem-se.** Um pedido de casamento é Momentos ou Convites? Um presente corporativo é Presentes ou Empresas? Sem fronteira clara, cada categoria fica vaga por tentar caber em tudo.

Este documento resolve os três problemas: renova a essência numa definição testável, propõe um modelo replicável por categoria, e aplica esse modelo, na íntegra, às seis categorias — Entrela Empresas, Entrela Eventos, Entrela Momentos, Entrela Presentes, Entrela Convites e Entrela Experiências — fechando com um mapa de decisão para resolver, de vez, a sobreposição entre elas.

---

# 1. Essência renovada

## 1.1 Definição nuclear

> A Entrela transforma qualquer ponto de contacto físico — um objecto, um convite, um presente, um bilhete, um espaço — numa experiência digital que reage a quem a abre, a quando a abre, e ao que essa pessoa faz.

## 1.2 Posicionamento

A Entrela não vende páginas bonitas. Páginas bonitas fazem-se num gerador de sites em vinte minutos. A Entrela vende uma camada de tempo, regra e resposta por cima de um momento físico — um copo, um convite, uma embalagem, um bilhete, uma placa à entrada de um museu. É essa camada — o motor — que é o produto. Não o QR Code, não o link, não o design. O QR e o link são apenas a porta; quem entra encontra uma experiência que sabe esperar, sabe reagir e sabe evoluir.

## 1.3 Arquitectura de marca e portfólio

**Entrela é a marca-mãe e a plataforma única.** Dentro dela existem seis submarcas/categorias: Entrela Empresas, Entrela Eventos, Entrela Momentos, Entrela Presentes, Entrela Convites e Entrela Experiências.

Cada categoria tem público, objectivo, linguagem comercial e conjunto de funções próprios. Não são seis produtos tecnológicos isolados: todas usam a mesma conta, o mesmo motor de experiências, o mesmo modelo de dados, a mesma camada de publicação e o mesmo sistema de pagamentos. A categoria escolhida define a porta de entrada, os modelos, o painel e as funções expostas — não cria uma base de dados ou uma aplicação paralela.

## 1.4 Base global de lançamento

A primeira versão internacional nasce com **português** e **inglês** em toda a experiência de criação e de recepção. A plataforma deve guardar conteúdo localizável desde o início, sem assumir que uma tradução é apenas uma cópia de texto.

Os pagamentos devem ser integrados através de uma camada de provedores: métodos de pagamento disponíveis em Angola e Stripe. A escolha concreta de cada método angolano, moedas de liquidação, impostos, reembolsos e restantes políticas operacionais será definida numa fase própria, sem bloquear o desenho do domínio agora.

## 1.5 O teste das três camadas

Para uma ideia ser "um Entrela" — e não apenas uma página estática — deve ter, no mínimo, uma destas três camadas:

| Camada | Pergunta de teste | Exemplos já mapeados na v1 |
|---|---|---|
| **Tempo** | Muda ou abre consoante uma data, contagem ou sequência? | cápsula do tempo, contagem regressiva, revelação por etapas |
| **Regra** | Reage a uma acção — resposta, código, localização, pagamento, tarefa concluída? | desbloqueio por código, motor de lógica, pontuação |
| **Ligação física** | Nasce de, ou volta a, um ponto físico? | QR em embalagem, NFC em cartão, placa de um percurso |

Sem nenhuma das três camadas, é só uma página — e uma página não precisa da Entrela, precisa de um construtor de sites qualquer. Este teste serve para filtrar pedidos de funcionalidades e para explicar, em dez segundos, o que faz da Entrela um motor e não um construtor de páginas.

## 1.6 O que a Entrela não é

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

Abaixo, o modelo aplicado às seis categorias, pela ordem: Empresas, Eventos, Momentos, Presentes, Convites e Experiências.

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

# 5. ENTRELA MOMENTOS

## 5.1 Essência da categoria

Entrela Momentos é a camada mais pessoal da Entrela: dá corpo a uma emoção entre pessoas específicas, sem depender de um objecto físico para existir nem de uma lista de convidados para funcionar.

## 5.2 Para quem é, especificamente

- Uma pessoa que quer pedir alguém em namoro ou em casamento com uma narrativa construída, não só um jantar e um anel.
- Alguém que precisa de pedir desculpa e as palavras não chegam por mensagem de texto simples.
- Um grupo de amigos ou família que quer reunir mensagens de várias pessoas para uma ocasião especial — aniversário, reforma, despedida.
- Uma pessoa que quer deixar uma mensagem para o futuro — a um filho, a um parceiro, a si própria — para abrir daqui a anos.
- Alguém que regressa de uma viagem longa ou uma mudança de vida e quer organizar as memórias num só lugar, sem ser um álbum estático do telemóvel.

## 5.3 Casos de uso reais

**Pedido de casamento com narrativa por etapas**
- Situação: uma pessoa quer pedir a outra em casamento de forma memorável, não apenas com um anel e uma pergunta.
- Como usa a Entrela: cria um percurso com cinco ou seis etapas reveladas uma a uma — fotografias da relação, uma pergunta sobre a história dos dois, um vídeo, e só no fim a pergunta "casas comigo?" com contagem regressiva antes de abrir.
- O que a pessoa convidada vive: recebe o link num momento combinado, avança etapa a etapa sem saber o que vem a seguir, chega à revelação no telemóvel enquanto o parceiro está ao lado.
- Resultado mensurável: taxa de conclusão do percurso antes da revelação, tempo até à abertura.

**Pedido de desculpa construído**
- Situação: uma pessoa magoou outra e uma mensagem de texto não chega.
- Como usa a Entrela: página privada com mensagem em vídeo ou áudio, linha do tempo da amizade ou relação, e um espaço para a outra pessoa responder se quiser.
- O que o destinatário vive: abre um link privado, sem pressão pública, ouve ou vê a mensagem ao seu ritmo, pode responder ou não.
- Resultado mensurável: confirmação de abertura — sem obrigar resposta —, o que já é, em si, um sinal de que a mensagem chegou.

**Mural colectivo para uma despedida ou aniversário**
- Situação: um grupo quer reunir mensagens de dezenas de pessoas para alguém que se vai embora ou celebra um marco.
- Como usa a Entrela: o organizador cria a página e convida colaboradores a enviar texto, foto ou vídeo até uma data; modera antes de publicar; revela tudo de uma vez no dia certo.
- O que o homenageado vive: recebe, numa só página, dezenas de mensagens organizadas, reveladas no momento combinado — não uma sequência dispersa de WhatsApp.
- Resultado mensurável: número de contribuições, taxa de visualização depois da revelação.

**Cápsula do tempo entre pais e filhos**
- Situação: os pais querem deixar mensagens para o filho abrir em idades específicas — dez, quinze, dezoito anos.
- Como usa a Entrela: cria mensagens em texto, vídeo ou áudio associadas a datas futuras ou a um aniversário específico; a página só desbloqueia nessa data.
- O que o filho, já crescido, vive: recebe uma notificação no aniversário certo, abre uma mensagem que os pais escreveram anos antes.
- Resultado mensurável: aqui o valor está na entrega certeira, não em números — a métrica relevante é a confirmação de abertura na data certa.

**Retrospectiva de viagem ou de ano**
- Situação: alguém regressa de uma viagem longa ou quer fechar o ano com uma memória organizada, em vez de fotos perdidas na galeria do telemóvel.
- Como usa a Entrela: cria uma linha do tempo com fotos, mapa dos lugares visitados, e mensagens de quem viveu a experiência com essa pessoa.
- O que quem recebe o link vive: percorre a linha do tempo como quem lê uma história, não como quem passa fotos em série.
- Resultado mensurável: tempo médio na página, partilhas do link.

## 5.4 Jornada

**Quem cria:** escolhe a ocasião → escreve ou grava a mensagem → decide se há etapas, data de abertura ou colaboradores → publica um link privado → acompanha se e quando foi aberto.

**Quem recebe:** recebe o link, geralmente por WhatsApp → abre num momento próprio → vive a sequência → pode guardar, responder ou partilhar.

## 5.5 Funcionalidades — MVP vs. Depois

**MVP:** página personalizada, mensagem em texto/áudio/vídeo, contagem regressiva, revelação por etapas, link privado com data de abertura, download da recordação.

**Depois:** linha do tempo da relação, cápsula do tempo com datas múltiplas, mural colectivo com moderação, mapa de memórias, álbum que continua a crescer depois da entrega.

## 5.6 Fronteira com outras categorias

Momentos não exige objecto físico nem lista de convidados — se tirares os dois e a experiência ainda faz sentido, é Momentos. Quando aparece um objecto físico a acompanhar a mensagem (um anel, um ramo, uma caixa), a camada do objecto passa a ser **Entrela Presentes**, mesmo que a mensagem continue a viver num percurso Momentos. Quando é preciso saber quem vem e quem não vem, entra **Entrela Convites**.

## 5.7 Modelo de receita específico

Pagamento único por experiência — o modelo mais comum nesta categoria; assinatura de criador para quem faz vários momentos por ano (datas recorrentes, aniversários de filhos); upsell de armazenamento para vídeo ou áudio de longa duração.

## 5.8 Exemplo ponta a ponta

O Miguel quer pedir a Ana em casamento depois de sete anos juntos. Cria, no Entrela Momentos, um percurso com seis etapas: a primeira fotografia dos dois, uma pergunta sobre onde se conheceram, um vídeo dos pais dela a dar a bênção, e uma contagem regressiva de sessenta segundos antes da última etapa. No sábado à tarde, envia o link enquanto estão os dois no sofá. A Ana avança etapa a etapa, sem saber o que vem a seguir, até chegar à pergunta final — nesse momento exacto, o Miguel ajoelha-se com o anel. O painel do Miguel confirma que todas as etapas foram vistas antes da abertura final, e a página fica guardada como recordação, com um botão para descarregar tudo em vídeo.

---

# 6. ENTRELA PRESENTES

## 6.1 Essência da categoria

Entrela Presentes dá uma segunda camada a um objecto físico: o que seria só uma coisa entregue passa a ter uma história, uma mensagem e, às vezes, uma vida que continua depois da entrega.

## 6.2 Para quem é, especificamente

- Floristas e lojas de presentes que querem diferenciar um buquê ou uma caixa com algo mais do que o cartão de papel habitual.
- Uma pessoa que oferece uma jóia, um relógio ou uma obra de arte e quer juntar a história do objecto e um certificado de autenticidade.
- Uma marca que envia um presente corporativo de fim de ano e quer que o cliente se lembre de quem o enviou, não só do objecto.
- Um casal que distribui lembranças de casamento e quer que cada convidado tenha acesso a uma mensagem de agradecimento e às fotos do dia.
- Uma pessoa que herda ou recebe um objecto de família — jóia, relógio, quadro — e quer registar a história para passar à geração seguinte.

## 6.3 Casos de uso reais

**Buquê com mensagem que sobrevive às flores**
- Situação: as flores murcham em poucos dias, mas a mensagem que as acompanha podia durar mais.
- Como usa a Entrela: a florista cola uma etiqueta QR no buquê, ligada a uma página com a mensagem de quem oferece, em texto, áudio ou vídeo.
- O que quem recebe vive: aponta o telemóvel ao cartão, ouve ou lê a mensagem, pode guardá-la depois de as flores acabarem.
- Resultado mensurável: taxa de abertura da mensagem, tempo entre a entrega e a primeira leitura.

**Jóia ou relógio com certificado e história**
- Situação: uma peça de valor precisa de certificado de autenticidade e, muitas vezes, carrega uma história por trás.
- Como usa a Entrela: página permanente ligada ao objecto por NFC, com certificado, história de quem o deu, e espaço para registar manutenções ao longo dos anos.
- O que o proprietário vive: sempre que precisar do certificado ou quiser reler a história, encosta o telemóvel à peça.
- Resultado mensurável: o valor está na permanência e na prova de autenticidade disponível a qualquer momento, não numa métrica de conversão.

**Presente corporativo que não vai para o lixo com a embalagem**
- Situação: uma empresa envia presentes de fim de ano e a maioria é esquecida junto com o papel de embrulho.
- Como usa a Entrela: QR na embalagem liga a uma mensagem de agradecimento da direcção, personalizada por cliente ou por equipa.
- O que o cliente vive: abre o presente, aponta o telemóvel, vê uma mensagem dirigida a si — não um cartão genérico.
- Resultado mensurável: taxa de abertura por cliente, um sinal indirecto de quem realmente valoriza a relação.

**Lembranças de casamento com acesso às fotos**
- Situação: os convidados recebem uma lembrança física do casamento, mas as fotos e vídeos do dia chegam semanas depois, dispersos.
- Como usa a Entrela: etiqueta QR na lembrança liga a uma página que, mais tarde, se enche de fotos, agradecimentos e o vídeo do dia.
- O que o convidado vive: guarda a lembrança física, e semanas depois recebe um aviso de que a página já tem as fotos.
- Resultado mensurável: visitas à página depois da actualização de conteúdo.

**Objecto de família com memória que passa de geração em geração**
- Situação: uma jóia ou um quadro passa de pais para filhos, e a história oral perde-se com o tempo.
- Como usa a Entrela: página permanente associada ao objecto regista proprietário actual, data de cada transferência, fotografias e histórias associadas.
- O que a geração seguinte vive: ao herdar o objecto, herda também a página com a história completa, não apenas o objecto sem contexto.
- Resultado mensurável: número de transferências registadas ao longo dos anos — a métrica de sucesso é a longevidade, não a conversão.

## 6.4 Jornada

**Quem cria** (quem oferece, ou o lojista em nome de quem oferece): escolhe o objecto → grava a mensagem ou história → gera etiqueta QR ou NFC → cola no objecto ou na embalagem → entrega.

**Quem recebe:** recebe o objecto físico → aponta o telemóvel à etiqueta → vive a mensagem ou história → em alguns casos, confirma recebimento ou responde com agradecimento → o objecto pode manter uma página viva para sempre.

## 6.5 Funcionalidades — MVP vs. Depois

**MVP:** etiqueta QR personalizada, mensagem privada em texto/áudio/vídeo, confirmação de recebimento, NFC opcional, conteúdo desbloqueado só depois da entrega.

**Depois:** certificado de autenticidade, história do objecto com página permanente, registo de proprietário e transferências, manual ou garantia digital, álbum que continua a crescer depois da ocasião.

## 6.6 Fronteira com outras categorias

O teste é simples: existe uma coisa física concreta que se entrega? Se sim, é Presentes — mesmo que a mensagem que a acompanha seja tão emotiva como um Momento. Quando o mesmo objecto é distribuído em massa por uma marca, com captura de lead como objectivo, a operação sobe para **Entrela Empresas**. Quando o presente é entregue durante um evento com lista de convidados, a etiqueta QR pode viver dentro da operação de **Entrela Eventos**.

## 6.7 Modelo de receita específico

Pagamento por etiqueta ou experiência — o modelo mais natural, muitas vezes vendido junto com o objecto físico por floristas, joalharias, lojas; comissão sobre a produção física (etiquetas, cartões, NFC) vendida através de parceiros; assinatura para lojas ou floristas que emitem etiquetas em volume.

## 6.8 Exemplo ponta a ponta

A florista "Jardim da Ilha" vende um buquê com uma etiqueta Entrela Presentes incluída no preço. O cliente grava, em dois minutos no telemóvel, uma mensagem de trinta segundos para a namorada. A etiqueta QR fica presa ao papel do buquê. No dia da entrega, a namorada aponta o telemóvel, ouve a mensagem, e a página fica guardada mesmo depois de as flores murcharem. Uma semana depois, recebe um lembrete — "a tua mensagem continua guardada aqui" — com um convite subtil para a florista, caso queira repetir a experiência.

---

# 7. ENTRELA CONVITES

## 7.1 Essência da categoria

Entrela Convites organiza quem vem e quem não vem a alguma coisa — a peça do convite e a resposta, sem carregar ainda toda a operação de um evento grande.

## 7.2 Para quem é, especificamente

- Um casal a planear o casamento e a precisar de saber, com antecedência, número de convidados, restrições alimentares e transporte.
- Uma família a organizar um jantar, uma festa de aniversário ou um chá de bebé, com convite que chega por WhatsApp em vez de papel.
- Uma empresa a convidar um grupo restrito para uma reunião privada, um lançamento ou uma inauguração, com necessidade de confirmar presença.
- Uma escola ou organização religiosa ou comunitária a enviar uma convocatória com confirmação obrigatória.
- Uma família a organizar um funeral ou homenagem, precisando de comunicar informação sensível com cuidado e sem exposição pública.

## 7.3 Casos de uso reais

**Convite de casamento com informação por grupo**
- Situação: nem todos os convidados precisam da mesma informação — os padrinhos precisam do horário do ensaio, a imprensa não deveria ter acesso ao endereço.
- Como usa a Entrela: convite adaptativo que mostra conteúdo diferente consoante o grupo do convidado — família, padrinhos, convidados gerais —, com RSVP, número de acompanhantes e preferências alimentares.
- O que o convidado vive: recebe um convite com o seu nome, vê só a informação relevante para o seu grupo, confirma presença num toque.
- Resultado mensurável: taxa de confirmação por grupo, prazo médio de resposta.

**Festa de aniversário informal por WhatsApp**
- Situação: alguém organiza uma festa e não quer o peso formal de um convite tradicional, só uma página bonita e rápida de partilhar.
- Como usa a Entrela: convite animado com data, local, mapa e um RSVP simples, partilhado directamente por WhatsApp.
- O que o convidado vive: abre o link, vê o convite, confirma com um toque, sem instalar nada.
- Resultado mensurável: taxa de abertura versus confirmação, canal de partilha mais eficaz.

**Convocatória com confirmação obrigatória**
- Situação: uma organização — escola, igreja, associação — precisa de garantir que uma mensagem chegou e foi confirmada, não apenas enviada.
- Como usa a Entrela: convite com acesso por lista autorizada, confirmação de leitura obrigatória antes de avançar, lembretes automáticos a quem não respondeu.
- O que o destinatário vive: recebe o link e precisa de confirmar leitura para "fechar" a convocatória.
- Resultado mensurável: percentagem de confirmações, lista de pendentes para seguimento manual.

**Homenagem ou funeral com informação sensível**
- Situação: uma família precisa de comunicar local e horário de uma cerimónia sem exposição pública nem confusão.
- Como usa a Entrela: página privada, acessível só por link ou lista de contactos, com informação prática — local, hora, transporte — e espaço opcional para mensagens de condolências.
- O que quem recebe vive: acede a uma página simples e respeitosa, sem precisar de perguntar detalhes a terceiros.
- Resultado mensurável: aqui a métrica relevante não é conversão, é alcance — quantas das pessoas certas viram a informação a tempo.

**Lançamento ou inauguração com convidados segmentados**
- Situação: uma empresa lança um produto ou inaugura um espaço e convida um grupo restrito de parceiros e imprensa.
- Como usa a Entrela: convite com agenda do evento, código de vestuário, e conteúdo diferenciado para imprensa (kit de imprensa) e para parceiros (agenda de reunião).
- O que o convidado vive: recebe um convite que já sabe quem ele é — parceiro ou imprensa — e mostra só o que lhe interessa.
- Resultado mensurável: taxa de confirmação por segmento de convidado.

## 7.4 Jornada

**Quem cria:** escolhe o tipo de convite → define grupos de convidados, se houver → configura RSVP e perguntas → importa ou adiciona a lista de contactos → envia por WhatsApp, SMS ou e-mail → acompanha confirmações em tempo real → envia lembretes.

**Quem recebe:** recebe o convite → abre sem precisar de conta → vê a informação relevante para si → confirma presença e responde a perguntas → recebe lembretes até ao dia.

## 7.5 Funcionalidades — MVP vs. Depois

**MVP:** convite animado, página do evento, RSVP com número de acompanhantes, contagem regressiva, partilha por WhatsApp/SMS/e-mail, lembretes automáticos.

**Depois:** convite adaptativo por grupo, perguntas personalizadas e preferências alimentares, local revelado só a convidados aprovados, controlo de reenvio, integração com calendário, convite individual transferível ou não transferível.

## 7.6 Fronteira com outras categorias

O teste: preciso de saber quem vem e quem não vem? Se sim, é Convites. Enquanto a resposta for só "sim/não" mais algumas perguntas, o convite basta-se a si mesmo. Quando aparece bilhética paga, check-in físico, controlo de acesso por zona ou várias sessões, a operação sobe para **Entrela Eventos** — o convite continua a existir, mas passa a ser a porta de entrada para uma operação maior. Quando a mensagem é mais sobre uma relação do que sobre coordenar presença — um pedido de casamento em vez de um convite para a festa depois do pedido —, volta a ser **Entrela Momentos**.

## 7.7 Modelo de receita específico

Pagamento por experiência — convite único, o caso mais comum para uso pessoal; assinatura de criador para quem organiza vários eventos por ano (agências pequenas, wedding planners); upsell de modelos premium de convite animado.

## 7.8 Exemplo ponta a ponta

A Sara e o João preparam o casamento e criam o convite no Entrela Convites três meses antes da data. Configuram três grupos — família, padrinhos, convidados gerais — cada um com informação diferente: os padrinhos veem o horário do ensaio, a família vê o endereço da cerimónia religiosa, todos veem o local da festa. Enviam o link a cento e oitenta convidados por WhatsApp. Ao fim de duas semanas, o painel mostra cento e quarenta confirmações, doze recusas e vinte e oito por responder; enviam um lembrete automático aos que faltam. Uma semana antes, exportam a lista final com restrições alimentares directamente para o buffet — sem uma única folha de cálculo manual.

---

# 8. ENTRELA EXPERIÊNCIAS

## 8.1 Essência da categoria

Entrela Experiências transforma um espaço físico — um museu, uma cidade, um parque, uma escola — num percurso guiado que se explora com o telemóvel, sem geração de leads nem coordenação de convidados como objectivo principal.

## 8.2 Para quem é, especificamente

- Um museu ou centro de exposições que quer substituir o áudio-guia físico, caro de manter, por um percurso no telemóvel do visitante.
- Uma câmara municipal ou operador turístico que quer criar um percurso histórico pela cidade, com pontos de interesse e histórias em cada paragem.
- Um hotel ou resort que quer oferecer um guia interactivo das instalações e da região aos hóspedes.
- Uma escola ou universidade que quer criar um percurso de acolhimento para novos alunos, com missões e pontos pelo campus.
- Um centro comercial ou parque que quer gamificar a visita com missões e recompensas em diferentes lojas ou zonas.

## 8.3 Casos de uso reais

**Museu sem áudio-guia físico**
- Situação: um museu paga pela manutenção de dezenas de aparelhos de áudio-guia, muitos avariados ou desactualizados.
- Como usa a Entrela: cada sala tem um QR ou ponto NFC que abre o conteúdo daquela peça — texto, áudio, imagens — em várias línguas, no telemóvel do próprio visitante.
- O que o visitante vive: percorre o museu ao seu ritmo, ouve a explicação na sua língua, sem esperar por um aparelho na recepção.
- Resultado mensurável: percurso mais visitado, tempo médio por sala, línguas mais usadas.

**Percurso histórico pela cidade**
- Situação: uma câmara municipal quer promover o centro histórico sem depender de guias humanos disponíveis só em horários fixos.
- Como usa a Entrela: percurso por GPS com pontos de interesse, cada um a desbloquear uma história curta ao chegar ao local certo.
- O que o turista vive: segue o mapa no telemóvel, recebe a história exactamente quando chega a cada ponto, sem precisar de reserva prévia.
- Resultado mensurável: percursos concluídos versus iniciados, pontos onde mais gente desiste.

**Guia interactivo de hotel ou resort**
- Situação: um hotel quer que os hóspedes conheçam as instalações e a região sem depender só da recepção.
- Como usa a Entrela: QR no quarto liga a um guia com horários do restaurante, mapa das instalações e sugestões da região, disponível em várias línguas.
- O que o hóspede vive: em vez de ligar para a recepção, aponta o telemóvel e encontra a resposta.
- Resultado mensurável: secções mais consultadas, redução de chamadas à recepção.

**Acolhimento de novos alunos no campus**
- Situação: uma universidade recebe centenas de novos alunos por ano e o acolhimento presencial é caro de repetir.
- Como usa a Entrela: percurso com missões pelo campus — encontrar a biblioteca, a cantina, o gabinete de apoio — com certificado no fim.
- O que o aluno vive: explora o campus de forma activa, em vez de só ouvir uma apresentação, e ganha um certificado de conclusão.
- Resultado mensurável: taxa de conclusão do percurso, tempo médio até concluir.

**Centro comercial ou parque gamificado**
- Situação: um centro comercial quer aumentar o tempo de permanência e a visita a mais lojas.
- Como usa a Entrela: missões que levam o visitante a diferentes lojas ou zonas, com recompensas ou cupões no fim.
- O que o visitante vive: cumpre missões pelo espaço, desbloqueando cupões reais em lojas parceiras.
- Resultado mensurável: número de lojas visitadas por missão concluída, cupões resgatados.

## 8.4 Jornada

**Quem cria** (museu, câmara, hotel, escola, centro comercial): define os pontos de interesse → associa conteúdo a cada QR, NFC ou coordenada GPS → escolhe se há missões, questionário ou apenas conteúdo livre → publica → acompanha análises por ponto.

**Quem vive a experiência:** chega ao espaço físico → segue o percurso ou explora livremente → desbloqueia conteúdo em cada ponto → conclui, ou não, o percurso → pode receber certificado ou recompensa no fim.

## 8.5 Funcionalidades — MVP vs. Depois

**MVP:** conteúdo por QR, pontos de interesse em português e inglês, modo individual, questionários simples.

**Depois:** percursos por GPS, áudio-guia, modo equipa, modo offline parcial e de baixo consumo de dados, certificados, recompensas e cupões, realidade aumentada.

## 8.6 Fronteira com outras categorias

O teste: isto é um lugar que se explora, mais do que uma pessoa que se convida ou um objecto que se oferece? Se sim, é Experiências. Quando o mesmo tipo de percurso é usado por uma marca com o objectivo principal de captar leads, e não de explicar um espaço, a operação é **Entrela Empresas**.

## 8.7 Modelo de receita específico

Assinatura para instituições — museus, câmaras, hotéis — com número de percursos ou visitantes incluído; licenciamento por percurso vendido a operadores turísticos; cobrança por certificado emitido em contextos educativos.

## 8.8 Exemplo ponta a ponta

Um museu em Luanda substitui os áudio-guias físicos por um percurso Entrela Experiências. Cada sala tem um QR discreto junto às peças principais. Um visitante estrangeiro aponta o telemóvel à primeira peça, escolhe inglês, e ouve uma explicação de noventa segundos; ao longo da visita, desbloqueia oito peças em três salas diferentes. No fim, o painel do museu mostra que a Sala 2 é a mais visitada e que 73% dos visitantes escolhem português e 27% inglês — informação que antes não existia com o áudio-guia físico.

---

# 9. Mapa de decisão entre categorias

Com as seis categorias definidas, esta sequência resolve qualquer dúvida sobre onde uma ideia nova deve viver:

1. **Preciso de saber quem vem e quem não vem?**
   - Não → segue para a pergunta 2.
   - Sim, com bilhética paga, check-in ou várias sessões → **Entrela Eventos**.
   - Sim, e basta um RSVP simples → **Entrela Convites**.
2. **Existe um objecto físico que se entrega?** → **Entrela Presentes**.
3. **É sobre uma relação ou emoção entre pessoas específicas, sem objecto nem lista de convidados?** → **Entrela Momentos**.
4. **É uma relação contínua entre uma marca e o público em geral, sem data única?** → **Entrela Empresas**.
5. **É um espaço físico para explorar, sem geração de leads como objectivo principal?** → **Entrela Experiências**.

Uma ideia pode passar por mais do que uma categoria ao longo do tempo — um pedido de casamento (Momentos) pode levar a um anel com etiqueta (Presentes), que leva ao convite da festa (Convites), que cresce para uma operação com bilhética (Eventos). O motor é o mesmo; muda só a camada que está activa em cada etapa.

---

# 10. Síntese e próximos passos

As seis categorias — Momentos, Presentes, Convites, Eventos, Experiências, Empresas — têm agora essência própria, casos de uso reais, fronteiras claras entre si, e um exemplo que se pode testar amanhã. O mapa de decisão da secção 9 resolve a sobreposição que motivou este documento.

A arquitectura está decidida: Entrela é a marca-mãe; as seis categorias são submarcas de entrada para públicos e objectivos diferentes, apoiadas por um único motor e um único domínio de dados. A base internacional começa em português e inglês, com uma camada de pagamentos preparada para métodos angolanos e Stripe.

Os próximos artefactos de produto já estão definidos em [especificações de implementação](./especificacoes/README.md): o domínio e dados canónicos, o primeiro MVP navegável de Entrela Momentos, o motor de regras partilhado e a arquitectura de implementação do backend. A consolidação com a v1 deve manter a pesquisa de mercado, segurança e roadmap da v1, usando este documento como fonte de verdade para essência, arquitectura de portfólio e categorias.
