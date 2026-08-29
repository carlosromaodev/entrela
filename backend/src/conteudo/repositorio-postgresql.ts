import type { Pool } from 'pg'
import type { RepositorioDeRelacoesDeExperiencias, tiposDeRelacao } from './relacoes.js'
export class RepositorioDeRelacoesPostgresql implements RepositorioDeRelacoesDeExperiencias{
 private s:string;constructor(private pool:Pool,schema='public'){if(!/^[a-z_][a-z0-9_]*$/.test(schema))throw new Error('Schema inválido.');this.s=`"${schema}"`}
 async criar(e:{id:string;origemId:string;destinoId:string;negocioId:string;tipo:typeof tiposDeRelacao[number]}):Promise<boolean>{const r=await this.pool.query(`INSERT INTO ${this.s}.relacoes_entre_experiencias(id,experiencia_origem_id,experiencia_destino_id,negocio_id,tipo) SELECT $1,o.id,d.id,$4,$5 FROM ${this.s}.experiencias o JOIN ${this.s}.experiencias d ON d.id=$3 AND d.negocio_id=$4 WHERE o.id=$2 AND o.negocio_id=$4 ON CONFLICT DO NOTHING RETURNING id`,[e.id,e.origemId,e.destinoId,e.negocioId,e.tipo]);return r.rowCount===1}
}
