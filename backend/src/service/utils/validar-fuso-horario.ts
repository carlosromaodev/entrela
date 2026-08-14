export function fusoHorarioIanaExiste(fusoHorario: string): boolean {
  try {
    new Intl.DateTimeFormat('pt-AO', { timeZone: fusoHorario }).format()
    return true
  } catch {
    return false
  }
}
