export interface ParticipanteDaExperiencia {
  id: string
  experienciaId: string
  contactoId?: string
  utilizadorId?: string
  tipo: 'destinatario' | 'convidado' | 'visitante' | 'lead'
  atributos: Record<string, unknown>
}

export interface SegmentoDePublico {
  id: string
  experienciaId: string
  nome: string
  membros: string[] // ids de participantes
}
