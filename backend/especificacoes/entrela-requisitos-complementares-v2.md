# ENTRELA — Especificação de Requisitos (fonte complementar v2)

**Refere-se a:** ENTRELA — Visão de Produto (v1) e Essência, Motor e Categorias (v2)
**Data:** 3 de agosto de 2026
**Estado:** documento de origem, fundido no documento canónico único de [requisitos consolidados](./requisitos/README.md)

> Este ficheiro preserva o texto original recebido, com a numeração própria do autor (`RF-NUC`, `RF-[CAT]`, `RNF-[TEMA]`, `RN-[TEMA]`). Essa numeração **não é** a numeração canónica do projecto — serviu apenas de matéria-prima. A numeração canónica, com evidência e rastreabilidade real, vive exclusivamente na pasta [requisitos/](./requisitos/). Consultar o mapa de fusão em [requisitos/README.md](./requisitos/README.md) para saber onde cada item deste ficheiro foi integrado.

---

# 0. Introdução

Este documento traduz a essência, as categorias e o motor da Entrela num conjunto formal de Requisitos Funcionais (RF), Requisitos Não-Funcionais (RNF) e Regras de Negócio (RN). É o documento que qualquer ferramenta de geração de código — Claude Code, Cursor, ou outra — deve receber antes de escrever a primeira linha, para que o vibecode resultante respeite a arquitectura, não apenas a estética.

**Convenção de identificadores (deste ficheiro de origem):**
- `RF-NUC-##` — requisito funcional do núcleo (Entrela Engine, partilhado por todas as categorias).
- `RF-[CAT]-##` — requisito funcional específico de categoria: `MOM` (Momentos), `PRE` (Presentes), `CON` (Convites), `EVE` (Eventos), `EXP` (Experiências), `EMP` (Empresas).
- `RNF-[TEMA]-##` — requisito não-funcional, agrupado por tema.
- `RN-[TEMA]-##` — regra de negócio, agrupada por tema.

Cada requisito deve ser rastreável: ao construir, cada função, tabela ou endpoint deve apontar para pelo menos um ID desta lista. Se não apontar para nenhum, ou é uma omissão deste documento, ou é scope creep.

---

# 1. RF do Núcleo (Entrela Engine)

## 1.1 Editor de experiências

**RF-NUC-001** — O sistema deve fornecer um editor visual por blocos, utilizável em telemóvel e em computador, com pré-visualização fiel em diferentes tamanhos de ecrã antes de publicar.
**RF-NUC-002** — O editor deve oferecer modelos prontos por categoria e por caso de uso, com temas de cores e tipografia aplicáveis a qualquer modelo, e uma biblioteca de componentes reutilizáveis.
**RF-NUC-003** — O sistema deve manter histórico de versões de cada Experiência, com possibilidade de desfazer e restaurar alterações.
**RF-NUC-004** — O utilizador deve poder duplicar qualquer Experiência própria como ponto de partida para uma nova.
**RF-NUC-005** — Contas de equipa devem suportar edição colaborativa e um fluxo de aprovação opcional antes de publicar.
**RF-NUC-006** — O sistema deve suportar domínio ou subdomínio personalizado por Experiência ou por conta, e permitir inserção de scripts/integrações apenas em contas profissionais.
**RF-NUC-007** — O editor deve oferecer um "modo simples" (guiado, por modelo) e um "modo avançado" (blocos e regras livres), seleccionável pelo utilizador.

## 1.2 Blocos de conteúdo

**RF-NUC-008** — O sistema deve suportar os seguintes tipos de bloco de conteúdo, cada um com propriedades de edição próprias: texto, título, fotografia, galeria, vídeo, áudio, mensagem de voz, música de fundo, documento PDF, botão, link, mapa/localização, contagem regressiva, calendário, agenda, perfil de pessoa, lista, linha do tempo, comparação antes/depois, carrossel, ficheiro para download, contacto, redes sociais, transmissão ao vivo e conteúdo incorporado de serviços externos.
**RF-NUC-009** — Cada bloco de conteúdo deve poder ser reordenado, duplicado, ocultado condicionalmente (ver Motor de lógica) e removido sem afectar os restantes blocos.

