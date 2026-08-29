import {describe,expect,it} from 'vitest'
import {acoes,papeis,pode} from './modelo.js'
describe('matriz completa de papéis',()=>{it('decide todas as combinações e aplica menor privilégio',()=>{for(const p of papeis)for(const a of acoes)expect(typeof pode(p,a)).toBe('boolean');expect(pode('PROPRIETARIO','TRANSFERIR_PROPRIEDADE')).toBe(true);expect(pode('ADMINISTRADOR','TRANSFERIR_PROPRIEDADE')).toBe(false);expect(pode('OPERADOR','VER_ANALISES')).toBe(false);expect(pode(null,'GERIR_NEGOCIO')).toBe(false)})})
