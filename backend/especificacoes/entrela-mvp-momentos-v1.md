# Entrela Momentos — MVP 01: Revelação privada agendada

**Versão:** 1.0  
**Estado:** especificação de produto pronta para implementação  
**Primeira fatia vertical:** da criação à abertura e à recordação, no navegador.  
**Submarca:** Entrela Momentos.

---

## 1. Decisão de produto

O primeiro MVP é **Entrela Momentos**, no recorte estrito de uma **revelação privada agendada**.

> Uma pessoa cria uma narrativa íntima de uma a seis etapas, decide quando ela pode abrir, publica uma porta privada por link e QR opcional, e outra pessoa vive a revelação no telemóvel sem criar conta.

Escolher Momentos antes de Convites é deliberado:

- valida a característica que não é uma commodity: tempo, revelação, progressão e intimidade;
- exige apenas criador e destinatário, sem lista de convidados, grupos, RSVP, lembretes, envio em massa ou operação de check-in;
- cria os primitivos que Convites, Presentes e as restantes categorias reutilizarão: experiência, versão, bloco, regra, porta de acesso e evento de interacção;
- permite testar disposição para criar e pagar por uma experiência emocional, não apenas por uma página bonita.

Convites será a segunda fatia vertical construída sobre o mesmo motor.

---

## 2. Resultado que o MVP tem de provar

O MVP está correcto se uma pessoa conseguir, sozinha e sem apoio humano:

1. criar um Momento com uma narrativa curta;
2. pré-visualizá-lo em estados realistas;
3. definir abertura imediata ou numa data/hora;
4. publicá-lo para uma porta privada;
5. partilhar link ou QR;
6. fazer o destinatário abrir e avançar na sequência sem conta;
7. mostrar ao criador, sem invadir privacidade, que a experiência foi aberta e concluída;
8. permitir guardar a recordação depois da conclusão.

Não é um “editor de sites” genérico. É um fluxo guiado de Momentos, com uma narrativa, ritmo e revelação próprios.

---

## 3. Pessoas, permissões e idioma

| Papel | Tem conta? | Pode fazer |
|---|---:|---|
| **Criador** | Sim | Criar, editar rascunho, pré-visualizar, publicar, pausar, regenerar porta, ver análises e descarregar. |
| **Destinatário** | Não | Abrir, viver a sequência, continuar etapas e descarregar a recordação concluída. |
| **Operador Entrela** | Sim, interno | Apoio, moderação e diagnóstico sem acesso automático ao conteúdo privado. |

A interface do criador e do destinatário existe em **português (`pt-AO`) e inglês (`en`)**. O criador escolhe a língua do conteúdo pessoal. O MVP não traduz mensagens, vídeos ou áudios automaticamente; caso alguém queira duas línguas, cria uma versão editorial separada no futuro.

---

## 4. Escopo fechado

### Incluído

- Autenticação de criador e negócio pessoal.
- Fluxo guiado: ocasião → capa → narrativa → abertura → pré-visualização → publicação → partilha.
- Um modelo editorial de base e até três variações visuais próprias de Momentos; não uma biblioteca infinita de widgets.
- Capa, texto, imagem, áudio e vídeo.
- Uma a seis etapas, em ordem linear.
- Abertura imediata ou programada com fuso IANA.
- Contagem regressiva antes de abrir.
- Link privado opaco e QR PNG que chegam à mesma experiência.
- Pré-visualização isolada dos estados “antes de abrir”, “aberta” e de cada etapa.
- Abertura pública sem conta, sequência passo a passo e progresso no dispositivo.
- Painel mínimo: primeira abertura, última abertura, conclusão e origem link/QR de forma agregada.
- Arquivo de recordação protegido depois de concluir.
- Direito de publicação preparado para pagamento; no piloto pode ser atribuído manualmente por `Direito`, sem mudar o fluxo de produto.

### Explicitamente fora

- Murais e colaboradores.
- RSVP, convidados, grupos, lembretes ou envio directo por WhatsApp/SMS/e-mail.
- NFC, localização, mapas, check-in, bilhetes, cupões e pagamentos entre participantes.
- Editor livre por blocos, equipas, revisões colaborativas e versões bilingues de conteúdo.
- Tradução automática de conteúdo pessoal.
- Ramificações, respostas obrigatórias, pontuação ou lógica de jogo.
- Aplicação nativa; tudo funciona em navegador móvel moderno.

---

## 5. Limites editoriais e de media