## 1.3 Blocos de interacção

**RF-NUC-010** — O sistema deve suportar blocos de recolha simples: formulário, pergunta aberta, escolha múltipla, votação, confirmação de presença (RSVP), lista de espera, comentários, livro de visitas, envio de fotografia/vídeo/áudio, assinatura digital simples, reacções, chat, perguntas e respostas, mural colaborativo, avaliação da experiência.
**RF-NUC-011** — O sistema deve suportar um bloco de pagamento, capaz de processar cobrança única, associá-la a uma Experiência, bilhete ou reserva, e registar o estado da transacção (ver RN-PAG).
**RF-NUC-012** — O sistema deve suportar blocos de doação, pedido de orçamento, reserva e escolha de horário, cada um com o seu próprio ciclo de estados (pendente, confirmado, cancelado).

## 1.4 Motor de lógica e regras

**RF-NUC-013** — O motor de regras deve suportar condições de **tempo**: esconder ou revelar conteúdo até/a partir de uma data, contagem regressiva, e activação/expiração programadas de uma Experiência ou bloco.
**RF-NUC-014** — O motor de regras deve suportar condições de **acção**: desbloquear conteúdo por código, por QR específico, por localização, por conclusão de tarefa, por número mínimo de participantes ou por pagamento confirmado.
**RF-NUC-015** — O motor de regras deve suportar lógica condicional: mostrar um bloco com base numa resposta anterior, criar caminhos narrativos diferentes, definir respostas correctas/incorrectas e criar finais alternativos.
**RF-NUC-016** — O motor de regras deve suportar mecânicas de progressão: atribuir e retirar pontos, controlar tentativas, aplicar penalizações de tempo, criar equipas e rankings, definir inventário virtual e entregar objectos digitais.
**RF-NUC-017** — O sistema deve registar toda decisão relevante tomada por um participante dentro de uma Experiência, para relatórios e para permitir randomizar percursos ou perguntas sem perder rastreabilidade.

## 1.5 Publicação e acesso

**RF-NUC-018** — O sistema deve suportar publicação por link público, link privado, código QR (estático e dinâmico), NFC e código curto.
**RF-NUC-019** — O sistema deve suportar controlo de acesso por palavra-passe, acesso único, número limitado de acessos, lista de convidados autorizados, autenticação por e-mail/telefone, acesso por bilhete e acesso por equipa.
**RF-NUC-020** — O sistema deve suportar estados especiais de publicação: página de manutenção, página de espera antes da abertura programada, e redireccionamento automático depois do encerramento.
**RF-NUC-021** — Um QR dinâmico deve poder ter o destino alterado depois de impresso, sem exigir um novo código físico.

## 1.6 Contas, equipas e permissões

**RF-NUC-022** — Cada Utilizador deve ter uma Conta pessoal criada automaticamente, e poder pertencer a uma ou mais Contas de equipa (empresa ou agência) com papéis diferenciados: proprietário, editor, aprovador, leitor.
**RF-NUC-023** — Contas de equipa devem suportar white-label (remoção da marca Entrela) e integrações por API/webhook, restritas ao plano empresarial.

## 1.7 Análises e métricas

**RF-NUC-024** — O sistema deve registar, por Experiência: visualizações, visitantes únicos, scans de QR, origem do acesso, hora e dia, região aproximada, tipo de dispositivo, taxa de conclusão, tempo médio, abandono por etapa, respostas, conversão, partilhas, contribuições, pagamentos, check-ins e participação por equipa.
**RF-NUC-025** — O sistema deve permitir exportação de análises e de listas de contacto/resposta em formato reutilizável (CSV, no mínimo), e integração por webhook para automações externas.

