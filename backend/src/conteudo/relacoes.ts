import { z } from 'zod'
export const tiposDeRelacao=['ORIGINA','COMPLEMENTA','CONTINUA','SUBSTITUI'] as const
export interface RepositorioDeRelacoesDeExperiencias{criar(e:{id:string;origemId:string;destinoId:string;negocioId:string;tipo:typeof tiposDeRelacao[number]}):Promise<boolean>}
export class RelacionarExperiencias{constructor(private d:{gerarId:()=>string;repositorio:RepositorioDeRelacoesDeExperiencias}){}async executar(entrada:unknown,negocioId:string){const e=z.object({origemId:z.uuid(),destinoId:z.uuid(),tipo:z.enum(tiposDeRelacao)}).strict().refine(v=>v.origemId!==v.destinoId).parse(entrada);if(!await this.d.repositorio.criar({...e,id:this.d.gerarId(),negocioId}))throw new Error('RELACAO_NAO_AUTORIZADA');return{id:e.origemId}}}
