export const categorias = ['EMPRESAS','EVENTOS','MOMENTOS','PRESENTES','CONVITES','EXPERIENCIAS'] as const
export type Categoria = typeof categorias[number]
export const tiposDeBloco = ['TEXTO','TITULO','FOTOGRAFIA','GALERIA','VIDEO','AUDIO','MENSAGEM_DE_VOZ','MUSICA_DE_FUNDO','PDF','BOTAO','LINK','MAPA','CONTAGEM_REGRESSIVA','CALENDARIO','AGENDA','PERFIL_DE_PESSOA','LISTA','LINHA_DO_TEMPO','ANTES_DEPOIS','CARROSSEL','DOWNLOAD','CONTACTO','REDES_SOCIAIS','TRANSMISSAO','INCORPORADO','FORMULARIO','RSVP'] as const
export type TipoDeBloco = typeof tiposDeBloco[number]
export type Manifesto = Readonly<{ categoria:Categoria; versao:number; blocos:ReadonlySet<TipoDeBloco>; acoes:ReadonlySet<string>; exige:ReadonlySet<'TEMPO'|'REGRA'|'LIGACAO'> }>
const conteudo=new Set<TipoDeBloco>(tiposDeBloco.filter(t=>!['FORMULARIO','RSVP'].includes(t)))
export const manifestos:Readonly<Record<Categoria,Manifesto>>={
 MOMENTOS:{categoria:'MOMENTOS',versao:1,blocos:new Set(['TEXTO','FOTOGRAFIA','VIDEO','AUDIO','MENSAGEM_DE_VOZ']),acoes:new Set(['DESBLOQUEAR_BLOCO','MARCAR_EXPERIENCIA_COMO_CONCLUIDA']),exige:new Set(['TEMPO'])},
 EVENTOS:{categoria:'EVENTOS',versao:1,blocos:new Set([...conteudo,'FORMULARIO','RSVP']),acoes:new Set(['DESBLOQUEAR_BLOCO','MARCAR_EXPERIENCIA_COMO_CONCLUIDA']),exige:new Set(['TEMPO'])},
 EMPRESAS:{categoria:'EMPRESAS',versao:1,blocos:new Set([...conteudo,'FORMULARIO']),acoes:new Set(['CRIAR_CUPAO','DESBLOQUEAR_BLOCO']),exige:new Set(['REGRA'])},
 PRESENTES:{categoria:'PRESENTES',versao:1,blocos:conteudo,acoes:new Set(['DESBLOQUEAR_BLOCO']),exige:new Set(['LIGACAO'])},
 CONVITES:{categoria:'CONVITES',versao:1,blocos:new Set([...conteudo,'FORMULARIO','RSVP']),acoes:new Set(['DESBLOQUEAR_BLOCO']),exige:new Set(['TEMPO'])},
 EXPERIENCIAS:{categoria:'EXPERIENCIAS',versao:1,blocos:new Set([...conteudo,'FORMULARIO']),acoes:new Set(['DESBLOQUEAR_BLOCO','MARCAR_NO_COMO_CONCLUIDO','EMITIR_CERTIFICADO']),exige:new Set(['LIGACAO'])},
}