## 1.8 Painéis

**RF-NUC-026** — O sistema deve fornecer, no mínimo, quatro painéis distintos: painel do criador, painel do organizador (lotação, zonas, ocorrências, comunicação, relatórios), painel do parceiro (clientes, comissões, produção física, desempenho) e painel administrativo (utilizadores, conteúdos, denúncias, pagamentos, auditoria, segurança, configuração global).

---

# 2. RF por Categoria

## 2.1 Entrela Momentos

**RF-MOM-001** — O utilizador deve poder criar uma página personalizada com mensagem em texto, áudio ou vídeo, dirigida a um destinatário específico.
**RF-MOM-002** — O sistema deve suportar revelação por etapas configurável (sequência de blocos que só avança quando o anterior é visto) e contagem regressiva antes da etapa final.
**RF-MOM-003** — O sistema deve suportar cápsula do tempo: conteúdo associado a uma data futura específica, inacessível até essa data, mesmo ao próprio criador.
**RF-MOM-004** — O sistema deve suportar mural colectivo: um organizador convida colaboradores a submeter conteúdo até um prazo, modera antes de publicar, e revela tudo de uma vez numa data marcada.
**RF-MOM-005** — O destinatário deve poder descarregar a experiência, ou o essencial dela, como ficheiro de recordação (PDF ou vídeo) depois de a visualizar.
**RF-MOM-006** — O sistema deve confirmar ao criador se e quando a experiência foi aberta, sem exigir resposta do destinatário.

## 2.2 Entrela Presentes

**RF-PRE-001** — O sistema deve gerar uma etiqueta QR, e opcionalmente NFC, associada a um objecto físico, vinculada a uma página de mensagem privada.
**RF-PRE-002** — O sistema deve suportar bloqueio de conteúdo até confirmação de entrega/recebimento pelo destinatário.
**RF-PRE-003** — O sistema deve suportar uma página permanente por objecto, capaz de acumular ao longo do tempo: certificado de autenticidade, história do objecto, manual/garantia, fotografias e registo de manutenções.
**RF-PRE-004** — O sistema deve suportar registo de transferência de propriedade de um objecto, com data e novo proprietário, preservando o histórico anterior.
**RF-PRE-005** — O sistema deve permitir que o destinatário envie uma mensagem de agradecimento de volta ao ofertante, associada à mesma página.

## 2.3 Entrela Convites

**RF-CON-001** — O sistema deve suportar RSVP com número de acompanhantes, perguntas personalizadas (ex.: restrição alimentar) e prazo de resposta.
**RF-CON-002** — O sistema deve suportar convite adaptativo: mostrar informação diferente consoante o grupo atribuído ao convidado (ex.: família, padrinhos, imprensa), a partir da mesma Experiência.
**RF-CON-003** — O sistema deve enviar lembretes automáticos configuráveis aos convidados que ainda não confirmaram.
**RF-CON-004** — O sistema deve suportar convite individual nominal, com opção de o tornar transferível ou não transferível.
**RF-CON-005** — O criador deve poder exportar a lista de confirmados, recusas e pendentes, filtrada por grupo e por resposta a perguntas personalizadas.
**RF-CON-006** — O sistema deve suportar partilha directa por WhatsApp, SMS e e-mail, com pré-visualização do conteúdo antes do envio.

## 2.4 Entrela Eventos

