# Entrela — Motor de tempo, regras e ligação física

**Versão:** 1.1  
**Estado:** especificação técnica canónica  
**Nomenclatura:** português, sem acentos nos identificadores.  
**Objectivo:** um único motor para as seis submarcas.

---

## 1. Decisão de arquitectura

O motor junta duas responsabilidades que não devem ser confundidas:

1. Máquinas de estado pequenas para experiência, sessão, pagamento e acesso.
2. Regras declarativas para decidir o que muda quando ocorre um evento.

Não existe uma máquina de estados gigante, nem `if` espalhado por cada categoria. Cada submarca fornece um manifesto de capacidades; o motor e os factos fundamentais são os mesmos.

O motor não executa JavaScript, SQL, templates ou webhooks arbitrários do criador. Aceita apenas uma estrutura validada de `gatilho`, `condicoes` e `acoes`.

---

## 2. As três camadas em código

| Camada | Representação | Autoridade |
|---|---|---|
| Tempo | `PoliticaDeDisponibilidade`, UTC, fuso IANA e condições temporais | Relógio do servidor. |
| Regra | `Regra(gatilho, condicoes, acoes)` declarativa e versionada | Avaliador no servidor. |
| Ligação física | `PontoDeAcesso` do tipo QR, NFC ou link | Resolver Entrela no servidor. |

Uma experiência pode usar uma, duas ou três camadas. Momentos usa tempo e sequência; Presentes acrescenta objecto/QR; Empresas usa QR e formulário; Experiências usa pontos físicos e percurso.

---

## 3. Entidades do motor

```text
Experiencia
└── VersaoDaExperiencia
    ├── PoliticaDeDisponibilidade
    ├── Bloco[] / NoDaExperiencia[]
    └── Regra[]
Experiencia
├── PontoDeAcesso[]              link, QR, NFC
├── SessaoDeInteracao[]          visitante, convidado ou utilizador
│   ├── EventoDeInteracao[]      factos imutáveis
│   └── ProgressoDoParticipante  projecção do desbloqueio
└── ExecucaoDaRegra[]            idempotência e auditoria
```

| Entidade | Responsabilidade | Não é |
|---|---|---|
| `VersaoDaExperiencia` | Definição publicada imutável | Rascunho lido pelo público. |
| `PoliticaDeDisponibilidade` | Decide espera, abertura ou expiração | Cronómetro apenas visual. |
| `Bloco` / `NoDaExperiencia` | Conteúdo que pode ser mostrado | A autorização de acesso. |
| `Regra` | Condição e efeito permitidos | Código livre do cliente. |
| `PontoDeAcesso` | Entrada e contexto físico/digital | Identidade de quem entrou. |
| `SessaoDeInteracao` | Visita com progresso | Conta obrigatória. |
| `EventoDeInteracao` | Facto ocorrido, append-only | Contador mutável. |
| `ExecucaoDaRegra` | Prova de execução única | Log descartável. |

Os campos e nomes SQL estão no [esquema de domínio](./entrela-dominio-e-esquema-v1.md).

---

## 4. Máquinas de estado

### 4.1 Experiência

```text
RASCUNHO ──publicar──> PUBLICADA ──pausar──> PAUSADA ──retomar──> PUBLICADA
    │                                      │
    └──────────────arquivar────────────────┴──────────────> ARQUIVADA
PUBLICADA ──encerrar definitivamente──> ENCERRADA
```

`AGENDADA` não é estado de experiência. A experiência já está `PUBLICADA`; a política temporal define se uma sessão está `EM_ESPERA` ou `ATIVA`.

### 4.2 Sessão de interacção

```text
NOVA ──resolver entrada──> EM_ESPERA | ATIVA | NEGADA | EXPIRADA
EM_ESPERA ──hora/condição satisfeita──> ATIVA
ATIVA ──condição final satisfeita──> CONCLUIDA
ATIVA | EM_ESPERA ──fim da janela──> EXPIRADA
```

