# Requisitos consolidados — Entrela

> Documento canónico único de requisitos funcionais (RF), requisitos não funcionais (RNF) e regras de negócio (RN).

- `[x]` — implementado, testado e ligado a evidência técnica.
- `[ ]` — decidido ou pendente, mas ainda não comprovado em produto.
- `Depende de:` — pré-condições que devem existir para o requisito funcionar de ponta a ponta.

Uma decisão documentada não equivale a uma entrega. Nenhum item muda para `[x]` sem código, teste e evidência verificável.

## Referência visual para Entrela Eventos

Em 14 de Agosto de 2026 foram capturados estados públicos do [calendário OpenClaw Meetups](https://luma.com/claw) e de uma página individual de evento no Luma. As imagens servem apenas para estudar hierarquia, composição, densidade, responsividade e organização de componentes. Não autorizam copiar marca, texto, ilustrações, fotografias, código ou activos do Luma. A implementação deve usar identidade, tokens e componentes próprios da Entrela.

| Referência | Desktop | Mobile | Aspectos a estudar |
|---|---|---|---|
| Calendário/comunidade | [captura](../../../frontend/design/referencias/luma-eventos/desktop-calendario-comunidade.jpg) | [captura](../../../frontend/design/referencias/luma-eventos/mobile-calendario-comunidade.jpg) | capa, avatar sobreposto, descrição curta, acções, calendário lateral e lista cronológica |
| Perfil do evento | [captura](../../../frontend/design/referencias/luma-eventos/desktop-perfil-evento-topo.jpg) | [captura](../../../frontend/design/referencias/luma-eventos/mobile-perfil-evento-topo.jpg) | coluna de identidade, hierarquia de título/data/local, anfitriões e acção principal |
| Inscrição/bilhete | [captura](../../../frontend/design/referencias/luma-eventos/desktop-inscricao-bilhete.jpg) | [captura](../../../frontend/design/referencias/luma-eventos/mobile-inscricao-bilhete.jpg) | painel contextual, preço, disponibilidade, formulário e resumo da transacção |
| Conteúdo/agenda | [captura](../../../frontend/design/referencias/luma-eventos/desktop-conteudo-agenda.jpg) | [captura](../../../frontend/design/referencias/luma-eventos/mobile-conteudo-agenda.jpg) | largura de leitura, conteúdo rico, agenda, separadores e progressão vertical |

### Intenção de design

- A página pública deve parecer um perfil de evento completo, e não um formulário isolado ou uma landing page promocional genérica.
- A composição desktop combina uma coluna de identidade/contexto com uma coluna principal de decisão e conteúdo; em mobile transforma-se numa sequência única, sem duplicar informação.
- A acção principal permanece fácil de encontrar durante a leitura, mas nunca cobre conteúdo, foco, mensagens de erro ou controlos do sistema.
- Cartões agrupam decisões concretas — inscrição, bilhete, disponibilidade, agenda — e não são decoração aplicada indiscriminadamente.
- O conteúdo do organizador fornece personalidade; a estrutura Entrela mantém consistência, legibilidade e confiança.

### Dependências de entrega de Eventos

| Capacidade | Pré-condições obrigatórias |
|---|---|
| Perfil e calendário públicos | negócio/papéis, publicação/versionamento, media pronta, tema, URL pública e projecção segura |
| Inscrição e RSVP | participante, consentimento, formulário validado, capacidade atómica e comunicação transaccional |
| Bilhética paga | inscrição, tipos de bilhete, pedidos, preços server-side, pagamento confirmado e política de reembolso |
| Credencial e check-in | bilhete emitido, token assinado, zona/porta, idempotência, operação concorrente e auditoria |
| Lista de espera | capacidade, inscrição, cancelamento, promoção atómica e notificação autorizada |
| Comunicação multicanal | consentimento/finalidade, segmentos, modelos, fornecedores, opt-out, histórico e recuperação de falha |
| Métricas do organizador | eventos append-only, identidade quando consentida, agregação, retenção e exportação autorizada |
| Página pós-evento | fim autoritativo, política de acesso, media moderada, consentimento e versão publicada |
| Layout responsivo | tokens, componentes semânticos, WCAG, imagens responsivas, orçamento de desempenho e regressão visual |

## 1. Requisitos funcionais — RF

> A caixa mede a entrega no produto. Embora muitas capacidades já estejam decididas em documentos, nenhuma capacidade de backend é considerada implementada sem código, teste e demonstração.

## Base comum da plataforma

- [x] **RF-BASE-01 — Plataforma única.** A Entrela possui seis categorias no mesmo produto: Empresas, Eventos, Momentos, Presentes, Convites e Experiências. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RF-BASE-02 — Primeiro corte.** Momentos — revelação privada agendada — é a primeira fatia vertical a construir. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RF-BASE-03 — Escolha de categoria.** O criador escolhe uma categoria ao iniciar uma experiência e a interface mostra apenas modelos e capacidades compatíveis.
- [ ] **RF-BASE-04 — Conta e negócio partilhados.** Um utilizador autenticado gere um ou mais `Negocio` e usa a mesma conta em todas as categorias autorizadas.
- [ ] **RF-BASE-05 — Experiências relacionadas.** Uma jornada que atravessa categorias cria experiências relacionadas, sem alterar a categoria de uma experiência publicada; a relação precisa de suporte explícito no modelo de dados.
- [ ] **RF-BASE-06 — Idiomas da interface.** Criador e destinatário podem utilizar `pt-AO` ou `en`; a escolha é persistida e aplicada a mensagens, datas e estados.
- [ ] **RF-BASE-07 — Conteúdo localizável.** Experiência, bloco e media suportam conteúdo por idioma e fallback editorial; não há tradução automática silenciosa de conteúdo pessoal.
- [ ] **RF-BASE-08 — Papéis de negócio.** `PROPRIETARIO`, `ADMINISTRADOR`, `EDITOR`, `OPERADOR`, `ANALISTA` e `FATURACAO` recebem apenas as acções permitidas pelo seu papel.
- [ ] **RF-BASE-09 — Equipa e parceiros.** O proprietário gere membros e relações entre negócios sem transferir inadvertidamente a propriedade do conteúdo do cliente para agência/parceiro.
- [ ] **RF-BASE-10 — Editor visual por blocos.** O editor funciona em telemóvel e computador, com pré-visualização fiel a diferentes tamanhos de ecrã antes de publicar.
- [ ] **RF-BASE-11 — Temas e biblioteca de componentes.** Um tema de cor/tipografia aplica-se a qualquer modelo editorial, e uma biblioteca de componentes reutilizáveis é partilhada entre categorias sem duplicação divergente.
- [ ] **RF-BASE-12 — Edição colaborativa e aprovação.** Contas de equipa podem editar a mesma experiência em conjunto e activar um fluxo de aprovação opcional antes de publicar.
- [ ] **RF-BASE-13 — Painéis por papel.** A plataforma oferece pelo menos quatro painéis distintos: criador, organizador (lotação, zonas, ocorrências, comunicação), parceiro (clientes, comissões, produção física) e administrativo (utilizadores, conteúdos, denúncias, pagamentos, auditoria, configuração global).
- [ ] **RF-BASE-14 — Conta pessoal automática.** Todo utilizador autenticado recebe automaticamente um negócio `PESSOAL` na criação da conta, sem passo manual adicional.

## Criação, conteúdo e publicação

- [x] **RF-CNT-01 — Criar rascunho.** O criador inicia uma `Experiencia` em `RASCUNHO` com uma `VersaoDaExperiencia` editável pertencente ao negócio correcto. [Evidência](../implementacoes/004-persistencia-real-em-postgresql-18.md)
- [ ] **RF-CNT-02 — Editor orientado à categoria.** Cada categoria oferece modelos editoriais e campos próprios, e não uma página genérica de componentes livres.
- [ ] **RF-CNT-03 — Nós e blocos.** O criador organiza etapas, cenas, perguntas, salas ou pontos de interesse com ordem, tipo e configuração validada. O catálogo de blocos de conteúdo inclui, no mínimo: texto, título, fotografia, galeria, vídeo, áudio, mensagem de voz, música de fundo, PDF, botão, link, mapa/localização, contagem regressiva, calendário, agenda, perfil de pessoa, lista, linha do tempo, comparação antes/depois, carrossel, ficheiro para download, contacto, redes sociais, transmissão ao vivo e conteúdo incorporado de terceiros. Cada bloco pode ser reordenado, duplicado, ocultado condicionalmente pelo motor de regras e removido sem afectar os restantes.
- [ ] **RF-CNT-04 — Media privado.** O criador envia imagem, áudio ou vídeo; o sistema mostra o estado técnico e só permite associar media pronta e autorizada.
- [x] **RF-CNT-05 — Versões.** O criador pode continuar a trabalhar em rascunho; publicação cria uma versão imutável com soma de verificação. [Evidência](../implementacoes/007-repositorio-editorial-de-momentos-em-postgresql.md)
- [ ] **RF-CNT-06 — Pré-visualização.** O criador simula estados e conteúdo da versão de rascunho sem contaminar acesso, métricas, progresso ou notificações de produção.
- [ ] **RF-CNT-07 — Validação antes de publicar.** O sistema apresenta erros claros de conteúdo, media, disponibilidade, regra, direito ou relação inválida antes de aceitar publicação.
- [ ] **RF-CNT-08 — Pausar, retomar e arquivar.** O dono autorizado pode pausar novas interacções, retomar uma publicação ou arquivar sem apagar histórico obrigatório.
- [ ] **RF-CNT-09 — Histórico de edição do rascunho.** Enquanto o rascunho estiver aberto, o criador pode desfazer e restaurar alterações recentes, distinto do histórico de versões públicas criado pela publicação (RF-CNT-05).
- [ ] **RF-CNT-10 — Duplicar experiência.** O criador pode duplicar qualquer experiência própria como rascunho novo e independente, sem herdar métricas, acessos ou eventos da original.
- [ ] **RF-CNT-11 — Modo simples e modo avançado.** O editor oferece um modo guiado por modelo (simples) e um modo de blocos e regras livres (avançado), seleccionável pelo criador sem perder conteúdo ao alternar.
- [ ] **RF-CNT-12 — Blocos de interacção.** Quando a categoria permitir, o criador adiciona blocos de recolha: formulário, pergunta aberta, escolha múltipla, votação, RSVP, lista de espera, comentários, livro de visitas, envio de media pelo participante, assinatura simples, reacções, chat, perguntas e respostas, mural colaborativo e avaliação da experiência.

## Acesso, tempo e interacção

- [ ] **RF-ACE-01 — Pontos de acesso.** A publicação pode criar `PontoDeAcesso` de tipo `URL`, `QR`, `NFC` ou `CODIGO_CURTO`, conforme a categoria permitir, distinguindo link público de link privado e QR estático de QR dinâmico redireccionável.
- [ ] **RF-ACE-02 — Portas separadas por origem.** URL e QR podem ter tokens próprios para distinguir origem, mantendo a mesma experiência e versão autorizada.
- [ ] **RF-ACE-03 — Disponibilidade temporal.** O criador configura abertura imediata, janela ou expiração; a hora efectiva é decidida pelo relógio do backend em UTC com fuso IANA.
- [ ] **RF-ACE-04 — Sessão sem conta.** Visitante, destinatário ou convidado pode viver uma experiência pública/privada sem criar conta quando a política da categoria o permitir.
- [ ] **RF-ACE-05 — Projecção segura.** Cada resposta pública contém apenas blocos, media, perguntas e acções já autorizados para aquela sessão.
- [ ] **RF-ACE-06 — Progresso recuperável.** Actualizar/reabrir o navegador retoma a sessão válida sem repetir evento, direito, check-in ou desbloqueio.
- [ ] **RF-ACE-07 — Regras declarativas.** Um evento de interacção pode activar regras permitidas, actualizar progresso e devolver a próxima projecção de forma idempotente.
- [ ] **RF-ACE-08 — Revogação.** O dono autorizado pode revogar ou regenerar pontos de acesso; os pontos anteriores deixam de abrir conteúdo sem apagar auditoria.
- [ ] **RF-ACE-09 — Auditoria e análise.** O criador vê eventos e métricas apropriadas à categoria sem inventar identidade ou significado emocional para actividade anónima. Métricas mínimas por experiência: visualizações, visitantes únicos, scans por ponto de acesso, origem, hora/dia, região aproximada, tipo de dispositivo, taxa de conclusão, tempo médio, abandono por etapa, respostas, conversão, partilhas, contribuições, pagamentos, check-ins e participação por equipa, sempre agregadas e nunca atribuídas a um anónimo específico.
- [ ] **RF-ACE-10 — Desbloqueio por acção.** O motor pode desbloquear conteúdo por código, por ponto de acesso específico, por localização, por conclusão de tarefa, por número mínimo de participantes ou por pagamento confirmado, sempre validado no backend.
- [ ] **RF-ACE-11 — Lógica condicional e narrativa ramificada (pós-MVP).** O motor pode mostrar um bloco com base numa resposta anterior, criar caminhos narrativos diferentes, respostas correctas/incorrectas e finais alternativos; explicitamente fora do MVP de Momentos (RN-MOM-09) e só entra quando o manifesto de uma categoria a activar.
- [ ] **RF-ACE-12 — Mecânicas de progressão e gamificação (pós-MVP).** O motor pode atribuir/retirar pontos, controlar tentativas, aplicar penalização de tempo, criar equipas e rankings, definir inventário virtual e entregar objectos digitais, apenas quando o manifesto da categoria (ex.: Experiências, Eventos) o permitir explicitamente (RN-MOT-06).
- [ ] **RF-ACE-13 — Registo de decisões rastreável.** Toda decisão relevante de um participante (resposta, escolha de caminho, ordem apresentada) é registada de forma append-only, permitindo randomizar percursos ou perguntas sem perder rastreabilidade para relatórios.
- [ ] **RF-ACE-14 — Políticas de controlo de acesso.** A publicação pode exigir palavra-passe, acesso único, número limitado de acessos, lista de convidados autorizados, autenticação por e-mail/telefone, acesso por bilhete ou acesso por equipa, conforme a categoria permitir.
- [ ] **RF-ACE-15 — Estados especiais de publicação.** A plataforma suporta página de manutenção, página de espera antes da abertura programada (já usada por Momentos) e redireccionamento automático depois do encerramento de uma experiência.
- [ ] **RF-ACE-16 — QR dinâmico redireccionável.** O destino de um `PontoDeAcesso` do tipo QR dinâmico pode ser alterado depois de impresso, sem exigir novo código físico nem invalidar o material já distribuído.
- [ ] **RF-ACE-17 — Exportação de análises.** O criador exporta análises e listas de contacto/resposta em formato reutilizável (CSV, no mínimo) e pode configurar integração por webhook para automações externas, respeitando RNF-PRI-02.

## Comércio, direitos e comunicações

- [ ] **RF-COM-01 — Direitos.** O sistema verifica `Direito` antes de publicar, entrar, descarregar, emitir certificado ou usar uma capacidade paga.
- [ ] **RF-COM-02 — Piloto controlado.** Um operador autorizado pode conceder direito de piloto com motivo, validade e auditoria, sem alterar o fluxo de produto.
- [ ] **RF-COM-03 — Pedido e pagamento.** A plataforma cria pedido, itens e pagamento através de Stripe ou adaptador angolano homologado, sem aceitar preço final do navegador.
- [ ] **RF-COM-04 — Reembolso.** O operador autorizado solicita/reconcilia reembolso sem apagar o pagamento original ou ultrapassar o valor confirmado.
- [ ] **RF-COM-05 — Notificações.** A plataforma envia apenas comunicações autorizadas: desafio de entrada, lembrete, entrega de recordação, confirmação ou actualização relevante.
- [ ] **RF-COM-06 — Entrega de ficheiro.** O destinatário autorizado recebe media ou recordação por URL temporária, nunca por ligação pública permanente.
- [ ] **RF-COM-07 — Bloco de pagamento embutido.** Um bloco de pagamento processa cobrança única associada a uma experiência, bilhete ou reserva, e regista o estado da transacção conforme RN-PAG.
- [ ] **RF-COM-08 — Doações, orçamentos, reservas e agendamento.** O criador pode adicionar blocos de doação, pedido de orçamento, reserva ou escolha de horário, cada um com ciclo próprio de estados `PENDENTE → CONFIRMADO | CANCELADO`.

## Entrela Empresas

- [ ] **RF-EMP-01 — Campanha de marca.** Uma empresa cria experiência de campanha com conteúdo, objectivo, modelo, prazo e painel próprios.
- [ ] **RF-EMP-02 — QR dinâmico em escala.** A empresa gera pontos de acesso individuais ou em lote, associados a campanha, loja, região, stand ou material físico.
- [ ] **RF-EMP-03 — Conteúdo contextual.** A mesma campanha pode apresentar conteúdo, idioma, cupão ou destino diferente conforme o ponto de acesso e regras autorizadas.
- [ ] **RF-EMP-04 — Captura de contacto.** A campanha recolhe formulário simples apenas com campos, finalidade e consentimento configurados; o contacto pode optar por não fornecer dados.
- [ ] **RF-EMP-05 — Cupões e recompensas.** A campanha emite cupão/código único com prazo, regra de elegibilidade e controlo de utilização.
- [ ] **RF-EMP-06 — Painel de campanha.** Marca, agência ou comercial vê scans, origem, período, conversão e desempenho por ponto sem expor dados além da permissão, incluindo comparação de desempenho entre canais (QR vs. NFC vs. link) e entre lojas/regiões da mesma campanha.
- [ ] **RF-EMP-07 — Exportação e integração.** Contactos consentidos podem ser exportados ou enviados para CRM/webhook configurado pelo negócio.
- [ ] **RF-EMP-08 — Marca empresarial.** Domínio personalizado, biblioteca de marca, modelos aprovados, equipa e white-label entram por plano/permissão, sem quebrar a plataforma comum.
- [ ] **RF-EMP-09 — Manual e suporte vivo.** Um QR em produto pode abrir manual, garantia, vídeo ou pedido de suporte actualizado sem reimprimir o material físico.
- [ ] **RF-EMP-10 — Onboarding e certificação sequencial.** A empresa cria um percurso de etapas sequenciais de leitura obrigatória (ex.: formação, integração) que termina na emissão de um certificado.

## Entrela Eventos

- [ ] **RF-EVT-01 — Perfil público completo.** O organizador publica um perfil com capa, imagem quadrada opcional, título, resumo, categoria, data, horário, fuso, localidade, política de localização, anfitriões, capacidade, conteúdo e estado antes/durante/depois. A página apresenta primeiro identidade e decisão, depois detalhes. **Depende de:** RF-BASE-04, RF-BASE-08, RF-CNT-04, RF-CNT-05, RF-CNT-07, RF-ACE-05 e RF-EVT-35.
- [ ] **RF-EVT-02 — Inscrição e bilhete no contexto.** O participante confirma presença ou escolhe ingresso sem perder o contexto do evento; o painel mostra evento, data, preço, quantidade, campos obrigatórios, total e acção final. **Depende de:** RF-EVT-05, RF-EVT-16, RF-EVT-17, RF-COM-03, RNF-SEG-06 e RN-EVT-19.
- [ ] **RF-EVT-03 — Credencial digital.** Cada bilhete elegível cria QR/token assinado, revogável e associado ao participante, evento, tipo, zona e sessões permitidas. **Depende de:** RF-EVT-02, RF-COM-03, RF-ACE-01, RNF-SEG-05, RNF-SEG-13 e RN-EVT-04.
- [ ] **RF-EVT-04 — Check-in.** Operador lê a credencial, vê identidade mínima, tipo/zona e resultado imediato `ACEITE | DUPLICADO | REVOGADO | INVALIDO | ZONA_NEGADA`; várias portas funcionam em concorrência sem validar duas entradas. **Depende de:** RF-EVT-03, RF-EVT-05, RNF-SEG-07, RNF-DES-02, RNF-DIS-05 e RN-EVT-05.
- [ ] **RF-EVT-05 — Capacidade e zonas.** O sistema controla limites por evento, sessão, zona e tipo de bilhete, com disponibilidade calculada no backend e reserva temporária durante checkout. **Depende de:** RF-EVT-17, RNF-DES-02, RNF-ESC-01, RN-EVT-03 e RN-EVT-08.
- [ ] **RF-EVT-06 — Agenda e sessões.** O perfil apresenta agenda cronológica, sessões, horários, espaços, oradores e conteúdo exclusivo conforme bilhete, zona, hora ou presença. **Depende de:** RF-CNT-03, RF-ACE-05, RF-EVT-01, RF-EVT-05 e RN-EVT-02.
- [ ] **RF-EVT-07 — Comunicação segmentada.** O organizador envia confirmação, alteração, lembrete e mensagem pós-evento por e-mail e, quando homologados, SMS, push e WhatsApp, filtrando por estado de inscrição, bilhete, sessão, zona ou presença. **Depende de:** RF-COM-05, RF-EVT-16, RF-EVT-25, RNF-PRI-02 e RN-EVT-25.
- [ ] **RF-EVT-08 — Certificado e pós-evento.** Participante elegível recebe certificado, recordação e página pós-evento com media, gravações, agradecimento e convite seguinte; a transformação só ocorre depois do fim autoritativo. **Depende de:** RF-EVT-04, RF-EVT-06, RF-COM-06, RN-EVT-07, RN-EVT-12 e RN-EVT-34.
- [ ] **RF-EVT-09 — Networking e participação ao vivo.** Fase posterior permite troca consentida de contacto por QR pessoal, votação, perguntas por sessão, chat moderado e avaliação, sem exposição automática entre participantes. **Depende de:** RF-CNT-12, RF-EVT-03, RF-EVT-06, RNF-PRI-02 e RN-PES-04.
- [ ] **RF-EVT-10 — Lista de espera.** Quando a lotação aplicável esgota, o participante entra numa fila ordenada e recebe oferta temporária quando surgir vaga. **Depende de:** RF-EVT-05, RF-EVT-07, RF-EVT-16, RN-EVT-22 e RNF-SEG-07.
- [ ] **RF-EVT-11 — Perfil de organizador ou comunidade.** Um negócio publica uma página permanente com capa, avatar, nome, descrição, categoria, redes sociais, eventos futuros e passados e acção para seguir. **Depende de:** RF-BASE-04, RF-BASE-08, RF-CNT-04, RF-EVT-12 e RN-EVT-13.
- [ ] **RF-EVT-12 — Calendário público.** O perfil do organizador oferece lista cronológica, vista mensal, próximos/passados, pesquisa e, quando houver localização pública suficiente, vista de mapa. **Depende de:** RF-EVT-01, RF-EVT-11, RF-BASE-06, RF-ACE-05 e RN-EVT-32.
- [ ] **RF-EVT-13 — Seguir e assinar calendário.** Visitante pode seguir o organizador e obter assinatura iCal; utilizador sem conta pode receber actualizações apenas após consentimento e verificação do contacto. **Depende de:** RF-EVT-11, RF-EVT-12, RF-COM-05, RNF-PRI-02 e RN-EVT-24.
- [ ] **RF-EVT-14 — Submeter evento a calendário.** Um organizador autorizado submete evento a calendário de terceiro; administradores aprovam, rejeitam ou pedem alteração sem transferir propriedade. **Depende de:** RF-BASE-08, RF-BASE-09, RF-EVT-01, RF-EVT-11 e RN-EVT-23.
- [ ] **RF-EVT-15 — Anfitriões e prova social.** O perfil mostra entidade apresentadora, organizadores/coorganizadores, ligações públicas e contagem/avatar de participantes apenas segundo configuração e consentimento. **Depende de:** RF-EVT-01, RF-EVT-25, RNF-PRI-01 e RN-EVT-16.
- [ ] **RF-EVT-16 — Gestão de participantes.** O organizador pesquisa, filtra, segmenta, aprova, rejeita, adiciona, importa e exporta inscrições; campos personalizados suportam texto, escolha, consentimento e perfil social opcional. **Depende de:** RF-CNT-12, RF-ACE-17, RF-BASE-08, RNF-PRI-01, RNF-PRI-03 e RN-EVT-19.
- [ ] **RF-EVT-17 — Tipos de ingresso e preços.** O organizador cria ingressos gratuitos, pagos, doação/preço sugerido com mínimo, cortesia, antecipado e VIP, com moeda, quantidade, janela de venda e benefícios. **Depende de:** RF-COM-03, RF-EVT-05, RNF-PAG-03, RN-EVT-17 e RN-PAG-02.
- [ ] **RF-EVT-18 — Quantidade, compra em grupo e cupões.** A compra pode incluir múltiplos ingressos e dados por participante; cupões aplicam regras de validade, quantidade, elegibilidade e desconto server-side. **Depende de:** RF-EVT-16, RF-EVT-17, RF-COM-03, RN-EVT-27 e RN-EVT-28.
- [ ] **RF-EVT-19 — Localização progressiva.** O organizador escolhe entre endereço público, localidade aproximada, revelação após inscrição, revelação após aprovação ou evento online; o mapa respeita a mesma política. **Depende de:** RF-EVT-01, RF-ACE-05, RNF-PRI-01 e RN-EVT-15.
- [ ] **RF-EVT-20 — Painel de decisão persistente.** Em desktop, inscrição, disponibilidade e preço ocupam um container claramente delimitado junto ao resumo; em mobile, a acção principal reaparece em posição alcançável sem cobrir conteúdo ou erros. **Depende de:** RF-EVT-01, RF-EVT-02, RF-EVT-35, RNF-VIS-01, RNF-VIS-02 e RNF-ACE-01.
- [ ] **RF-EVT-21 — Conteúdo rico do evento.** O organizador compõe descrição, destaques, programa, perfis de oradores, patrocinadores, galeria, documentos, transmissão, FAQ e instruções, mantendo largura de leitura e ordem semântica. **Depende de:** RF-CNT-03, RF-CNT-04, RF-CNT-06, RF-EVT-35 e RNF-VIS-03.
- [ ] **RF-EVT-22 — Contacto e denúncia.** Visitante pode contactar o organizador através de canal protegido e denunciar um evento; ambos geram estado rastreável, protecção antiabuso e acesso administrativo mínimo. **Depende de:** RF-EVT-01, RF-COM-05, RNF-SEG-11, RNF-PRI-05 e RN-EVT-36.
- [ ] **RF-EVT-23 — Aprovação e acesso condicionado.** Evento pode exigir aprovação manual, domínio de e-mail, lista autorizada, código, token ou posse de bilhete antes de confirmar inscrição ou revelar informação protegida. **Depende de:** RF-ACE-14, RF-EVT-16, RNF-SEG-03 e RN-EVT-21.
- [ ] **RF-EVT-24 — Pagamentos, impostos e reembolsos.** O organizador acompanha pedidos, pagamentos, taxas, impostos configurados, recibos, falhas, chargebacks e reembolsos conforme provedor e jurisdição homologados. **Depende de:** RF-COM-03, RF-COM-04, RF-EVT-17, RNF-PAG-01 a RNF-PAG-04 e RN-EVT-11.
- [ ] **RF-EVT-25 — Equipa operacional.** Evento e calendário aceitam coorganizadores, administradores, editores, analistas, gestores de participantes, gestores de comunicação e operadores de check-in com menor privilégio. **Depende de:** RF-BASE-08, RF-BASE-09, RNF-SEG-04 e RN-EVT-30.
- [ ] **RF-EVT-26 — Integrações de calendário e transmissão.** Participante adiciona evento ao calendário; organizador liga provedores homologados de videoconferência/transmissão sem expor ligação protegida antes da autorização. **Depende de:** RF-EVT-01, RF-EVT-19, RF-ACE-05, RNF-SEG-10 e RN-EVT-32.
- [ ] **RF-EVT-27 — URL e tema próprios.** Plano autorizado permite slug legível, domínio/subdomínio, capa, logótipo, cores e tipografia dentro dos limites de contraste e estrutura da Entrela. **Depende de:** RF-BASE-11, RF-EMP-08, RNF-ACE-01, RNF-VIS-04 e RN-EMP-07.
- [ ] **RF-EVT-28 — Painel do organizador.** O painel apresenta visualizações, origem, conversão por etapa, inscrições, aprovações, lotação, receita, reembolsos, check-ins, ausências e desempenho de comunicações com filtros e exportação. **Depende de:** RF-ACE-09, RF-ACE-17, RF-EVT-02, RF-EVT-04, RF-EVT-07, RF-EVT-24 e RNF-DES-03.
- [ ] **RF-EVT-29 — API, webhooks e automações.** Plano autorizado oferece API e eventos webhook versionados para publicação, inscrição, aprovação, pagamento, cancelamento e check-in, com entrega assinada, idempotente e repetível. **Depende de:** RF-EVT-16, RF-EVT-24, RNF-SEG-07, RNF-PAG-02 e RNF-OPE-01.
- [ ] **RF-EVT-30 — Duplicação e recorrência.** Organizador duplica evento ou cria série recorrente, escolhendo explicitamente que conteúdo, equipa, ingressos e formulários reutilizar; participantes, pagamentos e métricas nunca são copiados. **Depende de:** RF-CNT-10, RF-EVT-01, RF-EVT-16 e RN-EVT-31.
- [ ] **RF-EVT-31 — Pesquisa e descoberta.** Eventos públicos e aprovados podem aparecer em pesquisa por texto, data, categoria e localidade; eventos privados, não listados ou protegidos ficam excluídos do índice. **Depende de:** RF-EVT-01, RF-EVT-12, RF-ACE-14, RNF-PRI-04 e RN-EVT-33.
- [ ] **RF-EVT-32 — Tradução da interface.** O perfil permite alternar a interface entre `pt-AO` e `en`; tradução assistida do conteúdo do organizador é sempre explícita, identificada e reversível. **Depende de:** RF-BASE-06, RF-BASE-07, RNF-I18N-01 e RN-EVT-37.
- [ ] **RF-EVT-33 — Partilha e calendário pessoal.** O perfil oferece copiar link, Web Share, QR e ficheiro/ligação de calendário com metadados públicos seguros e actualizados. **Depende de:** RF-ACE-01, RF-EVT-01, RF-EVT-19, RNF-SEG-05 e RN-EVT-32.
- [ ] **RF-EVT-34 — Estados públicos do evento.** O mesmo URL apresenta estados coerentes `RASCUNHO_INACESSIVEL`, `AGENDADO`, `INSCRICOES_ABERTAS`, `ESGOTADO`, `EM_CURSO`, `TERMINADO`, `CANCELADO` e `POS_EVENTO`, com acções compatíveis. **Depende de:** RF-CNT-05, RF-CNT-08, RF-EVT-01, RN-EVT-02 e RN-EVT-34.
- [ ] **RF-EVT-35 — Composição visual orientada ao evento.** O perfil usa containers estáveis para identidade, informação temporal, anfitriões, decisão/inscrição, conteúdo, agenda e localização; modelos podem variar expressão visual sem mudar ordem semântica, contratos ou regras. **Depende de:** RF-BASE-11, RF-CNT-02, RNF-VIS-01 a RNF-VIS-08 e RNF-MAN-01.
- [ ] **RF-EVT-36 — Estados de interface completos.** Cada componente público ou operacional define carregamento, vazio, indisponível, erro, sucesso, esgotado, pendente de aprovação, cancelado e sem rede, sem depender apenas de cor. **Depende de:** RNF-USA-03, RNF-ACE-01, RNF-VIS-06 e RNF-QUA-03.

## Entrela Momentos

- [ ] **RF-MOM-01 — Narrativa privada.** Criador monta um Momento com título, capa, destinatário opcional, modelo editorial e uma a seis etapas lineares.
- [ ] **RF-MOM-02 — Conteúdo da etapa.** Cada etapa contém texto ou um media principal autorizado; a última é identificada como revelação final.
- [ ] **RF-MOM-03 — Abertura escolhida.** Criador selecciona `ABRIR_AGORA` ou `AGENDAR_ABERTURA` com data, hora e fuso IANA.
- [ ] **RF-MOM-04 — Pré-visualização realista.** Criador simula espera, abertura e qualquer etapa sem criar métricas de produção.
- [x] **RF-MOM-05 — Publicação privada.** Publicação válida cria URL e QR privados, exige direito activo e entrega apenas o necessário ao criador. [Evidência](../implementacoes/007-repositorio-editorial-de-momentos-em-postgresql.md)
- [ ] **RF-MOM-06 — Abertura humana.** Destinatário abre sem conta; bots de pré-visualização recebem apenas metadados neutros e não activam a experiência.
- [ ] **RF-MOM-07 — Revelação sequencial.** O destinatário avança uma etapa de cada vez; o backend não aceita salto para bloco futuro por URL, ID ou pedido forjado.
- [ ] **RF-MOM-08 — Estado agregado.** Criador vê primeira abertura, última abertura, conclusão e origem URL/QR sem alegar que a pessoa leu, concordou ou sentiu algo.
- [ ] **RF-MOM-09 — Recordação.** Criador ou destinatário concluído solicita arquivo HTML/PDF e media autorizada; o processamento é assíncrono e reutiliza pedido equivalente.
- [ ] **RF-MOM-10 — Evolução posterior.** Mural moderado (com moderação obrigatória antes de publicar, RN-MOM-13), colaboradores, cápsulas de tempo múltiplas (com data de abertura futura inacessível mesmo ao criador, RN-MOM-11), linha do tempo, mapa de memórias e resposta do destinatário entram sem alterar o MVP linear.

## Entrela Presentes

- [ ] **RF-PRE-01 — Objecto associado.** Criador ou parceiro associa a experiência a `ObjetoFisico` e `AncoraFisica` quando existe presente concreto.
- [ ] **RF-PRE-02 — Etiqueta de entrega.** O sistema gera QR e, quando aplicável, NFC para afixar em embalagem, cartão ou objecto, sem revelar o conteúdo antes da regra de entrega.
- [ ] **RF-PRE-03 — Mensagem do presente.** Quem oferece cria mensagem privada em texto, áudio ou vídeo; quem recebe abre-a no ponto de acesso autorizado.
- [ ] **RF-PRE-04 — Confirmação de entrega.** A experiência pode exigir confirmação de entrega ou instante agendado antes de desbloquear conteúdo.
- [ ] **RF-PRE-05 — Página viva do objecto.** O dono autorizado actualiza história, manual, garantia, manutenção ou álbum sem trocar a etiqueta física.
- [ ] **RF-PRE-06 — Certificado e autenticidade.** Fase posterior emite certificado verificável e comunica claramente o nível de prova; NFC comum não é vendido como prova forte de posse/autenticidade.
- [ ] **RF-PRE-07 — Posse e transferência.** O sistema regista proprietário/participante, início e fim da posse sem sobreposição de períodos para o mesmo objecto.
- [ ] **RF-PRE-08 — Parceiros de presentes.** Floristas, lojas e joalharias podem emitir experiências em volume, mantendo separação entre negócio parceiro, comprador e destinatário.
- [ ] **RF-PRE-09 — Resposta do destinatário ao ofertante.** O destinatário pode enviar uma mensagem de agradecimento de volta ao ofertante, associada à mesma página do objecto.

## Entrela Convites

- [ ] **RF-CON-01 — Convite orientado à presença.** Organizador cria convite com ocasião, data, local, modelo visual e política de acesso.
- [ ] **RF-CON-02 — Lista e segmentos.** Organizador adiciona/importa contactos e cria grupos como família, padrinhos, imprensa ou parceiros.
- [ ] **RF-CON-03 — Conteúdo adaptativo.** O convidado vê apenas informação, local, agenda ou anexo correspondente ao seu convite/segmento.
- [ ] **RF-CON-04 — RSVP.** Convidado confirma `SIM`, `NAO` ou `TALVEZ`, quantidade de acompanhantes e respostas às perguntas autorizadas.
- [ ] **RF-CON-05 — Prazo e lembrete.** Organizador define prazo de resposta e agenda lembrete para pendentes por canal consentido.
- [ ] **RF-CON-06 — Partilha e entrega.** O sistema distribui convite por link, WhatsApp, SMS ou e-mail, com pré-visualização do conteúdo antes do envio, e mantém histórico de entrega sem duplicar convidado.
- [ ] **RF-CON-07 — Privacidade de convite.** Convidado não vê lista, segmento, respostas ou endereço restrito de outras pessoas.
- [ ] **RF-CON-08 — Evolução posterior.** Calendário, preferências alimentares, controlo de reenvio, local liberado após aprovação e transferência entram sob política explícita.
- [ ] **RF-CON-09 — Convite nominal transferível.** Cada convite individual referencia um participante específico e pode ser marcado como transferível ou não transferível pelo organizador.

## Entrela Experiências

- [ ] **RF-EXP-01 — Percurso físico.** Instituição cria percurso com local, pontos de interesse, ordem opcional e conteúdo por ponto.
- [ ] **RF-EXP-02 — Entrada no ponto.** Visitante abre conteúdo por QR, NFC, URL ou, em fase posterior, coordenada GPS validada pela política da experiência.
- [ ] **RF-EXP-03 — Conteúdo multilingue.** Texto, imagem, áudio, vídeo e explicação de ponto estão disponíveis em `pt-AO` e `en` quando criados pelo operador.
- [ ] **RF-EXP-04 — Exploração livre ou guiada.** Criador escolhe sequência obrigatória, exploração livre ou missões; o motor controla desbloqueio e conclusão.
- [ ] **RF-EXP-05 — Questionário e missão.** Visitante responde a perguntas simples ou cumpre missões para avançar, obter certificado, cupão ou recompensa autorizada.
- [ ] **RF-EXP-06 — Painel por ponto.** Instituição vê início, conclusão, pontos visitados, idioma e abandono de forma agregada.
- [ ] **RF-EXP-07 — Certificado e recompensa.** Participante elegível recebe certificado/cupão quando a regra de conclusão e eventual pagamento/consentimento estiverem satisfeitos.
- [ ] **RF-EXP-08 — Evolução posterior.** Áudio-guia, GPS, modo equipa com pontuação e ranking, offline parcial, baixo consumo, realidade aumentada e mapa interactivo entram como extensões testadas.

## Fecho de implementação

- [ ] Cada RF recebe caso de uso, rota/schema, caso de teste e referência à regra de negócio correspondente antes de ser marcado `[x]`.
- [ ] Nenhuma categoria é lançada como aplicação ou base de dados independente; ela reutiliza os requisitos de base, segurança e motor comum.

## 2. Requisitos não funcionais — RNF

> Estes requisitos aplicam-se às seis categorias. O nível de protecção não baixa quando uma experiência é pessoal, pública, física ou comercial.

## Segurança por desenho

- [ ] **RNF-SEG-01 — Modelação de ameaça.** Cada módulo e rota pública deve identificar activos, fronteiras de confiança, abuso previsível e forma de falhar antes de ser exposto.
- [ ] **RNF-SEG-02 — Transporte seguro.** Todo tráfego usa HTTPS com HSTS, CSP restritiva, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy: no-referrer` e política de permissões mínima.
- [ ] **RNF-SEG-03 — Autenticação do criador.** Desafio de e-mail de uso único com expiração curta, HMAC em repouso, consumo atómico, resposta anti-enumeração, limite por IP/e-mail, rotação/revogação de sessão e protecção CSRF.
- [x] **RNF-SEG-04 — Autorização por negócio.** Toda acção passa por política central de papel; `negocio_id` vem da sessão, não do cliente. RLS real, com `FORCE ROW LEVEL SECURITY`, deve proteger os dados multi-negócio. [Evidência](../implementacoes/004-persistencia-real-em-postgresql-18.md)
- [ ] **RNF-SEG-05 — Tokens públicos.** URL, QR, NFC, código curto e pré-visualização usam token criptograficamente aleatório e longo o suficiente para resistir a adivinhação/enumeração, com HMAC-SHA-256 e comparação de tempo constante; token nunca entra em logs, auditoria, analytics ou redireccionamento.
- [ ] **RNF-SEG-06 — API defensiva.** Zod valida corpo, parâmetros e resposta; há limite de tamanho, allowlist de campos, CORS por origem, erros sem stack trace, paginação e limites de consulta.
- [ ] **RNF-SEG-07 — Idempotência e concorrência.** Escritas repetidas não criam dois eventos, direitos, entradas, cupões ou desbloqueios. A mesma chave com corpo diferente falha de modo explícito.
- [ ] **RNF-SEG-08 — Ficheiros seguros.** Upload directo tem autorização curta e limitada a objecto/tamanho/MIME; o backend confirma tipo real, soma, dimensões, duração, antivírus e remoção de metadados sensíveis antes de publicar.
- [x] **RNF-SEG-09 — Motor isolado.** Regras aceitam apenas factos, operadores e acções permitidos; não executam JavaScript, SQL, HTML livre, chamadas externas, expressões arbitrárias ou dados pessoais não autorizados. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RNF-SEG-10 — Segredos e cifragem.** Dados pessoais, tokens recuperáveis e payloads de provedores são cifrados com chaves versionadas; HMAC usa chave separada; produção usa cofre de segredos e rotação auditável.
- [ ] **RNF-SEG-11 — Antiabuso.** Aplicar quotas, limites e atraso/bloqueio progressivo por IP, utilizador, negócio, token e provedor contra enumeração, spam de desafio, tentativas repetidas de código/palavra-passe, scans QR em massa, uploads abusivos, cupões e fraude.
- [ ] **RNF-SEG-12 — Cadeia de fornecimento.** Lockfile, imagens imutáveis, SBOM, análise de dependências, scan de imagem, SAST e correcção de vulnerabilidades fazem parte da entrega.
- [ ] **RNF-SEG-13 — Bilhetes e QR à prova de falsificação.** Todo bilhete e credencial de entrada inclui assinatura própria do QR/token, validada no servidor no momento do check-in; leitura visual sem validação server-side nunca é suficiente para aceitar entrada.

## Privacidade e dados

- [ ] **RNF-PRI-01 — Minimização.** Cada campo pessoal deve ter finalidade, classificação, dono e prazo de retenção. Conteúdo íntimo, contacto, dieta, localização, media e dados fiscais não recebem o mesmo tratamento.
- [ ] **RNF-PRI-02 — Consentimento.** Consentimento é específico, versionado, demonstrável e revogável. Acesso à experiência não pode forçar marketing; CRM e webhooks respeitam a finalidade autorizada.
- [ ] **RNF-PRI-03 — Direitos sobre dados.** Implementar acesso, exportação, correcção, eliminação/anonimização e revogação, com matriz de retenção por categoria e tipo de dado.
- [ ] **RNF-PRI-04 — Métricas honestas.** `GET`, prefetch e bots não contam como abertura. IP é agregado/pseudonimizado; eventos não guardam conteúdo, token, e-mail, telefone ou URL assinada.
- [ ] **RNF-PRI-05 — Apoio com menor privilégio.** Operador interno não lê conteúdo íntimo por defeito; acesso excepcional exige motivo, prazo, autorização e auditoria.
- [ ] **RNF-PRI-06 — Avaliação legal.** Antes de activar dados reais de menores, localização, leads ou pagamentos, aprovar privacidade, termos, contratos com subcontratantes e tratamento internacional com aconselhamento jurídico aplicável.
- [ ] **RNF-PRI-07 — Dados de menores.** Perfis e conteúdos envolvendo menores nunca recolhem geolocalização exacta, nunca são partilhados com terceiros e exigem consentimento parental sinalizável antes de qualquer tratamento real, independentemente da categoria (RN-MOD-02).

## Disponibilidade, desempenho e escala

- [ ] **RNF-DIS-01 — Objectivos de serviço.** Aprovar SLO por rota. Alvo inicial de piloto: disponibilidade mensal de pelo menos 99,5%, p95 de até 500 ms para resolver/abrir/continuar uma experiência pública, primeiro conteúdo visível em menos de 2 s em 4G e menos de 4 s em 3G, e resolução de QR/NFC até 500 ms sob carga normal.
- [ ] **RNF-DIS-02 — Recuperação.** Backups cifrados, cópia fora do ambiente primário e teste de restauro trimestral. No piloto, RPO máximo de 24 horas e RTO máximo de 4 horas; dinheiro real ou evento com mais de 1 000 inscrições exige RPO de 1 hora antes da abertura ao público.
- [ ] **RNF-DIS-03 — Degradação segura.** Falha de media, e-mail, pagamento ou trabalhador nunca publica, concede direito ou revela conteúdo protegido indevidamente.
- [ ] **RNF-DIS-04 — Migração segura.** Aplicar estratégia expandir → migrar dados → contrair, cópia antes de migração de risco e rollback de aplicação compatível com a base.
- [ ] **RNF-DIS-05 — Degradação graciosa das rotas críticas.** Check-in, leitura de QR/NFC e abertura de experiência mantêm-se operacionais mesmo com degradação parcial de análises, exportações, certificados ou lembretes; falha nesses serviços secundários nunca impede nem atrasa a rota crítica.
- [ ] **RNF-DES-01 — Rotas críticas.** Medir e proteger contra regressão `GET /momento/:token`, `POST /abrir`, `POST /continuar`, publicação, check-in futuro e painéis; sem N+1, com índices, timeout e paginação.
- [ ] **RNF-DES-02 — Limites atómicos.** Capacidade, zona, uso de ponto, cupão, bilhete, direito e sequência de blocos são actualizados atomicamente no PostgreSQL.
- [ ] **RNF-DES-03 — Painéis quase em tempo real.** Durante um evento ao vivo, contadores de scans e check-in no painel actualizam com atraso de poucos segundos, nunca em lote diário.
- [ ] **RNF-ESC-01 — Escala horizontal.** Fastify é sem estado; sessão, progresso, locks e tarefas duram no servidor/infraestrutura, nunca só em memória local.
- [ ] **RNF-ESC-02 — Carga por categoria.** Testar scans QR em massa de milhares de códigos processados assincronamente com notificação de conclusão (Empresas), entradas simultâneas de centenas de participantes em poucos minutos (Eventos), abertura no mesmo instante (Momentos), entrega/QR copiado (Presentes), pico RSVP (Convites) e muitos pontos físicos (Experiências).
- [ ] **RNF-ESC-03 — Cache segura.** Só projecção pública não sensível é cacheable com versão/idioma/estado na chave; respostas privadas, tokens e URLs assinadas usam `Cache-Control: no-store`.
- [ ] **RNF-ESC-04 — Motor reutilizável entre categorias.** O motor de regras e o catálogo de blocos são desenhados para composição; uma categoria futura implementa-se compondo blocos e regras já existentes, sem reescrever o núcleo do motor.

## Inclusão, idiomas e redes móveis

- [ ] **RNF-ACE-01 — WCAG 2.2 AA.** Interface, e-mails e artefactos entregues devem suportar teclado, foco visível, contraste, semântica, leitor de ecrã, zoom/reflow, alvos de toque e erros compreensíveis.
- [ ] **RNF-ACE-02 — Media e movimento.** Guardar texto alternativo, legenda e transcrição quando aplicável; não iniciar áudio automaticamente; `prefers-reduced-motion` remove movimento não essencial sem alterar a regra.
- [ ] **RNF-I18N-01 — `pt-AO` e `en`.** Toda string de produto, erro e e-mail usa chave de tradução; localidade persistida formata datas, números, moeda e fuso. Conteúdo pessoal não é traduzido automaticamente.
- [ ] **RNF-MOB-01 — Mobile first.** Fluxo público funcional a partir de 360 px, em navegador moderno e rede móvel comum; perda de rede permite retomar sem revelar a etapa seguinte.
- [ ] **RNF-MOB-02 — Baixo consumo.** Media responsiva, carregamento progressivo e orçamento de dados. Modo offline só entra quando existir sincronização segura e testada.

## Usabilidade, compatibilidade e manutenibilidade

- [ ] **RNF-USA-01 — Sem conta para o destinatário.** Um destinatário, convidado ou visitante nunca precisa de criar conta para ver, responder, confirmar presença ou avançar numa experiência pública.
- [ ] **RNF-USA-02 — Editor 100% utilizável por telemóvel.** O modo simples do editor é completamente utilizável a partir de um telemóvel, sem exigir computador para nenhuma das suas funções.
- [ ] **RNF-USA-03 — Erros claros para o destinatário.** Mensagens de erro voltadas ao destinatário (link expirado, bilhete inválido, porta revogada) são claras, nunca expondo detalhe técnico interno, stack trace ou motivo que revele conteúdo de outro negócio.
- [ ] **RNF-USA-04 — Compatibilidade sem instalação.** As experiências funcionam em navegadores móveis comuns sem exigir instalação de aplicação nativa.
- [ ] **RNF-MAN-01 — Blocos e regras reutilizáveis.** Cada bloco de conteúdo, bloco de interacção e regra é implementado como componente independente e reutilizável entre categorias; nenhuma categoria mantém cópia divergente de um bloco partilhado.
- [ ] **RNF-MAN-02 — Instrumentação suficiente.** Métricas e logs permitem diagnosticar falhas de check-in ou pagamento em produção sem depender de reprodução manual.

## Sistema visual e interface de Eventos

- [ ] **RNF-VIS-01 — Container e grelha.** Páginas públicas usam um container central com largura máxima entre 1 160 e 1 280 px, margens fluidas e padding mínimo de 16 px em mobile, 24 px em tablet e 32 px em desktop. Acima de 1 024 px, o perfil pode usar grelha de 12 colunas com identidade/contexto em 4–5 colunas e conteúdo/decisão em 7–8; abaixo de 768 px a ordem torna-se uma única coluna sem scroll horizontal. **Depende de:** RF-BASE-11 e RNF-MOB-01.
- [ ] **RNF-VIS-02 — Ritmo e acção principal.** Espaçamento deriva da escala `4, 8, 12, 16, 24, 32, 48, 64`; a acção primária é única por contexto, permanece visível por sticky apenas quando houver espaço e, em mobile, respeita safe areas, teclado, zoom, foco e conteúdo final. **Depende de:** RNF-ACE-01 e RF-EVT-20.
- [ ] **RNF-VIS-03 — Tipografia e largura de leitura.** Título, metadados, secções, corpo e legendas possuem níveis distintos; texto corrido mantém aproximadamente 45–75 caracteres por linha e largura máxima próxima de 720 px. Datas, preços, disponibilidade e estado não competem visualmente com o título. **Depende de:** RF-BASE-11, RF-EVT-21 e RNF-I18N-01.
- [ ] **RNF-VIS-04 — Tokens e temas seguros.** Cor, tipografia, espaçamento, raio, sombra, largura e movimento são tokens versionados. Temas do organizador só alteram tokens permitidos; contraste, foco, semântica, estados e geometria crítica permanecem protegidos. Nenhuma cor ou dimensão arbitrária entra num componente partilhado sem token aprovado. **Depende de:** RF-BASE-11, RNF-ACE-01 e RNF-MAN-01.
- [ ] **RNF-VIS-05 — Imagens e proporções.** Capa, avatar, cartão de evento, orador e galeria têm contratos de proporção, recorte, foco e fallback; `srcset`, formatos modernos e carregamento progressivo evitam descarregar imagem desktop no mobile. O layout reserva dimensões antes do carregamento para impedir saltos visuais. **Depende de:** RF-CNT-04, RNF-MOB-02 e RNF-DIS-01.
- [ ] **RNF-VIS-06 — Estados perceptíveis.** Hover, foco, activo, seleccionado, desactivado, carregamento, sucesso, aviso e erro são distinguíveis por mais do que cor. Skeleton preserva a geometria final; erro parcial não apaga conteúdo já disponível; estado vazio explica a próxima acção. **Depende de:** RNF-ACE-01, RNF-USA-03 e RF-EVT-36.
- [ ] **RNF-VIS-07 — Densidade e containers com propósito.** Cartão só agrupa conteúdo e acções que formam uma decisão ou unidade; evitar cartões dentro de cartões, gradientes decorativos, sombras excessivas e raios inconsistentes. Agenda, bilhete, anfitrião e evento relacionado usam padrões próprios e reutilizáveis. **Depende de:** RF-EVT-35 e RNF-MAN-01.
- [ ] **RNF-VIS-08 — Responsividade por conteúdo.** A composição é validada em 360/390, 768, 1 024 e 1 440 px, com títulos longos, múltiplos anfitriões, moedas extensas, traduções, evento gratuito/pago/esgotado e formulários com erro. Elementos podem mudar de posição, mas a ordem semântica e o acesso por teclado permanecem estáveis. **Depende de:** RNF-MOB-01, RNF-I18N-01 e RNF-ACE-01.
- [ ] **RNF-VIS-09 — Desempenho visual.** No perfil público, LCP deve ficar até 2,5 s no percentil 75 móvel, CLS até 0,1 e INP até 200 ms; capa não bloqueia título, data, localidade e acção principal. Terceiros, mapas e embeds carregam sob demanda. **Depende de:** RNF-DIS-01, RNF-MOB-02 e RNF-VIS-05.
- [ ] **RNF-VIS-10 — Independência visual.** As capturas de referência são evidência de pesquisa, não especificação pixel-perfect. Revisão de design deve confirmar que a Entrela não reutiliza activos, texto, marca, combinações distintivas ou implementação proprietária do produto observado. **Depende de:** RF-BASE-11 e RF-EVT-35.

## Pagamentos e operação moderna

- [ ] **RNF-PAG-01 — Escopo financeiro mínimo.** Checkout/tokenização acontece no Stripe ou provedor homologado; a Entrela nunca recebe ou guarda PAN/CVV.
- [ ] **RNF-PAG-02 — Webhook autenticado.** Validar assinatura sobre corpo bruto, tolerância contra replay, schema e unicidade por provedor/evento antes de confirmar pagamento.
- [ ] **RNF-PAG-03 — Integridade financeira.** Valores são inteiros em unidade mínima e moeda ISO 4217; cálculo é server-side, reembolso não excede pagamento e reconciliação detecta divergências.
- [ ] **RNF-PAG-04 — Angola.** Homologar parceiro `LOCAL_AO`, moedas, impostos, recibos, reembolso, chargeback e antifraude antes de activar dinheiro real.
- [ ] **RNF-OPE-01 — Observabilidade segura.** Logs JSON, `idDaRequisicao`, tracing e métricas ocultam autorização, cookies, token, PII, payload de webhook e conteúdo.
- [ ] **RNF-OPE-02 — Alertas e incidentes.** Alertar falha de SLO, job, webhook, backup, latência, acesso cross-tenant e anomalia de token; definir dono, severidade e runbook.
- [ ] **RNF-OPE-03 — Configuração validada.** Configuração do ambiente é validada no arranque por Zod; segredos não entram em `.env` de produção, OpenAPI ou Git.
- [ ] **RNF-QUA-01 — Pirâmide de testes.** Unidade para domínio/motor; integração com PostgreSQL/RLS/migrações; contrato HTTP/OpenAPI; ponta-a-ponta por categoria e regressão de invariantes.
- [ ] **RNF-QUA-02 — Gates de lançamento.** Piloto exige restauro validado, revisão de ameaça, teste de carga relevante, auditoria WCAG, scan de dependências e aprovação de privacidade/pagamento quando aplicável.
- [ ] **RNF-QUA-03 — Regressão visual e de interacção.** Componentes e páginas críticas de Eventos possuem testes de componente, acessibilidade e screenshots de referência nos viewports 390, 768 e 1 440 px; diferenças deliberadas exigem revisão e actualização explícita da baseline. **Depende de:** RNF-VIS-01 a RNF-VIS-09, RF-EVT-35 e RF-EVT-36.

## Cobertura mínima por categoria

- [ ] **Empresas:** consentimento de lead, exportação/CRM, QR em massa, quotas de campanha, domínios personalizados e cupões.
- [ ] **Eventos:** perfil/calendário responsivo, inscrição e aprovação, bilhética, capacidade/zona atómica, comunicação consentida, check-in idempotente, pagamentos/reembolsos, métricas e pós-evento.
- [ ] **Momentos:** isolamento de conteúdo íntimo, abertura temporal, bot neutro, sessão anónima e recordação autorizada.
- [ ] **Presentes:** QR/NFC copiável, ponto revogável, posse auditável e conteúdo privado por defeito.
- [ ] **Convites:** segmentos invisíveis entre si, RSVP/dieta minimizados, reenvio controlado e lembretes responsáveis.
- [ ] **Experiências:** análise agregada, QR/NFC/GPS com minimização, multilinguismo, carga por ponto e baixo consumo.

## Pronto quando

- [ ] Cada requisito tem teste, configuração, relatório de carga, exercício ou revisão anexada como evidência.
- [ ] Nenhum requisito crítico é marcado `[x]` sem data, responsável e prova verificável.

## 3. Regras de negócio — RN

> As regras abaixo foram consolidadas como referência de produto, mas permanecem `[ ]` até existirem implementação, teste automatizado e evidência de verificação.

## Plataforma e domínio comum

- [ ] **RN-GLO-01 — Marca única.** Entrela é a marca-mãe e a plataforma única; as seis categorias são submarcas/capacidades, nunca aplicações ou bases de dados isoladas.
- [x] **RN-GLO-02 — Categorias permitidas.** As categorias da plataforma são Empresas, Eventos, Momentos, Presentes, Convites e Experiências. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-GLO-03 — Uma categoria por experiência.** Cada `Experiencia` tem uma única categoria durante o ciclo de vida; não muda depois de publicação ou participação.
- [ ] **RN-GLO-04 — Jornada entre categorias.** Uma jornada multi-categoria cria experiências distintas e relacionadas; não reutiliza uma experiência publicada com categoria diferente. A relação é explícita, tipada e auditável (`ORIGINA`, `COMPLEMENTA`, `CONTINUA`, `SUBSTITUI`), liga apenas experiências autorizadas e nunca transfere propriedade, audiência ou métricas.
- [ ] **RN-GLO-05 — Teste Entrela.** Uma experiência deve ter pelo menos Tempo, Regra ou Ligação física. Se não tiver nenhum dos três, a validação bloqueia publicação como experiência Entrela e explica que conteúdo estático deve usar outro produto/modelo; operador não contorna a regra sem capacidade de piloto auditada.
- [ ] **RN-GLO-06 — Dono técnico.** Todo dado de negócio deriva de um único `negocio_id`; criadores pessoais usam negócio `PESSOAL`.
- [x] **RN-GLO-07 — Isolamento.** Dados, media, contactos, pedidos e análise de um negócio não podem atravessar para outro, salvo relação explicitamente autorizada. [Evidência](../implementacoes/004-persistencia-real-em-postgresql-18.md)
- [ ] **RN-GLO-08 — Conta pública opcional.** Quem cria, gere ou opera precisa de conta; destinatário, convidado e visitante podem usar experiência pública quando a política permitir.
- [ ] **RN-GLO-09 — Idiomas iniciais.** Interface inicia em `pt-AO` e `en`; conteúdo visível tem idioma predefinido e fallback editorial.
- [ ] **RN-GLO-10 — Sem tradução pessoal automática.** Texto íntimo, áudio e vídeo não são traduzidos automaticamente nem substituídos sem decisão do criador.
- [ ] **RN-GLO-11 — Conteúdo publicado.** O público lê somente versões publicadas e imutáveis; rascunho nunca é fonte de conteúdo público.
- [ ] **RN-GLO-12 — Direito separado de acesso.** `Direito` concede capacidade comercial; `ConcessaoDeAcesso`/`PontoDeAcesso` controla a porta de uma experiência. Os conceitos não se fundem.
- [ ] **RN-GLO-13 — Validação de papéis a cada pedido.** O papel do utilizador no negócio é verificado no servidor em cada pedido sensível (administrativo, publicação, exportação), nunca apenas uma vez no carregamento inicial da sessão.

## Estados e publicação

- [x] **RN-EST-01 — Experiência.** A transição permitida é `RASCUNHO → PUBLICADA ⇄ PAUSADA → ARQUIVADA`, com encerramento definitivo quando aplicável. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RN-EST-02 — Agendamento.** `AGENDADA` não é estado de experiência; uma experiência publicada pode produzir sessão `EM_ESPERA` até à abertura configurada. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-EST-03 — Versão.** Versões usam `RASCUNHO`, `VALIDADA`, `PUBLICADA` e `SUBSTITUIDA`; uma versão `PUBLICADA` não pode alterar nós, blocos, regras, traduções ou ficheiros relacionados.
- [x] **RN-EST-04 — Publicação atómica.** Validar conteúdo, media, regras, disponibilidade, autorização e direito antes de tornar a versão pública e criar pontos de acesso. No mínimo um bloco de conteúdo e um método de publicação/acesso precisam de estar definidos; sem os dois, a publicação é recusada. [Evidência](../implementacoes/007-repositorio-editorial-de-momentos-em-postgresql.md)
- [ ] **RN-EST-05 — Correcção pós-publicação.** Corrigir narrativa publicada exige nova versão ou nova experiência, preservando a recordação já entregue.
- [ ] **RN-EST-06 — Pausa.** Pausar bloqueia novas aberturas e futuras continuações; não elimina media, eventos ou auditoria.
- [ ] **RN-EST-07 — Arquivo.** Arquivar termina o acesso público e mantém dados conforme política de retenção.
- [ ] **RN-EST-08 — Último proprietário.** Nenhuma operação remove, rebaixa ou revoga o último `PROPRIETARIO` activo de um negócio.
- [ ] **RN-EST-09 — Correcção sem invalidar portas.** Conteúdo publicado nunca é alterado in-place. Qualquer correcção cria nova versão imutável da mesma experiência; os pontos de acesso existentes passam atomicamente à nova versão quando ela é publicada, sem mudar link/QR. Sessões já iniciadas continuam fixadas à versão que abriram. Alterar preço, disponibilidade, acesso ou revelação só afecta novas sessões/pedidos e exige aviso explícito na publicação.

## Tempo, regras e sessões

- [x] **RN-MOT-01 — Hora autoritativa.** `abre_em`, `expira_em` e condições temporais são calculados pelo relógio do backend em UTC; fuso IANA serve apresentação e definição local. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RN-MOT-02 — Disponibilidade.** Experiência não publicada, ponto inválido ou acesso negado nunca entrega conteúdo; antes de abrir a sessão fica `EM_ESPERA`, depois de expirar fica `EXPIRADA`. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-MOT-03 — Estados de sessão.** Sessão percorre `NOVA → EM_ESPERA | ATIVA | NEGADA | EXPIRADA`; uma sessão activa pode concluir em `CONCLUIDA`.
- [x] **RN-MOT-04 — Regra declarativa.** Regra tem gatilho, condições, acções, prioridade, escopo e versão; não contém código executável do criador. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RN-MOT-05 — Factos permitidos.** Regra só consulta factos registados de tempo, evento, sessão, participante, resposta, pagamento ou ponto de acesso. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RN-MOT-06 — Acções permitidas.** Motor só pode desbloquear/bloquear bloco, definir variável segura, concluir nó/experiência, emitir evento interno, conceder direito, emitir certificado ou criar cupão quando o manifesto permitir. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-MOT-07 — Idempotência.** A mesma acção do visitante, execução de regra, webhook, entrada ou pedido de recordação produz no máximo um efeito de negócio.
- [ ] **RN-MOT-08 — Projecção segura.** A resposta pública contém somente conteúdo desbloqueado na versão e sessão correctas; um ID/URL de bloco futuro não é atalho.
- [ ] **RN-MOT-09 — Pré-visualização.** Sessão de pré-visualização é isolada: não cria métrica, evento, progresso ou notificação de produção.
- [ ] **RN-MOT-10 — Evento e auditoria.** `EventoDeInteracao`, `ExecucaoDaRegra` e `RegistoDeAuditoria` são append-only; métricas são projecções, não substitutos do facto.
- [ ] **RN-MOT-11 — Randomização rastreável.** Quando o motor apresentar percursos ou perguntas em ordem aleatória, a ordem efectivamente mostrada a cada sessão é registada, para que relatórios e auditoria consigam reconstruir a decisão sem ambiguidade.

## Pontos físicos e acesso

- [ ] **RN-ACC-01 — Porta, não identidade.** URL, QR, NFC e código curto são portas de entrada/contexto; não provam identidade, leitura, posse ou autenticidade forte.
- [x] **RN-ACC-02 — Token opaco.** O token público não contém ID interno, e-mail, nome, conteúdo ou ligação directa de media. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-ACC-03 — Revogação.** Porta `REVOGADO`, `EXPIRADO` ou esgotada nunca entrega conteúdo protegido; regenerar porta não altera a versão publicada.
- [ ] **RN-ACC-04 — Métrica humana.** Resolver por `GET`, pré-carregamento e bot não contam como abertura. Abertura só acontece após gesto explícito válido.
- [ ] **RN-ACC-05 — QR/NFC copiável.** QR/NFC comum prova uso de porta, não posse de objecto. Quando uma categoria declarar autenticidade forte, deve usar credencial criptográfica individual em hardware homologado, com assinatura verificável, rotação/revogação e mensagem explícita do nível de garantia; QR/NFC comum nunca recebe essa alegação.
- [ ] **RN-ACC-06 — Sessão fixada.** Uma sessão pública fica ligada à versão publicada que abriu; publicação futura não muda a experiência em curso.
- [ ] **RN-ACC-07 — Limites de uso.** Cada consumo incrementa atomicamente o contador da porta. Ao atingir `maximo_de_usos`, novos consumos recebem estado `ESGOTADA`; sessões já autorizadas seguem a política da categoria. Reiniciar exige papel autorizado, motivo e auditoria e nunca apaga consumos anteriores.
- [ ] **RN-ACC-08 — Prova de proximidade real.** Quando uma regra depender de localização (percurso GPS de Experiências), só desbloqueia o ponto seguinte quando a posição do visitante confirmar proximidade real validada pelo backend; não deve ser possível avançar por adivinhação da sequência de pontos sem estar fisicamente no local.
- [ ] **RN-ACC-09 — Sem enumeração de experiências do criador.** Um participante ou visitante anónimo nunca consegue, por manipulação de parâmetros ou de identificador na URL/API, listar ou aceder a outras experiências do mesmo criador ou negócio.

## Pessoas, consentimento e comunicações

- [ ] **RN-PES-01 — Participantes.** Destinatário, convidado, participante, visitante, lead e colaborador são papéis de interacção, não permissões de negócio.
- [ ] **RN-PES-02 — Consentimento.** Consentimento é específico por finalidade, versionado e revogável.
- [ ] **RN-PES-03 — Segmento.** Um membro de segmento só recebe conteúdo daquele segmento se pertencer à mesma experiência e tiver autorização de acesso válida.
- [ ] **RN-PES-04 — Privacidade de audiência.** Convidado/visitante não vê automaticamente outros contactos, segmentos, respostas ou dados pessoais.
- [ ] **RN-PES-05 — Entrega histórica.** Reenvio de convite cria uma entrega adicional no histórico; não cria outro participante ou resposta duplicada.
- [ ] **RN-PES-06 — Comunicação.** Mensagens transaccionais seguem o evento que as justifica; marketing exige opt-in separado. O destinatário escolhe canais e pode cancelar marketing por canal. Por padrão, campanhas não urgentes são enviadas entre 08:00 e 20:00 no fuso do destinatário/evento, têm limite configurável e histórico; falha transitória usa retentativa limitada e falha permanente suprime o contacto até correcção.
- [ ] **RN-PES-07 — Dados sensíveis e menores.** Dieta, saúde, acessibilidade, localização, media sensível e dados de menores são recolhidos apenas com finalidade operacional explícita, vistos somente por papéis necessários e eliminados/anonimizados ao terminar a finalidade e o prazo legal. Menores exigem responsável/consentimento aplicável; exportação genérica e uso em marketing ficam proibidos.

## Dados, retenção e moderação

- [ ] **RN-DAD-01 — Cápsulas do tempo sobrevivem à subscrição.** Cápsulas do tempo e conteúdo com data de abertura futura são preservados independentemente do estado de subscrição/pagamento do criador nessa data; não podem expirar por falta de pagamento antes da data marcada.
- [ ] **RN-DAD-02 — Exportação com aviso antes de eliminar conta.** Ao eliminar uma conta, experiências de Momentos e Presentes com destinatário confirmado ficam disponíveis para exportação durante um período de aviso antes da eliminação definitiva.
- [ ] **RN-DAD-03 — Retenção mínima de bilhética pós-evento.** Dados de check-in e bilhética de um evento são retidos por um período mínimo após o evento, para efeitos de disputa ou reembolso, antes de poderem ser eliminados a pedido.
- [ ] **RN-MOD-01 — Atribuição e remoção individual.** Conteúdo submetido por terceiros (murais colectivos, comentários, livro de visitas) é sempre atribuível ao seu autor e removível individualmente pelo organizador, sem apagar o resto do conteúdo colectivo.
- [ ] **RN-MOD-02 — Conteúdo envolvendo menores.** Conteúdo sinalizado como envolvendo menores segue as regras de RNF-PRI-07 independentemente da categoria em que a experiência foi criada.
- [ ] **RN-MOD-03 — Denúncia suspende sem eliminar.** Denúncias de conteúdo suspendem a visibilidade pública do conteúdo denunciado até revisão, sem eliminação automática, para permitir contestação.

## Comércio e pagamentos

- [ ] **RN-PAG-01 — Valores.** Pedido e item usam moeda ISO 4217 e inteiros na menor unidade; total tem de conferir com subtotal, taxa e imposto.
- [ ] **RN-PAG-02 — Fonte de preço.** Produto, preço, moeda, desconto e direito são calculados/validados no backend, nunca aceites como decisão final do navegador.
- [ ] **RN-PAG-03 — Confirmação.** Só webhook autenticado e deduplicado altera pagamento para `CONFIRMADO` e concede direito uma única vez.
- [ ] **RN-PAG-04 — Retorno do checkout.** Retorno de navegador mostra estado, mas não concede direito, emite bilhete ou publica experiência.
- [ ] **RN-PAG-05 — Reembolso.** Reembolso não apaga pagamento e não pode ultrapassar o valor confirmado.
- [ ] **RN-PAG-06 — Provedores.** `STRIPE` e `LOCAL_AO` são adaptadores; `LOCAL_AO` não representa ainda uma marca/método de pagamento real.
- [ ] **RN-PAG-07 — Política comercial.** Homologar fornecedor angolano, moeda, impostos, factura/recibo, taxa, chargeback, prazos e critérios de reembolso antes de activar dinheiro real.
- [ ] **RN-PAG-08 — Comissões fixadas no momento da transacção.** Comissões de marketplace e taxas de transacção são calculadas e registadas no momento da transacção; uma alteração posterior da tabela de taxas nunca recalcula retroactivamente uma transacção já confirmada.

## Entrela Empresas

- [ ] **RN-EMP-01 — Relação contínua.** Empresas serve relação contínua entre marca e público; evento com data, bilhete/check-in ou operação de recinto pertence a Eventos.
- [ ] **RN-EMP-02 — Lead com finalidade.** Contacto capturado só pode ser exportado, usado ou integrado para a finalidade consentida.
- [ ] **RN-EMP-03 — Contexto de campanha.** QR em massa preserva campanha e origem (loja, região, stand ou material) sem misturar dados de negócios diferentes.
- [ ] **RN-EMP-04 — Cupão.** Cupão não ultrapassa expiração ou máximo de resgates configurado.
- [ ] **RN-EMP-05 — Agência.** Agência só acede a campanha de cliente dentro de relação de negócio activa e autorizada.
- [ ] **RN-EMP-06 — Atribuição.** Eventos preservam todas as origens elegíveis. Relatórios mostram primeiro toque, último toque e caminho; conversão operacional é atribuída ao último toque elegível antes da conversão, sem apagar os anteriores nem misturar negócios.
- [ ] **RN-EMP-07 — Domínio e marca.** Activação exige prova de controlo por DNS, TLS gerido/validado, estado auditado e plano autorizado. O negócio responde pelo conteúdo e marca; perda de verificação, abuso ou fim do direito desactiva o domínio personalizado e mantém um URL Entrela de recuperação quando a política permitir.
- [ ] **RN-EMP-08 — Formulário obrigatório antes da recompensa.** Um ponto de acesso de campanha só entrega o prémio/conteúdo depois de o formulário de contacto mínimo ser submetido, quando esse formulário estiver configurado como obrigatório.
- [ ] **RN-EMP-09 — Propriedade dos dados de contacto.** Dados de contacto capturados numa campanha pertencem ao negócio que a criou, nunca à Entrela; exportação e eliminação estão sempre disponíveis ao dono do negócio, sem depender de suporte manual.
- [ ] **RN-EMP-10 — White-label restrito ao plano empresarial.** Nenhuma conta gratuita ou de criador pessoal pode remover a marca Entrela; white-label só se activa em contas de plano empresarial autorizado.

## Entrela Eventos

- [ ] **RN-EVT-01 — Fronteira.** Eventos começa quando Convites precisa de bilhética, check-in, zona, sessões ou operação de capacidade.
- [ ] **RN-EVT-02 — Datas.** Evento e sessão não podem terminar antes de começar.
- [ ] **RN-EVT-03 — Capacidade.** Capacidade definida para evento, sessão, zona ou tipo de bilhete é positiva e não pode ser ultrapassada por concorrência.
- [ ] **RN-EVT-04 — Bilhete.** Bilhete é emitido apenas conforme estado de pedido/pagamento e regras de emissão.
- [ ] **RN-EVT-05 — Entrada.** Um bilhete validado novamente produz `DUPLICADO`, não outra entrada aceite; a segunda leitura fica sinalizada ao operador como possível duplicação ou fraude, nunca apenas silenciosamente ignorada.
- [ ] **RN-EVT-06 — Zona.** A entrada só é aceite na zona compatível com o tipo de bilhete/direito, independentemente da ordem em que as zonas forem lidas no check-in.
- [ ] **RN-EVT-07 — Certificado.** Certificado depende de condição de presença/conclusão validada pelo backend.
- [ ] **RN-EVT-08 — Capacidade cruzada.** A capacidade geral é o tecto absoluto. Para emitir ou reservar, todas as capacidades aplicáveis — evento, tipo, sessão e zona — precisam de vaga; a operação consome-as atomicamente. Um limite filho pode ser menor, nunca autoriza ultrapassar o pai.
- [ ] **RN-EVT-09 — Bilhete pós-venda.** Transferência só ocorre quando permitida e revoga a credencial anterior atomicamente; cancelamento liberta capacidade conforme política; alteração de tipo recalcula diferença server-side; vaga libertada é oferecida à lista de espera; reembolso segue RN-EVT-10, RN-EVT-11 e RN-PAG.
- [ ] **RN-EVT-10 — Reembolso revoga credencial.** Reembolsar um bilhete cancela automaticamente o acesso de check-in associado a esse bilhete; a credencial revogada não pode ser usada mesmo que ainda não tenha sido lida.
- [ ] **RN-EVT-11 — Política de reembolso do organizador.** O cancelamento de um bilhete pago segue a política de reembolso definida pelo organizador no momento da venda; a Entrela não impõe uma política única global.
- [ ] **RN-EVT-12 — Transformação em página de memória apenas após o fim.** A transformação automática da página do evento em página de memória só ocorre depois da data/hora de fim do evento, nunca antes.
- [ ] **RN-EVT-13 — Propriedade do calendário.** Um calendário pertence a exactamente um negócio; destacar evento de terceiro cria relação editorial revogável e nunca transfere propriedade, participantes, receita ou acesso operacional.
- [ ] **RN-EVT-14 — Publicação mínima.** Perfil só é publicado com título, capa/fallback, início e fim válidos, fuso IANA, formato presencial/online/híbrido, organizador responsável, política de inscrição, política de localização e pelo menos uma acção possível.
- [ ] **RN-EVT-15 — Localização protegida.** Endereço marcado como protegido nunca aparece em HTML, metadados sociais, mapa, API pública ou analytics antes da condição escolhida; localidade aproximada não pode permitir reconstruir o endereço com precisão indevida.
- [ ] **RN-EVT-16 — Prova social consentida.** Contagem de confirmados pode ser pública por configuração; nome, avatar ou perfil individual só aparecem com consentimento específico. Recusa ou retirada de consentimento não altera a validade da inscrição.
- [ ] **RN-EVT-17 — Modos de preço.** Cada tipo de ingresso usa exactamente um modo `GRATUITO | FIXO | PRECO_SUGERIDO | CORTESIA`; preço sugerido aceita valor igual ou superior ao mínimo, e gratuito nunca exige cartão.
- [ ] **RN-EVT-18 — Disponibilidade verdadeira.** “Vagas restantes”, “quase esgotado” e “esgotado” derivam da capacidade confirmada menos reservas válidas e emissões; o organizador não pode escrever escassez falsa como texto promocional.
- [ ] **RN-EVT-19 — Inscrição consistente.** Uma inscrição pertence ao mesmo evento, participante e política de acesso; campos obrigatórios e consentimentos são versionados no momento da submissão. Repetir o mesmo pedido idempotente não cria outro participante.
- [ ] **RN-EVT-20 — Reserva temporária de inventário.** Checkout pode reservar capacidade durante prazo curto; expiração ou falha liberta a reserva. Pagamento confirmado dentro do prazo converte a reserva atomicamente em emissão.
- [ ] **RN-EVT-21 — Aprovação e token gating.** Estado `PENDENTE` não concede bilhete, endereço protegido ou ligação privada. Apenas decisão autorizada ou prova de elegibilidade válida muda para `APROVADA`; rejeição mantém auditoria e comunicação neutra.
- [ ] **RN-EVT-22 — Promoção da lista de espera.** Vaga libertada é oferecida segundo ordem e política publicadas; a oferta tem validade, não ultrapassa capacidade e não cobra sem confirmação explícita. Expirada a oferta, a próxima pessoa elegível é promovida.
- [ ] **RN-EVT-23 — Submissão editorial.** Evento submetido a calendário fica `PENDENTE`; somente administrador desse calendário aprova destaque. Rejeição não despublica o evento no calendário próprio do organizador.
- [ ] **RN-EVT-24 — Seguir com consentimento.** Seguir calendário não autoriza marketing de terceiros. Contacto sem conta exige verificação; deixar de seguir interrompe campanhas futuras, preservando apenas prova mínima de consentimento/revogação.
- [ ] **RN-EVT-25 — Comunicação responsável.** Mensagem transaccional e marketing são finalidades distintas. Toda campanha respeita público, canal, janela horária, frequência, opt-out, estado de cancelamento e supressão; cancelado urgente pode ultrapassar janela apenas para informação operacional indispensável.
- [ ] **RN-EVT-26 — Inventário por tipo.** Soma de ingressos emitidos e reservas activas por tipo nunca ultrapassa o limite desse tipo nem a capacidade pai aplicável; aumentar capacidade exige autorização e auditoria.
- [ ] **RN-EVT-27 — Compra em grupo.** Comprador pode pagar por vários participantes, mas cada credencial pertence a uma pessoa ou lugar distinto. Transferência posterior segue política do evento e nunca duplica credencial.
- [ ] **RN-EVT-28 — Cupão.** Cupão aplica-se somente a eventos/tipos elegíveis, dentro de validade, limite total e limite por participante; desconto nunca produz total negativo e é registado no pedido.
- [ ] **RN-EVT-29 — Perguntas personalizadas.** O organizador define finalidade e obrigatoriedade; saúde, dieta, acessibilidade, menores e perfis sociais são opcionais salvo necessidade operacional justificada, com visibilidade e retenção restritas.
- [ ] **RN-EVT-30 — Menor privilégio operacional.** Coorganizador não recebe automaticamente facturação, exportação de contactos ou gestão de equipa; operador de check-in vê apenas dados necessários para validar entrada e não exporta a lista completa.
- [ ] **RN-EVT-31 — Duplicação e recorrência.** Duplicar evento cria nova identidade e rascunho. Série pode partilhar modelo, mas cada ocorrência conserva datas, capacidade, inscrições, pagamentos, credenciais, métricas e cancelamento próprios.
- [ ] **RN-EVT-32 — Calendário e fuso.** Ficheiro iCal, links externos, agenda e comunicações usam instante UTC e fuso IANA do evento; alteração relevante produz revisão sem duplicar ocorrência. Endereço protegido não entra no calendário antes da autorização.
- [ ] **RN-EVT-33 — Descoberta pública.** Só eventos `PUBLICADO`, classificados como públicos/listados e aprovados quando o calendário for de terceiro entram em pesquisa. Privado, rascunho, cancelado não informativo ou acesso por token nunca é indexado.
- [ ] **RN-EVT-34 — Ciclo público.** O relógio do backend decide transições temporais. `CANCELADO` prevalece sobre outros estados; `ESGOTADO` impede nova venda mas mantém informação; `TERMINADO` só vira `POS_EVENTO` quando conteúdo pós-evento autorizado estiver publicado.
- [ ] **RN-EVT-35 — Hierarquia estável.** Tema e modelo podem alterar expressão, mas não podem esconder ou inverter identidade, data/fuso, localização permitida, preço total, estado, organizador responsável e acção principal. Informação crítica não pode existir apenas dentro de imagem.
- [ ] **RN-EVT-36 — Contacto e denúncia.** Contacto usa relay ou canal protegido sem expor e-mail privado. Denúncia cria registo auditável, limita abuso, notifica operação e pode suspender conteúdo conforme RN-MOD-03 sem eliminar automaticamente o evento.
- [ ] **RN-EVT-37 — Tradução honesta.** Interface segue localidade do visitante; conteúdo traduzido automaticamente só aparece mediante acção explícita, é identificado como tradução e nunca substitui silenciosamente o original guardado pelo organizador.
- [ ] **RN-EVT-38 — Taxas e total.** Antes da confirmação, participante vê moeda, subtotal, desconto, imposto, taxa e total. Taxa obrigatória não pode surgir apenas depois de recolher pagamento; alteração de preço invalida reserva que ainda não foi confirmada.

## Entrela Momentos

- [x] **RN-MOM-01 — Escopo do MVP.** Momento MVP tem capa obrigatória, uma a seis etapas lineares e revelação final explícita. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [x] **RN-MOM-02 — Conteúdo mínimo.** Cada etapa precisa de texto ou media; media pendente/falhada ou etapa vazia impede publicação. [Evidência](../implementacoes/003-nucleo-partilhado-publicacao-e-dados.md)
- [ ] **RN-MOM-03 — Abertura.** Antes de `abre_em`, API, HTML, partilha social e media não revelam título íntimo, etapa ou ficheiro protegido.
- [ ] **RN-MOM-04 — Sem salto.** Continuar só aceita o bloco actualmente elegível; repetição não desbloqueia duas etapas.
- [ ] **RN-MOM-05 — Sem conta.** Destinatário abre por navegador sem conta, e-mail ou telefone.
- [ ] **RN-MOM-06 — Métrica honesta.** “Aberto” significa gesto humano explícito em sessão válida, não leitura, acordo, emoção ou compreensão.
- [ ] **RN-MOM-07 — Recordação.** Destinatário só pede recordação depois de concluir; criador pode pedir depois de publicar; dois pedidos equivalentes reutilizam o mesmo trabalho.
- [ ] **RN-MOM-08 — Regeneração.** Regenerar porta invalida a anterior imediatamente e mantém a experiência publicada.
- [ ] **RN-MOM-09 — Fora do MVP.** RSVP, NFC, localização, mapas, pagamento entre participantes, ramificação, jogo, mural e editor livre não entram no primeiro corte.
- [ ] **RN-MOM-10 — Retenção.** Media permanece enquanto o Momento estiver publicado. Após arquivo, entra em janela de recuperação de 90 dias e depois é eliminada, salvo obrigação legal ou exportação já solicitada; o criador e destinatário elegível recebem aviso antes do fim. Rascunho inactivo por 180 dias pode ser eliminado após dois avisos. Custos adicionais nunca reduzem uma janela já prometida sem aviso e opção de exportação.
- [ ] **RN-MOM-11 — Cápsula do tempo não retroactiva.** Uma cápsula do tempo não pode ter data de abertura no passado no momento da criação; o conteúdo fica inacessível até essa data, mesmo ao próprio criador.
- [ ] **RN-MOM-12 — Revelação do mural por prazo ou força manual.** Conteúdo de um mural colectivo só fica visível ao destinatário depois de atingido o prazo definido, ou de o organizador forçar a revelação manualmente.
- [ ] **RN-MOM-13 — Moderação obrigatória do mural.** Contribuições a um mural colectivo entram em moderação por definição; nunca ficam visíveis automaticamente sem aprovação do organizador (RN-MOD-01).

## Entrela Presentes

- [ ] **RN-PRE-01 — Fronteira.** Presente exige objecto físico concreto; presente corporativo com lead pertence a Empresas e presente dentro de evento pode usar Eventos.
- [ ] **RN-PRE-02 — Entrega.** Conteúdo configurado para abrir após entrega só é revelado depois da confirmação autorizada de entrega. A confirmação de recebimento só pode ser accionada pelo próprio destinatário (leitura do QR/NFC no objecto); o criador nunca confirma em nome do destinatário.
- [ ] **RN-PRE-03 — Posse.** Registo de posse exige sujeito válido; períodos do mesmo objecto não se sobrepõem.
- [ ] **RN-PRE-04 — Continuidade.** Alterar história/manual permitido não pode falsificar ou substituir certificado/versão histórica já emitida.
- [ ] **RN-PRE-05 — Autenticidade honesta.** NFC/QR comum não é certificado de autenticidade; a interface comunica o nível real de verificação.
- [ ] **RN-PRE-06 — Entrega e transferência.** A transferência de propriedade de um objecto com certificado de autenticidade exige confirmação de ambas as partes — proprietário actual e novo proprietário — antes de se tornar efectiva; resolução de contestação continua por definir.
- [ ] **RN-PRE-07 — Certificado.** Certificado identifica negócio emitente, objecto, versão, data e nível de verificação, recebe assinatura da Entrela/emitente e URL pública mínima de validação. Revogação preserva o registo histórico e mostra motivo/estado; transferência muda a posse, não reescreve o certificado anterior.

## Entrela Convites

- [ ] **RN-CNV-01 — Fronteira.** Convites resolve presença; quando exige bilhete pago, check-in, zona ou sessões, a operação sobe para Eventos.
- [ ] **RN-CNV-02 — Convite individual.** Cada convite referencia participante e concessão de acesso da mesma experiência.
- [ ] **RN-CNV-03 — RSVP.** Uma resposta por convite regista estado, acompanhantes não negativos e respostas configuradas.
- [ ] **RN-CNV-04 — Segmento.** Informação reservada só é apresentada ao grupo autorizado; um convidado não descobre outros segmentos, mesmo por alteração de parâmetros no mesmo link (validação no backend, nunca só na interface).
- [ ] **RN-CNV-05 — Reenvio.** Reenvio é histórico de entrega, não outro convidado nem nova presença.
- [ ] **RN-CNV-06 — Prazo.** Depois do prazo, convidado não altera RSVP salvo reabertura explícita ou acção auditada do organizador. Acompanhantes começam em zero e não ultrapassam o limite do convite/capacidade. Sem vaga, confirmação torna-se espera e só muda após promoção autorizada.
- [ ] **RN-CNV-07 — Transferência.** Convite individual só transfere quando marcado transferível. O novo destinatário confirma o contacto; a operação revoga o acesso anterior, mantém cadeia de auditoria e pode exigir aprovação. Reencaminhar URL não transfere convite nem autorização.
- [ ] **RN-CNV-08 — Sinalização de migração para Eventos.** Um convite que activa bilhética paga, check-in ou mais de uma sessão é sinalizado ao organizador como candidato a migrar para Eventos; a plataforma nunca migra a experiência sozinha (ver RN-EVT-01).
- [ ] **RN-CNV-09 — Recusa de RSVP é definitiva por padrão.** Uma recusa de RSVP é definitiva por padrão; alterar para confirmado depois de recusar exige novo convite ou acção explícita do organizador, nunca uma simples reedição do convidado.

## Entrela Experiências

- [ ] **RN-EXP-01 — Fronteira.** Experiências é exploração de espaço físico; se geração de leads for objectivo dominante, pertence a Empresas.
- [ ] **RN-EXP-02 — Percurso.** Paragem, ponto e bloco pertencem à versão/experiência correcta; uma regra não aponta para conteúdo de outra versão.
- [ ] **RN-EXP-03 — Conclusão.** Certificado, cupão ou recompensa depende de progresso concluído e regra validada pelo backend. Certificados emitidos em contexto educativo registam a data e, quando aplicável, são verificáveis externamente por link único de validação.
- [ ] **RN-EXP-04 — Conteúdo por ponto.** QR/NFC só entrega conteúdo autorizado pelo ponto, disponibilidade e sessão.
- [ ] **RN-EXP-05 — Forma do percurso.** Cada versão declara `LIVRE`, `LINEAR` ou `HIBRIDO`. Livre permite pontos publicados em qualquer ordem; linear exige o seguinte elegível; híbrido declara grupos livres e marcos ordenados. Publicação falha se houver ponto inalcançável ou ciclo sem saída permitido.
- [ ] **RN-EXP-06 — Localização.** GPS exige consentimento durante a sessão, precisão reportada aceitável e raio configurado entre 50 e 200 metros conforme o local; o backend combina ponto, tempo e sinais antiabuso. QR pode ser alternativa declarada, nunca prova silenciosa de GPS. Em conflito, prevalece a política mais restritiva e fica evento auditável.
- [ ] **RN-EXP-07 — Offline.** Modo offline usa pacote assinado, cifrado quando privado, com versão, escopo e validade máxima de 24 horas. Apenas acções permitidas são enfileiradas com chaves idempotentes; ao reconectar, o backend revalida ordem, tempo, acesso e conflito antes de aceitar progresso ou recompensa.

## Pronto quando

- [ ] Cada regra `[x]` está implementada por constraint, transacção, política, caso de uso ou teste de regressão.
- [ ] Cada regra `[ ]` tem decisão de produto aprovada antes de gerar código para a respectiva fase.