**RF-EVE-001** — O sistema deve suportar múltiplos tipos de bilhete (ex.: early bird, standard, VIP) com preços e quantidades independentes, e códigos promocionais.
**RF-EVE-002** — O sistema deve suportar check-in por leitura de QR em múltiplos pontos de entrada simultâneos, com o estado do bilhete a actualizar-se em tempo real em todos os pontos.
**RF-EVE-003** — O sistema deve suportar controlo de acesso por zona (ex.: geral vs. VIP), impedindo um bilhete de aceder a uma zona não incluída no seu tipo.
**RF-EVE-004** — O sistema deve suportar lista de espera automática quando um tipo de bilhete esgota, com notificação em caso de desistência.
**RF-EVE-005** — O sistema deve suportar troca de contacto entre participantes por leitura de QR pessoal, registando a ligação para ambas as partes.
**RF-EVE-006** — O sistema deve emitir certificado de presença automático a quem fez check-in, no fim do evento.
**RF-EVE-007** — A página do evento deve poder transformar-se automaticamente, após a data, em página de memória (fotografias, gravações, agradecimentos), sem exigir nova configuração manual.

## 2.5 Entrela Experiências

**RF-EXP-001** — O sistema deve associar conteúdo (texto, áudio, imagem) a pontos de interesse fixos, activados por QR, NFC ou proximidade GPS.
**RF-EXP-002** — O sistema deve suportar percurso guiado por GPS, com desbloqueio de conteúdo ao chegar a cada ponto e registo de percursos concluídos vs. iniciados.
**RF-EXP-003** — O sistema deve suportar modo individual e modo equipa para a mesma experiência, com pontuação e ranking quando aplicável.
**RF-EXP-004** — O sistema deve suportar missões — uma sequência de pontos a visitar — com certificado ou recompensa/cupão no fim.
**RF-EXP-005** — O sistema deve suportar múltiplos idiomas seleccionáveis pelo visitante para o mesmo percurso, sem exigir percursos duplicados.
**RF-EXP-006** — O sistema deve suportar modo de baixo consumo de dados e funcionamento parcialmente offline (conteúdo pré-carregado) para locais com fraca cobertura.

## 2.6 Entrela Empresas

**RF-EMP-001** — O sistema deve suportar geração de QR em massa (lote), cada código com destino e identificador rastreável independentes.
**RF-EMP-002** — O sistema deve suportar captura de contacto configurável (campos livres definidos pelo criador) como condição de acesso a um conteúdo ou prémio.
**RF-EMP-003** — O sistema deve suportar exportação e integração automática (webhook/API) dos contactos capturados para sistemas de CRM externos.
**RF-EMP-004** — O sistema deve suportar percursos de onboarding/certificação com etapas sequenciais de leitura obrigatória, terminando em certificado.
**RF-EMP-005** — O sistema deve suportar redireccionamento de um mesmo QR consoante a loja, região ou idioma de origem do acesso.
**RF-EMP-006** — O painel de campanha deve comparar desempenho entre canais (ex.: QR vs. NFC vs. link) e entre lojas/regiões, para a mesma campanha.
**RF-EMP-007** — Contas empresariais devem suportar aprovação de campanha antes de publicação e biblioteca de marca (modelos, cores, logótipo) partilhada pela equipa.

---

# 3. Requisitos Não-Funcionais (RNF)

## 3.1 Desempenho

**RNF-PERF-01** — Uma página de Experiência publicada deve apresentar conteúdo visível em menos de 2 segundos em ligação 4G, e menos de 4 segundos em 3G.
**RNF-PERF-02** — A leitura de um QR/NFC até à resolução do destino não deve exceder 500 ms sob carga normal.
**RNF-PERF-03** — O painel de análises deve actualizar contadores de scans e check-ins com atraso de poucos segundos durante eventos ao vivo, não em lote diário.

## 3.2 Escalabilidade e capacidade

**RNF-ESC-01** — O sistema deve suportar picos de leitura simultânea de QR compatíveis com check-in de eventos de várias centenas de participantes em poucos minutos, sem degradação perceptível.
**RNF-ESC-02** — A geração de QR em massa deve suportar lotes de milhares de códigos numa única operação, processados de forma assíncrona com notificação de conclusão.
**RNF-ESC-03** — O motor de regras deve ser desenhado para reutilização entre categorias: uma categoria futura deve poder ser implementada compondo blocos e regras já existentes, sem reescrever o núcleo.