| Estado | Resposta pública |
|---|---|
| `EM_ESPERA` | Capa segura e contagem regressiva; nenhum conteúdo bloqueado. |
| `ATIVA` | Apenas projecção autorizada daquela sessão. |
| `CONCLUIDA` | Recordação e próximos passos permitidos. |
| `NEGADA` | Porta revogada, senha errada ou limite excedido. |
| `EXPIRADA` | Janela terminou; conteúdo continua protegido. |

### 4.3 Pagamento e direito

```text
PENDENTE ──webhook válido──> CONFIRMADO ──uma vez──> DIREITO_ATIVO
PENDENTE ──falha/cancelamento──> FALHOU | CANCELADO
CONFIRMADO ──reembolso──> REEMBOLSADO
```

O retorno do checkout no navegador não altera estado final. Só webhook autenticado pode confirmar pagamento e criar `Direito`.

---

## 5. Política de disponibilidade

```json
{
  "modo": "JANELA",
  "fusoHorario": "Africa/Luanda",
  "abreEm": "2026-12-24T19:00:00Z",
  "expiraEm": null,
  "apresentacaoDeEspera": "CONTAGEM_REGRESSIVA"
}
```

```text
se experiencia.estado != PUBLICADA              → NEGADA
se ponto de acesso não é válido                  → NEGADA
se agora < abreEm                                → EM_ESPERA
se expiraEm existe e agora >= expiraEm           → EXPIRADA
caso contrário                                   → ATIVA
```

O navegador pode desenhar uma contagem regressiva, mas o servidor decide sempre se entrega a próxima etapa.

---

## 6. Regras declarativas

### 6.1 Forma canónica

```json
{
  "chave": "revelar-cena-2",
  "escopo": "SESSAO",
  "estado": "ATIVA",
  "prioridade": 100,
  "gatilho": "BLOCO_CONTINUADO",
  "quando": {
    "todas": [
      { "facto": "evento.chaveDoBloco", "operador": "igual", "valor": "cena-1" },
      { "facto": "sessao.estado", "operador": "igual", "valor": "ATIVA" }
    ]
  },
  "entao": [
    { "tipo": "DESBLOQUEAR_BLOCO", "chaveDoBloco": "cena-2" }
  ]
}
```

| Elemento | Significado |
|---|---|
| `chave` | Identificador estável e único na versão. |
| `escopo` | `SESSAO`, `PARTICIPANTE` ou `EXPERIENCIA`. |
| `prioridade` | Ordem determinística para o mesmo evento. |
| `gatilho` | Facto que pede avaliação. |
| `quando` | Árvore de condições sem efeito lateral. |
| `entao` | Acções permitidas e validadas. |

### 6.2 Gatilhos iniciais

| Gatilho | Quando ocorre | Categorias iniciais |
|---|---|---|
| `PONTO_DE_ACESSO_RESOLVIDO` | Link, QR ou NFC foi resolvido | Todas. |
| `EXPERIENCIA_ABERTA` | Pessoa toca explicitamente em abrir | Todas. |
| `BLOCO_CONTINUADO` | Pessoa conclui ou avança uma etapa | Momentos e Experiências. |
| `FORMULARIO_SUBMETIDO` | Formulário passou validação | Empresas, Convites, Experiências. |
| `RESPOSTA_DE_PRESENCA_ATUALIZADA` | Presença mudou | Convites e Eventos. |
| `PAGAMENTO_CONFIRMADO` | Webhook válido confirmou pagamento | Eventos, Presentes e publicação paga. |
| `ENTRADA_ACEITE` | Bilhete entrou com sucesso | Eventos. |
| `HORA_DO_SISTEMA_ATINGIDA` | Job do servidor alcançou hora marcada | Fase posterior. |

### 6.3 Factos permitidos

| Grupo | Factos |
|---|---|
| Tempo | `agora`, `disponibilidade.estaAberta`, `sessao.segundosDeVida` |
| Evento | `evento.tipo`, `evento.chaveDoBloco`, `evento.tipoDePontoDeAcesso` |
| Sessão | `sessao.estado`, `sessao.idioma`, `sessao.blocosDesbloqueados` |
| Participante | `participante.tipo`, `participante.segmento`, atributos explicitamente permitidos |
| Resposta | `submissao.resposta.<chave>` para perguntas com estrutura validada |
| Pagamento | `pagamento.estado`, `pedido.tipo`, `direito.ativo` |
| Porta | `pontoDeAcesso.tipo`, `pontoDeAcesso.tipoDeAncora`, `pontoDeAcesso.canalDeOrigem` |

