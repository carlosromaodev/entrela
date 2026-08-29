import { z } from 'zod'
import { manifestos, tiposDeBloco, type Categoria } from '../catalogos/manifestos.js'
export const esquemaDoBloco=z.object({chave:z.string().regex(/^[a-z][a-z0-9_-]{0,79}$/),tipo:z.enum(tiposDeBloco),ordem:z.number().int().positive(),configuracao:z.record(z.string(),z.unknown()).default({})}).strict()
export type Bloco=z.output<typeof esquemaDoBloco>
export class ValidarConteudoDaCategoria{
 executar(entrada:unknown){const e=z.object({categoria:z.enum(Object.keys(manifestos) as [Categoria,...Categoria[]]),blocos:z.array(esquemaDoBloco).max(200),sinais:z.object({tempo:z.boolean(),regra:z.boolean(),ligacao:z.boolean()})}).strict().parse(entrada);const m=manifestos[e.categoria];const erros:string[]=[];for(const b of e.blocos)if(!m.blocos.has(b.tipo))erros.push(`BLOCO_NAO_PERMITIDO:${b.chave}`);if(new Set(e.blocos.map(b=>b.chave)).size!==e.blocos.length)erros.push('CHAVE_DUPLICADA');if([...m.exige].every(x=>!e.sinais[x.toLowerCase() as 'tempo'|'regra'|'ligacao']))erros.push('SEM_TEMPO_REGRA_OU_LIGACAO');return{valido:erros.length===0,erros,versaoDoManifesto:m.versao}}
}