## 3.3 Disponibilidade e resiliência

**RNF-DISP-01** — O check-in de eventos e a leitura de QR/NFC devem manter-se operacionais mesmo com degradação parcial de outros serviços, como análises ou exportações.
**RNF-DISP-02** — O sistema deve ter cópias de segurança regulares e um plano de recuperação documentado, com objectivo de perda de dados mínima.
**RNF-DISP-03** — Uma falha na geração de certificado, actualização de painel ou envio de lembrete não deve impedir nem atrasar o check-in ou o acesso à Experiência.

## 3.4 Segurança

**RNF-SEG-01** — Todo o identificador exposto publicamente (link, código QR, código curto) deve ser suficientemente longo e aleatório para resistir a adivinhação ou enumeração.
**RNF-SEG-02** — Toda a comunicação entre cliente e servidor deve ser encriptada em trânsito.
**RNF-SEG-03** — Acessos a páginas privadas devem expirar segundo a regra definida pelo criador (data, número de acessos, ou nunca), validada no servidor — nunca apenas ocultada na interface.
**RNF-SEG-04** — O sistema deve manter registo de auditoria de acções administrativas e de acesso a dados sensíveis: quem, quando, o quê.
**RNF-SEG-05** — O sistema deve limitar tentativas de acesso por código/palavra-passe, com bloqueio ou atraso progressivo após falhas repetidas.
**RNF-SEG-06** — Bilhetes e convites devem incluir mecanismo de prevenção de falsificação — assinatura do QR e validação server-side no check-in, não apenas leitura visual.

## 3.5 Privacidade e protecção de dados

**RNF-PRIV-01** — Análises não devem expor localização exacta nem dados sensíveis sem consentimento explícito do participante; localização aproximada (região) é o padrão.
**RNF-PRIV-02** — O criador de uma Experiência deve poder exportar e eliminar os dados que recolheu; participantes devem poder solicitar eliminação dos seus próprios dados.
**RNF-PRIV-03** — Conteúdo privado (Momentos, homenagens) nunca deve ser indexável por motores de busca nem listável publicamente.
**RNF-PRIV-04** — Dados de menores exigem tratamento reforçado: sem geolocalização exacta, sem partilha com terceiros, com consentimento parental sinalizável.

## 3.6 Usabilidade

**RNF-USA-01** — Um destinatário, não criador, nunca deve precisar de criar conta para ver, responder ou confirmar presença numa Experiência.
**RNF-USA-02** — O editor deve ser utilizável de forma completa a partir de um telemóvel, sem exigir computador para nenhuma função do modo simples.
**RNF-USA-03** — Mensagens de erro voltadas para o destinatário (ex.: link expirado, bilhete inválido) devem ser claras e nunca expor detalhes técnicos internos.

## 3.7 Acessibilidade

**RNF-ACC-01** — As páginas devem cumprir contraste adequado, suportar tamanho de texto ajustável, navegação por teclado e leitura por tecnologias assistivas.
**RNF-ACC-02** — Vídeo deve suportar legendas, áudio deve suportar transcrição, imagens devem suportar texto alternativo.
**RNF-ACC-03** — O sistema deve oferecer opção de reduzir animações para utilizadores sensíveis a movimento.

## 3.8 Compatibilidade

**RNF-COMP-01** — As Experiências devem funcionar em navegadores móveis comuns sem exigir instalação de aplicação.
**RNF-COMP-02** — O sistema deve oferecer um modo de baixo consumo de dados — imagens comprimidas, sem vídeo automático — para Empresas e Experiências.

## 3.9 Internacionalização e localização

**RNF-I18N-01** — Percursos de Entrela Experiências devem suportar múltiplos idiomas configuráveis pelo criador, seleccionáveis pelo visitante.
**RNF-I18N-02** — Datas, horas e moeda devem respeitar o formato local do utilizador.