| Elemento | Regra do MVP |
|---|---|
| Título | Obrigatório, 1–100 caracteres. |
| Destinatário | Nome opcional, 1–80 caracteres quando preenchido. |
| Capa | Obrigatória; imagem ou composição de cor/modelo. |
| Etapas | Entre 1 e 6, ordenadas e sem bifurcação. |
| Texto por etapa | Opcional, máximo de 1 600 caracteres. |
| Media por etapa | Até um elemento principal: imagem, áudio ou vídeo. |
| Imagem | JPG, PNG ou WebP; máximo 10 MB. |
| Áudio | MP3 ou M4A; máximo 20 MB. |
| Vídeo | MP4; máximo 100 MB, processado antes da publicação. |
| Total de media | Máximo 300 MB por experiência no MVP. |
| Revelação | A última etapa é marcada como final e só é desbloqueada depois da anterior. |

Estes limites são de produto, não meras validações de interface. A API e o processamento de ficheiros devem recusá-los também no servidor.

---

## 6. Fluxo de ponta a ponta

```text
Criador autenticado
  → cria rascunho
  → escolhe apresentação
  → escreve capa e 1–6 etapas
  → define abertura
  → pré-visualiza em sandbox
  → valida/publica
  → recebe link secreto e QR
  → partilha fora da Entrela

Destinatário sem conta
  → abre link ou QR
  → vê espera ou capa
  → toca em “Abrir”
  → vive cada etapa
  → conclui
  → descarrega recordação (opcional)

Criador
  → vê abertura/conclusão agregadas
  → pode pausar, arquivar ou regenerar a porta
```

### Ecrãs e rotas mínimas

| Rota | Pessoa | Responsabilidade |
|---|---|---|
| `/momentos/novo` | Criador | Iniciar rascunho a partir de um modelo. |
| `/momentos/:id/editar` | Criador | Capa, etapas, media e abertura. |
| `/momentos/:id/pre-visualizar` | Criador | Sandbox sem eventos de produção. |
| `/momentos/:id/publicar` | Criador | Validação, direito de publicação e porta privada. |
| `/momentos/:id/painel` | Criador | Estado, link/QR, análises, pausa e arquivo. |
| `/momento/:token` | Destinatário | Resolver público: espera, experiência activa ou acesso revogado. |
| `/momento/:token/recordacao` | Destinatário | Pedido/entrega de arquivo depois de concluir. |

O URL público usa só o token opaco. O ID interno da experiência, o e-mail do criador e o nome do destinatário nunca aparecem na URL.

---

## 7. Histórias de utilizador e critérios de aceitação

### 7.1 Criar e guardar um rascunho

**Como criador**, quero iniciar um Momento sem perder o que já fiz.

- Ao iniciar, a aplicação cria `Experiencia(categoria=MOMENTOS, estado=RASCUNHO)` e uma `VersaoDaExperiencia(RASCUNHO)` do negócio pessoal do criador.
- Título, destinatário e língua são guardados automaticamente após alteração válida.
- Rascunho não tem `versao_publicada_id`, `PontoDeAcesso` ativo nem URL pública.
- Só membros com `PROPRIETARIO`, `ADMINISTRADOR` ou `EDITOR` do negócio podem ler/alterar o rascunho.

### 7.2 Escolher uma apresentação cuidada

**Como criador**, quero uma experiência bonita sem desenhar uma página do zero.

- O criador escolhe um modelo editorial de Momentos, não uma grelha de componentes genéricos.
- Cada modelo define apenas ritmo visual, tipografia, transições e composição da capa; não altera regras de acesso nem dados.
- A escolha pode ser mudada até publicar sem apagar texto ou media.
- O modelo respeita preferências de redução de movimento no navegador público.

### 7.3 Construir a narrativa

**Como criador**, quero combinar palavras e recordações numa sequência clara.

- A capa é obrigatória e as etapas são numeradas de 1 a 6.
- O criador pode inserir, apagar e reordenar etapas enquanto o rascunho estiver aberto.
- Cada etapa precisa de texto ou media; uma etapa sem conteúdo não passa na validação de publicação.
- Upload mostra estado `PENDENTE → PRONTO | FALHOU`; media `PENDENTE` ou `FALHOU` impede publicação.
- A última etapa é explicitamente a revelação final e não pode ser removida sem escolher outra como final.

### 7.4 Definir o momento de abertura

**Como criador**, quero que a narrativa só abra no momento certo.

- Opções: `ABRIR_AGORA` ou `AGENDAR_ABERTURA`.
- Em agendamento, data, hora e fuso IANA são obrigatórios; a API converte e guarda `abre_em` em UTC.
- Antes de `abre_em`, a rota pública devolve apenas estado `EM_ESPERA`, metadados neutros e contagem regressiva; texto, media e dados de etapas não são enviados ao cliente.
- O relógio válido é o servidor. Alterar a hora do telemóvel não abre conteúdo.
- O MVP não tem prazo de expiração obrigatório; este campo fica preparado no motor mas oculto no editor inicial.

### 7.5 Pré-visualizar sem tocar na experiência real

**Como criador**, quero verificar a revelação antes de a enviar.

