import { describe, expect, it } from 'vitest'

import { TokenPublico } from '../lib/seguranca/token-publico.js'
import type {
  PortaPublicaDoMomento,
  RepositorioDeAcessoPublicoAMomentos,
} from '../repository/contratos/repositorio-de-acesso-publico-a-momentos.js'
import { AcederMomentoPublico } from './aceder-momento-publico.js'
import { ErroDeAcessoPublico } from './errs/ErroDeAcessoPublico.js'

const porta: PortaPublicaDoMomento = {
  abreEm: null,
  capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
  estadoDaExperiencia: 'PUBLICADA',
  estadoDaPorta: 'ATIVO',
  expiraEm: null,
  fusoHorario: 'Africa/Luanda',
  iniciaEm: null,
  maximoDeUsos: null,
  modeloEditorial: 'CARTA_INTIMA',
  negocioId: '0198f9a0-8b75-7000-8000-000000000001',
  pontoDeAcessoId: '0198f9a0-8b75-7000-8000-000000000002',
  quantidadeDeUsos: 0,
  tipo: 'URL',
  terminaEm: null,
  titulo: 'Segredo',
  versaoId: '0198f9a0-8b75-7000-8000-000000000003',
}

class RepositorioFalso implements RepositorioDeAcessoPublicoAMomentos {
  aberturas: string[] = []
  porta: PortaPublicaDoMomento | null = porta
  async resolver() { return this.porta }
  async abrir(entrada: Parameters<RepositorioDeAcessoPublicoAMomentos['abrir']>[0]) {
    this.aberturas.push(entrada.hmacAnonimo)
    return {
      etapa: { chave: 'primeira', final: true, ordem: 1, texto: 'Olá' },
      sessaoId: entrada.idDaSessao,
    }
  }
  async continuar() { return { estado: 'CONCLUIDA' as const, repetida: false } }
}

function preparar(repositorio = new RepositorioFalso()) {
  return {
    repositorio,
    servico: new AcederMomentoPublico({
      gerarId: () => '0198f9a0-8b75-7000-8000-000000000004',
      gerarIdentificadorAnonimo: () => 'identificador-anonimo-opaco-seguro',
      obterInstanteAtual: () => new Date('2026-08-14T12:00:00Z'),
      repositorio,
      tokenPublico: new TokenPublico({ chaveDeHmac: 'chave-segura-com-mais-de-trinta-e-dois-bytes' }),
    }),
  }
}

describe('AcederMomentoPublico', () => {
  it('GET agendado não revela identidade nem cria sessão', async () => {
    const repositorio = new RepositorioFalso()
    repositorio.porta = { ...porta, abreEm: '2026-08-15T12:00:00Z' }
    const { servico } = preparar(repositorio)
    const resultado = await servico.resolver({ token: 'token-publico-opaco-comprido' })
    expect(resultado).toEqual({ abreEm: '2026-08-15T12:00:00Z', estado: 'EM_ESPERA' })
    expect(repositorio.aberturas).toHaveLength(0)
  })

  it('POST retoma a mesma identidade anónima de forma estável', async () => {
    const { repositorio, servico } = preparar()
    const primeira = await servico.abrir({ token: 'token-publico-opaco-comprido' })
    await servico.abrir({
      identificadorAnonimo: primeira.identificadorAnonimo,
      token: 'token-publico-opaco-comprido',
    })
    expect(repositorio.aberturas).toHaveLength(2)
    expect(new Set(repositorio.aberturas).size).toBe(1)
    expect(primeira).toMatchObject({ estado: 'ATIVA', etapa: { chave: 'primeira' } })
  })

  it.each(['inexistente', 'revogado'])('mantém acesso %s indistinguível', async (caso) => {
    const repositorio = new RepositorioFalso()
    repositorio.porta = caso === 'inexistente' ? null : { ...porta, estadoDaPorta: 'REVOGADO' }
    const { servico } = preparar(repositorio)
    await expect(servico.resolver({ token: 'token-publico-opaco-comprido' })).rejects.toBeInstanceOf(ErroDeAcessoPublico)
  })
})
