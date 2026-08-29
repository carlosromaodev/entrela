import { describe, expect, it } from 'vitest'
import type { RepositorioDoCicloDeVida } from './contratos.js'
import { MudarCicloDeVida } from './servicos.js'
const id='00000000-0000-7000-8000-000000000001'
describe('ciclo de vida',()=>{it('pausa experiência autorizada',async()=>{const repositorio:RepositorioDoCicloDeVida={papel:async()=>'PROPRIETARIO',transicionar:async()=>true,criarCorrecao:async()=>null,publicarCorrecaoAtomica:async()=>false};const servico=new MudarCicloDeVida({agora:()=>new Date(),gerarId:()=>id,repositorio});expect((await servico.executar({experienciaId:id,acao:'PAUSAR'},{negocioId:id,utilizadorId:id})).estado).toBe('PAUSADA')})})
