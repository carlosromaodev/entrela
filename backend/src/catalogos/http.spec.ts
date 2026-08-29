import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import { ValidarConteudoDaCategoria } from '../conteudo/blocos.js'
import { RelacionarExperiencias } from '../conteudo/relacoes.js'
import { registrarRotasDeCatalogos } from './http.js'
describe('HTTP de catálogos',()=>{it('expõe contratos',async()=>{const app=Fastify(),schemas:unknown[]=[];app.addHook('onRoute',r=>{schemas.push(r.schema)});await registrarRotasDeCatalogos(app,{validar:new ValidarConteudoDaCategoria(),relacionar:new RelacionarExperiencias({gerarId:()=>crypto.randomUUID(),repositorio:{criar:async()=>true}}),negocio:async()=>crypto.randomUUID()});expect((await app.inject({url:'/v1/catalogos/manifestos'})).statusCode).toBe(200);expect(schemas.length).toBeGreaterThanOrEqual(3);await app.close()})})