## 3.10 Manutenibilidade e observabilidade

**RNF-MAN-01** — Cada bloco de conteúdo, bloco de interacção e regra deve ser implementado como componente independente e reutilizável entre categorias — nenhuma categoria deve ter cópia divergente de um bloco partilhado.
**RNF-MAN-02** — O sistema deve emitir métricas e logs suficientes para diagnosticar falhas de check-in ou pagamento em produção, sem depender de reprodução manual.

---

# 4. Regras de Negócio (RN)

## 4.1 Ciclo de vida da Experiência e fronteiras entre categorias

**RN-NUC-01** — Toda a Experiência pertence, desde a criação, a exactamente uma categoria; a categoria pode ser alterada manualmente pelo criador, mas nunca inferida automaticamente sem confirmação.
**RN-NUC-02** — Uma Experiência de categoria Convites que activa bilhética paga, check-in ou mais do que uma sessão é sinalizada ao criador como candidata a migrar para Eventos — nunca migra sozinha.
**RN-NUC-03** — Uma Experiência só pode ser publicada depois de ter, no mínimo, um bloco de conteúdo e um método de publicação/acesso definidos.
**RN-NUC-04** — Uma Experiência em rascunho nunca é acessível por link, QR ou NFC, mesmo que o código já tenha sido gerado antecipadamente.
**RN-NUC-05** — Alterar o conteúdo de uma Experiência já publicada e partilhada não gera um novo link/QR, salvo pedido explícito do criador — para permitir correcções sem invalidar códigos já impressos.

## 4.2 Regras específicas por categoria

**Momentos**
**RN-MOM-01** — Uma cápsula do tempo não pode ter data de abertura no passado no momento da criação.
**RN-MOM-02** — Conteúdo de um mural colectivo só é visível ao destinatário depois de atingido o prazo definido, ou de o organizador forçar a revelação manualmente.
**RN-MOM-03** — Contribuições a um mural colectivo entram em moderação por definição — nunca ficam visíveis automaticamente sem aprovação do organizador.

**Presentes**
**RN-PRE-01** — A confirmação de recebimento de um Presente só pode ser accionada pelo destinatário (leitura do QR/NFC no objecto), nunca pelo criador em nome do destinatário.
**RN-PRE-02** — A transferência de propriedade de um objecto com certificado de autenticidade exige confirmação de ambas as partes: proprietário actual e novo proprietário.

**Convites**
**RN-CON-01** — Um convidado só vê o grupo/segmento que lhe foi atribuído; nunca deve conseguir aceder a conteúdo de outro grupo através do mesmo link, mesmo por alteração de parâmetros.
**RN-CON-02** — Uma recusa de RSVP é definitiva por padrão; alterar para "confirmado" depois de recusar exige novo convite ou acção explícita do organizador.

**Eventos**
**RN-EVE-01** — Um bilhete só pode ser usado para check-in uma vez; uma segunda leitura do mesmo QR é recusada e sinalizada ao operador como possível duplicação ou fraude.
**RN-EVE-02** — Um bilhete de zona geral nunca dá acesso a zona VIP, independentemente da ordem de leitura no check-in.
**RN-EVE-03** — Cancelamento de um bilhete pago segue a política de reembolso definida pelo organizador no momento da venda — a Entrela não impõe uma política única global.
**RN-EVE-04** — A transformação automática da página do evento em página de memória só ocorre depois da data/hora de fim do evento, nunca antes.

**Experiências**
**RN-EXP-01** — Um percurso por GPS só desbloqueia o conteúdo do ponto seguinte quando a localização do visitante confirma proximidade real — não deve ser possível avançar por adivinhação da sequência sem estar no local.
**RN-EXP-02** — Certificados emitidos em contexto educativo registam a data e, quando aplicável, são verificáveis externamente por link único de validação.

