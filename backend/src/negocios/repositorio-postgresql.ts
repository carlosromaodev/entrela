import type { Pool, PoolClient } from 'pg'
import type { RepositorioDeNegocios } from './contratos.js'
import type { Papel, Relacao } from './modelo.js'

export class RepositorioDeNegociosPostgresql implements RepositorioDeNegocios {
  private readonly s: string
  constructor(private readonly pool: Pool, schema = 'public') {
    if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Schema inválido.')
    this.s = `"${schema}"`
  }
  async papel(n: string, u: string): Promise<Papel | null> {
    const r = await this.pool.query<{ papel: Papel }>(`SELECT papel FROM ${this.s}.membros_do_negocio WHERE negocio_id=$1 AND utilizador_id=$2 AND estado='ATIVO'`, [n, u])
    return r.rows[0]?.papel ?? null
  }
  async convidar(e: { id:string; negocioId:string; email:string; papel:Exclude<Papel,'PROPRIETARIO'> }): Promise<void> {
    await this.pool.query(`INSERT INTO ${this.s}.convites_de_membro(id,negocio_id,email_normalizado,papel,estado,expira_em) VALUES($1,$2,$3,$4,'PENDENTE',now()+interval '7 days') ON CONFLICT(negocio_id,email_normalizado) WHERE estado='PENDENTE' DO NOTHING`, [e.id,e.negocioId,e.email,e.papel])
  }
  async aceitarConviteAtomico(e:{conviteId:string;email:string;membroId:string;utilizadorId:string;agora:Date}):Promise<string|null>{return this.tx(async c=>{const q=await c.query<{negocio_id:string;papel:Papel}>(`UPDATE ${this.s}.convites_de_membro SET estado='ACEITE',aceite_em=$1 WHERE id=$2 AND email_normalizado=$3 AND estado='PENDENTE' AND expira_em>$1 RETURNING negocio_id,papel`,[e.agora,e.conviteId,e.email]);const x=q.rows[0];if(!x)return null;await c.query(`INSERT INTO ${this.s}.membros_do_negocio(id,negocio_id,utilizador_id,papel,estado) VALUES($1,$2,$3,$4,'ATIVO') ON CONFLICT(negocio_id,utilizador_id) DO UPDATE SET papel=EXCLUDED.papel,estado='ATIVO'`,[e.membroId,x.negocio_id,e.utilizadorId,x.papel]);return x.negocio_id})}
  async expirarConvites(a:Date):Promise<number>{const r=await this.pool.query(`UPDATE ${this.s}.convites_de_membro SET estado='EXPIRADO' WHERE estado='PENDENTE' AND expira_em<=$1`,[a]);return r.rowCount??0}
  async alterarMembroAtomico(e:{negocioId:string;membroId:string;papel?:Papel;estado?:'ATIVO'|'REVOGADO'}):Promise<boolean>{return this.tx(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[e.negocioId]);const alvo=await c.query<{papel:Papel}>(`SELECT papel FROM ${this.s}.membros_do_negocio WHERE id=$1 AND negocio_id=$2 FOR UPDATE`,[e.membroId,e.negocioId]);if(!alvo.rows[0])return false;if(alvo.rows[0].papel==='PROPRIETARIO'&&((e.papel&&e.papel!=='PROPRIETARIO')||e.estado==='REVOGADO')){const q=await c.query(`SELECT id FROM ${this.s}.membros_do_negocio WHERE negocio_id=$1 AND papel='PROPRIETARIO' AND estado='ATIVO' FOR UPDATE`,[e.negocioId]);if((q.rowCount??0)<=1)return false}const r=await c.query(`UPDATE ${this.s}.membros_do_negocio SET papel=COALESCE($1,papel),estado=COALESCE($2,estado) WHERE id=$3 AND negocio_id=$4`,[e.papel,e.estado,e.membroId,e.negocioId]);return r.rowCount===1})}
  async criarRelacao(e:{id:string;concedenteId:string;beneficiarioId:string;tipo:Relacao}){await this.pool.query(`INSERT INTO ${this.s}.relacoes_entre_negocios(id,concedente_id,beneficiario_id,tipo,estado) VALUES($1,$2,$3,$4,'ATIVA')`,[e.id,e.concedenteId,e.beneficiarioId,e.tipo])}
  async revogarRelacao(id:string,c:string){const r=await this.pool.query(`UPDATE ${this.s}.relacoes_entre_negocios SET estado='REVOGADA',revogada_em=now() WHERE id=$1 AND concedente_id=$2 AND estado='ATIVA'`,[id,c]);return r.rowCount===1}
  private async tx<T>(f:(c:PoolClient)=>Promise<T>):Promise<T>{const c=await this.pool.connect();try{await c.query('BEGIN');const r=await f(c);await c.query('COMMIT');return r}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
}
