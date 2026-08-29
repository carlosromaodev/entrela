import { z } from 'zod'
export const formatos=['PRESENCIAL','ONLINE','HIBRIDO'] as const
export const politicasDeLocalizacao=['PUBLICA','APROXIMADA','APOS_INSCRICAO','APOS_APROVACAO','ONLINE'] as const
const data=z.iso.datetime({offset:true})
const sessao=z.object({id:z.uuid(),titulo:z.string().trim().min(1).max(160),inicio:data,fim:data,espaco:z.string().max(160).nullable()}).strict().refine(x=>Date.parse(x.fim)>Date.parse(x.inicio))
export const evento=z.object({titulo:z.string().trim().min(1).max(160),resumo:z.string().max(500),capa:z.string().url().nullable(),inicio:data,fim:data,fusoHorario:z.string().refine(v=>{try{new Intl.DateTimeFormat('pt',{timeZone:v});return true}catch{return false}}),formato:z.enum(formatos),politicaDeLocalizacao:z.enum(politicasDeLocalizacao),localidade:z.string().max(160).nullable(),endereco:z.string().max(300).nullable(),urlOnline:z.string().url().nullable(),politicaDeInscricao:z.enum(['ABERTA','APROVACAO','CONVITE']),organizadorResponsavelId:z.uuid(),agenda:z.array(sessao).max(200)}).strict().superRefine((e,c)=>{
 if(Date.parse(e.fim)<=Date.parse(e.inicio))c.addIssue({code:'custom',path:['fim'],message:'Fim inválido'})
 if(e.formato==='ONLINE'&&!e.urlOnline)c.addIssue({code:'custom',path:['urlOnline'],message:'URL obrigatória'})
 if(e.formato==='PRESENCIAL'&&!e.localidade)c.addIssue({code:'custom',path:['localidade'],message:'Localidade obrigatória'})
 for(const[i,s]of e.agenda.entries())if(Date.parse(s.inicio)<Date.parse(e.inicio)||Date.parse(s.fim)>Date.parse(e.fim))c.addIssue({code:'custom',path:['agenda',i],message:'Sessão fora do evento'})
})
export type Evento=z.output<typeof evento>
export type EstadoPublico='AGENDADO'|'INSCRICOES_ABERTAS'|'EM_CURSO'|'TERMINADO'|'CANCELADO'
export function estadoTemporal(e:{estado:'PUBLICADO'|'CANCELADO';inicio:string;fim:string},agora:Date):EstadoPublico{if(e.estado==='CANCELADO')return'CANCELADO';const t=agora.getTime();return t<Date.parse(e.inicio)?'AGENDADO':t<Date.parse(e.fim)?'EM_CURSO':'TERMINADO'}