**Empresas**
**RN-EMP-01** — Um QR de campanha empresarial só entrega o prémio/conteúdo depois de o formulário de contacto mínimo ser submetido, quando esse formulário estiver configurado como obrigatório.
**RN-EMP-02** — Dados de contacto capturados numa campanha pertencem à conta empresarial que criou a campanha, não à Entrela; exportação e eliminação são sempre possíveis pelo dono da conta.
**RN-EMP-03** — White-label só é activável em contas de plano empresarial; nenhuma conta gratuita ou de criador individual pode remover a marca Entrela.

## 4.3 Regras de segurança e controlo de acesso

**RN-SEG-01** — Toda a leitura, escrita ou exportação de dados de uma Experiência deve validar que quem pede pertence à Conta dona dessa Experiência, ou tem token de acesso de destinatário válido — nunca confiar apenas num identificador no pedido.
**RN-SEG-02** — Um destinatário ou participante anónimo nunca deve conseguir, por manipulação de parâmetros ou de identificador, listar ou aceder a outras Experiências do mesmo criador.
**RN-SEG-03** — Acções administrativas exigem papel de administrador validado no servidor a cada pedido, não apenas no carregamento inicial da sessão.
**RN-SEG-04** — Denúncias de conteúdo suspendem a visibilidade pública do conteúdo denunciado até revisão, sem eliminação automática, para permitir contestação.

## 4.4 Regras de dados, retenção e privacidade

**RN-DAD-01** — Cápsulas do tempo e conteúdo com data de abertura futura são preservados independentemente do estado de subscrição do criador nessa data — não podem expirar por falta de pagamento antes da data marcada.
**RN-DAD-02** — Ao eliminar uma Conta, Experiências de Momentos e Presentes com destinatário confirmado ficam disponíveis para exportação durante um período de aviso antes da eliminação definitiva.
**RN-DAD-03** — Dados de check-in e bilhética de um Evento são retidos por um período mínimo após o evento, para efeitos de disputa ou reembolso, antes de poderem ser eliminados a pedido.

## 4.5 Regras de pagamento, reembolso e facturação

**RN-PAG-01** — Nenhum conteúdo protegido por pagamento é libertado antes da confirmação do gateway de pagamento — nunca por confirmação apenas do lado do cliente.
**RN-PAG-02** — Comissões de marketplace e taxas de transacção são calculadas e registadas no momento da transacção, não recalculadas retroactivamente.
**RN-PAG-03** — Reembolsos de bilhetes cancelam automaticamente o acesso de check-in associado a esse bilhete.

## 4.6 Regras de moderação e confiança

**RN-MOD-01** — Conteúdo submetido por terceiros (murais colectivos, comentários, livro de visitas) é sempre atribuível ao seu autor e removível individualmente pelo organizador, sem apagar o resto do conteúdo colectivo.
**RN-MOD-02** — Conteúdo sinalizado como envolvendo menores segue as regras de RNF-PRIV-04 independentemente da categoria em que a Experiência foi criada.

---

# 5. Notas finais e rastreabilidade

Este documento não substitui o schema de dados — antecede-o, de propósito. Cada RF do núcleo deve mapear para pelo menos uma entidade futura (`Experiencia`, `Bloco`, `Regra`, `PontoDeAcesso`, `Contacto`, `Bilhete`, `Pagamento`...); cada RN de segurança (secção 4.3) torna-se validação obrigatória em cada caso de uso do backend, não sugestão a implementar "se der tempo".

O que fica fora deste documento, de propósito: escolhas de stack técnico, nomes de tabelas e endpoints, e o desenho visual. Isso é o próximo documento — a especificação técnica de dados e domínio — que agora parte directamente daqui, em vez de casos de uso soltos.

**Contagem:** 63 RF (26 núcleo + 37 categorias), 30 RNF, 33 RN.