- A pré-visualização permite simular `EM_ESPERA`, `ATIVA` e qualquer etapa.
- Funciona com uma sessão `PRE_VISUALIZACAO`, isolada da versão publicada e dos eventos de produção.
- Não aumenta métricas, não altera progresso do destinatário e não envia notificações.
- O editor mostra erros de conteúdo, media, abertura e regras antes de permitir a publicação.

### 7.6 Publicar e receber a porta privada

**Como criador**, quero partilhar apenas depois de a experiência estar válida.

- Publicação exige rascunho válido e `Direito(PUBLICAR_MOMENTO)` ativo. No piloto, esse direito pode ser concedido internamente; quando o checkout entrar, pagamento confirmado cria o mesmo direito.
- A publicação congela a versão e marca `Experiencia.estado=PUBLICADA`.
- O sistema cria um `PontoDeAcesso(tipo=URL)` e um `PontoDeAcesso(tipo=QR)` associados à mesma experiência e versão ativa; ambos resolvem a mesma rota pública.
- A aplicação oferece copiar link, Web Share quando disponível e descarregar QR PNG/SVG. Não envia mensagens em nome do criador neste MVP.
- Não se publica por retorno de navegador de pagamento. Se houver checkout, só webhook validado pode criar o direito.

### 7.7 Abrir sem criar conta

**Como destinatário**, quero entrar sem fricção e sem expor a mensagem num preview de rede social.

- Abrir link/QR no navegador não pede registo, e-mail ou telefone.
- O resolver identifica bots conhecidos de pré-visualização e devolve apenas metadados neutros de partilha; não emite `EXPERIENCIA_ABERTA`, não expõe media privado e não avança etapas.
- Para uma pessoa real, o primeiro toque explícito em “Abrir” cria/recupera `SessaoDeInteracao` e emite `EXPERIENCIA_ABERTA`.
- Se a porta estiver `REVOGADO`, expirada ou pausada, o público recebe uma página clara sem revelar conteúdo anterior.

### 7.8 Viver a sequência

**Como destinatário**, quero viver uma etapa de cada vez sem conseguir saltar a narrativa.

- A capa activa a primeira etapa; cada toque em “Continuar” emite `BLOCO_CONTINUADO` para o servidor.
- O servidor avalia a regra correspondente e devolve apenas blocos desbloqueados daquela sessão.
- Endereços, chamadas de API ou IDs de bloco directos não revelam etapas bloqueadas.
- Refresh preserva progresso na mesma sessão/dispositivo, sem duplicar eventos nem desbloqueios.
- Quando a etapa final termina, a sessão fica `CONCLUIDA` e emite um único evento de conclusão.

### 7.9 Guardar a recordação

**Como destinatário ou criador**, quero conservar a narrativa depois de a viver.

- Depois de conclusão, o destinatário pode pedir um arquivo da recordação; o criador pode pedir a qualquer momento depois de publicar.
- O arquivo é gerado de modo assíncrono, inclui uma versão HTML/PDF legível e os media originais aos quais o solicitante tem direito.
- A entrega usa URL assinada, de curta duração, e é registada em auditoria.
- Pedido anterior pode ser reutilizado enquanto válido; dois toques não geram dois jobs iguais.

### 7.10 Acompanhar sem fingir certeza

**Como criador**, quero saber se chegou sem a plataforma dizer que alguém “leu” ou “compreendeu”.

- O painel apresenta primeira abertura, última abertura, conclusão e origem `URL | QR` de modo agregado.
- Se o destinatário é anónimo, o painel não atribui esses eventos a uma pessoa específica.
- “Aberto” significa apenas que houve toque explícito numa sessão humana; não significa leitura, acordo ou emoção.
- O criador pode pausar a experiência, arquivá-la ou regenerar as portas. Regenerar invalida as portas anteriores imediatamente.

---

## 8. Estados e regras de produto

```text
Experiência: RASCUNHO → PUBLICADA ⇄ PAUSADA → ARQUIVADA

Sessão pública: NOVA → EM_ESPERA | ATIVA | NEGADA
                EM_ESPERA → ATIVA
                ATIVA → CONCLUIDA
```

- **Agendada não é estado de publicação.** É uma `PUBLICADA` cuja sessão está `EM_ESPERA` até à janela de abertura.
- Depois de publicar, o conteúdo fica congelado no MVP. Para corrigir uma narrativa, o criador duplica ou cria uma nova versão, em vez de alterar uma recordação já entregue.
- Pausar bloqueia novas aberturas e futuras etapas; não apaga eventos, media ou auditoria.
- Arquivar termina acesso público e mantém dados segundo política de retenção.

---

## 9. Dados mínimos tocados pelo MVP

