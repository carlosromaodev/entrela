import { z } from 'zod'
import { validarEntrada } from './utils/validar-entrada.js'

const esquemaParagem = z.strictObject({
  ordem: z.number().int().positive(),
  localId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  raioProximidadeMetros: z.number().int().positive().default(50),
  conteudoBlocoId: z.string().uuid().optional(),
})

const esquemaParaCriarPercursoGPS = z.strictObject({
  contexto: z.strictObject({
    negocioId: z.string().uuid(),
    utilizadorId: z.string().uuid(),
  }),
  dados: z.strictObject({
    experienciaId: z.string().uuid(),
    nome: z.string().trim().min(1).max(120),
    idioma: z.enum(['pt-AO', 'en']),
    paragens: z.array(esquemaParagem).min(1),
  }),
})

export class CriarPercursoGPS {
  constructor(private readonly d: any) {}

  async executar(e: unknown) {
    const entrada = validarEntrada(esquemaParaCriarPercursoGPS, e)
    const { contexto, dados } = entrada

    // RN-EXP-01: só desbloqueia com proximidade real — validamos ordem sequencial
    // e que cada paragem tem coordenadas válidas (não adivinhação)
    const paragensOrdenadas = [...dados.paragens].sort((a, b) => a.ordem - b.ordem)
    for (let i = 0; i < paragensOrdenadas.length; i++) {
      const p = paragensOrdenadas[i]
      if (p.ordem !== i + 1) {
        throw new Error('Ordem das paragens deve ser sequencial a partir de 1.')
      }
      if (Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180) {
        throw new Error('Coordenadas GPS inválidas.')
      }
    }

    // Invariante 2 / 7: isolamento por negocio_id — o repositório deve garantir
    // que experienciaId pertence ao mesmo negocioId
    const perfil = await this.d.repositorio.criar({
      negocioId: contexto.negocioId,
      experienciaId: dados.experienciaId,
      nome: dados.nome,
      idioma: dados.idioma,
      paragens: paragensOrdenadas,
      criadoEm: new Date().toISOString(),
    })

    return { perfil, progressoInicial: { concluido: false, paragemAtual: 1 } }
  }
}