Não permitir expressões livres, consulta à base de dados, IP exacto, contactos, ficheiros privados ou cálculos em linguagem livre.

### 6.4 Operadores e condições

```text
todas[] | qualquer[] | nao
igual | diferente | estaEm | existe
maiorQue | maiorOuIgual | menorQue | menorOuIgual
foiRespondida | contem
```

O validador recusa facto não registado, operador incompatível ou condição que dependa de dado sensível sem consentimento.

### 6.5 Acções permitidas

| Acção | Efeito |
|---|---|
| `DESBLOQUEAR_BLOCO` | Torna um bloco elegível na projecção. |
| `BLOQUEAR_BLOCO` | Oculta um bloco quando o manifesto permitir. |
| `DEFINIR_VARIAVEL` | Define variável pequena, tipada e sem PII. |
| `MARCAR_NO_COMO_CONCLUIDO` | Conclui etapa/ponto de interesse. |
| `MARCAR_EXPERIENCIA_COMO_CONCLUIDA` | Finaliza a experiência naquele escopo. |
| `EMITIR_EVENTO_INTERNO` | Produz facto interno auditável. |
| `CONCEDER_DIREITO` | Só após pagamento/validação autorizada. |
| `EMITIR_CERTIFICADO` | Fase posterior e template aprovado. |
| `CRIAR_CUPAO` | Fase posterior e limites de campanha. |

---

## 7. Execução segura e idempotente

```text
1. Resolver PontoDeAcesso opaco no servidor.
2. Validar Experiencia, publicação, disponibilidade e política de acesso.
3. Criar ou retomar SessaoDeInteracao.
4. Validar intenção do cliente e registar EventoDeInteracao imutável.
5. Seleccionar regras ATIVAS com o mesmo gatilho.
6. Avaliar condições com factos autorizados.
7. Executar acções numa transacção.
8. Gravar ExecucaoDaRegra única por regra + evento + escopo.
9. Actualizar ProgressoDoParticipante e devolver projecção segura.
```

| Caso | Chave de idempotência |
|---|---|
| Acção de visitante | `sessao_id + id_da_acao_do_cliente` |
| Execução de regra | `regra_id + evento_de_interacao_id + chave_do_escopo` |
| Webhook de pagamento | `provedor + identificador_do_evento_no_provedor` |
| Registo de entrada | `bilhete_id + id_da_tentativa_no_portao` |
| Ficheiro de recordação | `experiencia_id + solicitante + versao_publicada_id` enquanto pendente |

Dois toques em “Continuar”, refresh ou repetição de webhook devolvem o mesmo resultado; não desbloqueiam duas etapas nem concedem dois direitos.

---

## 8. QR e NFC como pontos de acesso

```text
PontoDeAcesso
- tipo: URL | QR | NFC | CODIGO_CURTO
- hmacDoTokenPublico
- experienciaId
- ancoraFisicaId?
- chaveDoNoDeDestino?
- estado: ATIVO | REVOGADO | EXPIRADO
- iniciaEm?, terminaEm?, maximoDeUsos?
- canalDeOrigem
- nivelDeVerificacao: PRESENCA | TOKEN | HARDWARE
```

1. QR e NFC são portas, não conteúdo nem identidade da pessoa.
2. A porta contém URL opaca que chama o resolver Entrela, nunca URL directa de media.
3. Um QR/NFC pode ser copiado; no lançamento prova uso da porta, não posse física garantida.
4. Revogar/regenerar a porta não altera conteúdo publicado, apenas o caminho de acesso.
5. Autenticidade forte de objecto requer hardware ou assinatura posterior; não fingir que NFC comum resolve isso.

---

## 9. Manifestos por submarca