| Necessário agora | Uso no fluxo |
|---|---|
| `utilizadores`, `negocios`, `membros_do_negocio` | Criador e negócio pessoal. |
| `experiencias`, `versoes_da_experiencia`, `nos_da_experiencia`, `blocos`, `traducoes_do_bloco` | Narrativa e versão publicada. |
| `ficheiros`, `ficheiros_do_bloco` | Media privado. |
| `politicas_de_disponibilidade`, `regras`, `execucoes_da_regra` | Data de abertura e sequência linear. |
| `pontos_de_acesso`, `sessoes_de_interacao`, `progresso_dos_participantes` | Link/QR e continuidade no dispositivo. |
| `eventos_de_interacao`, `registos_de_auditoria` | Métricas e segurança. |
| `direitos` | Publicação por piloto ou pagamento futuro. |

Não criar neste MVP `Convite`, `RespostaDePresenca`, `Bilhete`, `RegistoDeEntrada`, `Cupao`, `Percurso` ou `AssociacaoDeEtiquetaNfc`; o domínio já os prevê, mas essas capacidades ainda não existem na interface.

---

## 10. Contrato técnico mínimo

| Operação | Resultado obrigatório |
|---|---|
| `POST /v1/momentos` | Cria experiência e versão rascunho. |
| `PATCH /v1/momentos/:id` | Actualiza apenas rascunho do negócio autorizado. |
| `POST /v1/momentos/:id/ficheiros` | Faz upload validado e retorna estado de processamento. |
| `POST /v1/momentos/:id/sessoes-de-pre-visualizacao` | Cria sandbox que nunca grava eventos de produção. |
| `POST /v1/momentos/:id/publicacoes` | Valida, exige direito e cria versão/portas atómicas. |
| `GET /momento/:token` | Resolve porta sem expor conteúdo bloqueado. |
| `POST /momento/:token/abrir` | Cria/retoma sessão após gesto humano explícito. |
| `POST /momento/:token/continuar` | Regista evento, aplica regra idempotente e devolve projecção segura. |
| `POST /momento/:token/solicitacoes-de-recordacao` | Cria/reutiliza job de recordação conforme direito. |
| `POST /v1/momentos/:id/revogacoes-de-acesso` | Pausa ou regenera portas com auditoria. |

O contrato é server-authoritative: cliente envia uma intenção, o servidor valida acesso, tempo e estado e devolve a projecção permitida. Não colocar a regra de revelação apenas em React ou JavaScript no navegador.

---

## 11. Qualidade, privacidade e acessibilidade

- **Mobile first:** deve ser utilizável em 360 px de largura e em ligação móvel comum.
- **Sem aplicação:** o destinatário só usa navegador; QR abre web responsiva.
- **Movimento:** transições têm preferência reduzida quando `prefers-reduced-motion: reduce` está activa.
- **Media:** imagem tem texto alternativo; áudio e vídeo aceitam legenda/transcrição no modelo de dados, mesmo se a entrada inicial tornar alguns campos opcionais.
- **Segurança:** media privado é entregue apenas por URL assinada após autorização; token público tem alta entropia, hash em repouso e limite de tentativa por IP/token.
- **Privacidade:** IP é agregado/anonimizado para análises; conteúdo pessoal, contacto e media não entram em eventos analíticos.
- **Resiliência:** upload incompleto não publica; recarregar página não duplica continuação; perder rede mostra estado recuperável, sem revelar etapa seguinte.
- **I18n:** datas e contagem regressiva respeitam a localidade do visitante, mantendo o instante de abertura definido pelo fuso da experiência.

---

## 12. Critérios de saída para piloto

O MVP está pronto para teste controlado quando todos os cenários abaixo passam em telemóvel e desktop:

1. Criador publica uma experiência de seis etapas sem contacto de suporte.
2. Antes de `abre_em`, API, HTML e preview social não expõem o conteúdo da primeira etapa.
3. Ao chegar a `abre_em` no servidor, a mesma porta muda de `EM_ESPERA` para `ATIVA` sem nova publicação.
4. Link e QR chegam à mesma experiência, mas análises distinguem a origem.
5. Dois cliques ou refresh em “Continuar” desbloqueiam uma única etapa.
6. Pré-visualização não aparece no painel de produção.
7. Regenerar a porta anterior bloqueia-a imediatamente e a nova mantém a experiência.
8. Destinatário consegue concluir sem conta em `pt-AO` e `en` para a interface.
9. Arquivo só é entregue após autorização e não fica com URL permanente público.
10. Criador vê abertura e conclusão sem identidade inventada ou afirmação de que a mensagem foi lida.

Depois deste piloto, a decisão é baseada em evidência: taxa de publicação, abertura, conclusão, pedidos de repetição e vontade de pagar. Convites entra em seguida reutilizando o domínio e o motor, não como uma nova aplicação.
