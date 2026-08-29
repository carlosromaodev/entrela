import { z } from 'zod'
import type { RepositorioDeNegocios } from './contratos.js'
import { papeis, pode } from './modelo.js'
export class ErroDeGestaoDoNegocio extends Error {}
export class GerirNegocio {
  constructor(private readonly d: { gerarId: () => string; repositorio: RepositorioDeNegocios }) {}
  private async autorizar(negocioId: string, utilizadorId: string, acao: 'GERIR_MEMBROS' | 'GERIR_NEGOCIO') {
    if (!pode(await this.d.repositorio.papel(negocioId, utilizadorId), acao)) throw new ErroDeGestaoDoNegocio()
  }
  async convidar(entrada: unknown, ator: { negocioId: string; utilizadorId: string }) {
    const e = z.object({ email: z.email(), papel: z.enum(papeis).exclude(['PROPRIETARIO']) }).strict().parse(entrada)
    await this.autorizar(ator.negocioId, ator.utilizadorId, 'GERIR_MEMBROS')
    await this.d.repositorio.convidar({ ...e, email: e.email.toLowerCase(), id: this.d.gerarId(), negocioId: ator.negocioId })
  }
  async alterar(entrada: unknown, ator: { negocioId: string; utilizadorId: string }) {
    const e = z.object({ membroId: z.uuid(), papel: z.enum(papeis).optional(), estado: z.enum(['ATIVO', 'REVOGADO']).optional() }).strict().refine((v) => v.papel || v.estado).parse(entrada)
    await this.autorizar(ator.negocioId, ator.utilizadorId, 'GERIR_MEMBROS')
    const alteracao = {
      membroId: e.membroId,
      negocioId: ator.negocioId,
      ...(e.papel === undefined ? {} : { papel: e.papel }),
      ...(e.estado === undefined ? {} : { estado: e.estado }),
    }
    if (!await this.d.repositorio.alterarMembroAtomico(alteracao)) throw new ErroDeGestaoDoNegocio()
  }
  async relacionar(entrada: unknown, ator: { negocioId: string; utilizadorId: string }) {
    const e = z.object({ beneficiarioId: z.uuid(), tipo: z.enum(['AGENCIA_CLIENTE', 'PARCEIRO_CLIENTE']) }).strict().parse(entrada)
    await this.autorizar(ator.negocioId, ator.utilizadorId, 'GERIR_NEGOCIO')
    if (e.beneficiarioId === ator.negocioId) throw new ErroDeGestaoDoNegocio()
    await this.d.repositorio.criarRelacao({ ...e, concedenteId: ator.negocioId, id: this.d.gerarId() })
  }
  async aceitarConvite(entrada: unknown, ator: { email: string; utilizadorId: string }) {
    const { conviteId } = z.object({ conviteId: z.uuid() }).strict().parse(entrada)
    const negocioId = await this.d.repositorio.aceitarConviteAtomico({ conviteId, email: ator.email.toLowerCase(), membroId: this.d.gerarId(), utilizadorId: ator.utilizadorId, agora: new Date() })
    if (negocioId === null) throw new ErroDeGestaoDoNegocio()
    return { negocioId }
  }
  async revogarRelacao(entrada: unknown, ator: { negocioId: string; utilizadorId: string }) {
    const { relacaoId } = z.object({ relacaoId: z.uuid() }).strict().parse(entrada)
    await this.autorizar(ator.negocioId, ator.utilizadorId, 'GERIR_NEGOCIO')
    if (!await this.d.repositorio.revogarRelacao(relacaoId, ator.negocioId)) throw new ErroDeGestaoDoNegocio()
  }
}