| Categoria | Papéis | Entradas | Regras iniciais | Capacidades |
|---|---|---|---|---|
| Momentos | Criador, destinatário | Link secreto, QR | Tempo, sequência, revelação | Capa, media, etapas, recordação. |
| Presentes | Ofertante, destinatário, parceiro | QR, NFC, link | Entrega, scan, tempo | História do objecto, mensagem, garantia. |
| Convites | Organizador, convidado | Link individual | Presença, prazo, segmento | Informação, presença, perguntas, contagem. |
| Eventos | Organizador, participante, operador | Bilhete, QR, link | Pagamento, entrada, sessão/zona | Agenda, acesso, certificado. |
| Empresas | Marca, operador, contacto potencial | QR em massa, link | Formulário, cupão, campanha | Página, formulário, cupão, conteúdo regional. |
| Experiências | Instituição, visitante | QR/NFC por ponto, link | Entrada em ponto, resposta, conclusão | Percurso, ponto de interesse, questionário. |

No primeiro MVP só Momentos usa a interface completa do motor. As outras linhas são contratos que impedem lógicas paralelas quando forem lançadas.

---

## 10. Configuração exacta do MVP Momentos

```json
{
  "categoria": "MOMENTOS",
  "disponibilidade": {
    "modo": "JANELA",
    "fusoHorario": "Africa/Luanda",
    "abreEm": "2026-12-24T19:00:00Z"
  },
  "acesso": {
    "modo": "NAO_LISTADA",
    "exigeConta": false
  },
  "blocos": [
    { "chave": "capa", "tipo": "CAPA", "visibilidade": "INICIAL" },
    { "chave": "cena-1", "tipo": "REVELACAO", "visibilidade": "BLOQUEADO" },
    { "chave": "cena-2", "tipo": "REVELACAO", "visibilidade": "BLOQUEADO" },
    { "chave": "final", "tipo": "REVELACAO", "visibilidade": "BLOQUEADO" }
  ],
  "regras": [
    {
      "chave": "abrir-cena-1",
      "escopo": "SESSAO",
      "gatilho": "BLOCO_CONTINUADO",
      "quando": { "todas": [{ "facto": "evento.chaveDoBloco", "operador": "igual", "valor": "capa" }] },
      "entao": [{ "tipo": "DESBLOQUEAR_BLOCO", "chaveDoBloco": "cena-1" }]
    },
    {
      "chave": "concluir-momento",
      "escopo": "SESSAO",
      "gatilho": "BLOCO_CONTINUADO",
      "quando": { "todas": [{ "facto": "evento.chaveDoBloco", "operador": "igual", "valor": "final" }] },
      "entao": [{ "tipo": "MARCAR_EXPERIENCIA_COMO_CONCLUIDA" }]
    }
  ]
}
```

Antes de `abreEm`, o resolver devolve `EM_ESPERA`; nenhuma regra de sequência corre e nenhum bloco protegido chega ao cliente.

---

## 11. Validação, pré-visualização e testes

Não publicar se existir:

- bloco visível sem conteúdo no idioma predefinido;
- regra que aponta a outra versão;
- ciclo na sequência linear de Momentos;
- bloco obrigatório inalcançável;
- media em processamento/falhado;
- ponto de acesso associado a rascunho;
- ausência de direito de publicação.

Pré-visualização cria `SessaoDeInteracao` isolada ou simulação sem persistência. Nunca gera análise, evento real, progresso real ou notificação.

Testes obrigatórios:

1. Antes de `abreEm`, API, HTML e media não expõem etapas.
2. À hora certa do servidor, a mesma porta passa a `ATIVA` sem nova publicação.
3. Dois pedidos idênticos desbloqueiam uma única etapa.
4. URL forjada de bloco bloqueado devolve apenas projecção permitida.
5. QR e link chegam à mesma experiência, com `ponto_de_acesso_id` diferente.
6. Webhook repetido cria um único `Direito`.
7. Revogar porta bloqueia novo acesso sem apagar auditoria.
8. Preferência de menos movimento não altera tempo, regras ou conclusão.

O motor tem sucesso quando uma nova categoria adiciona manifesto e extensão de domínio, sem recriar tempo, QR, regra, pagamento ou progresso.
