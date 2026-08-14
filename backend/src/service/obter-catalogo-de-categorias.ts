export type CategoriaDaEntrela = Readonly<{
  codigo:
    | 'EMPRESAS'
    | 'EVENTOS'
    | 'MOMENTOS'
    | 'PRESENTES'
    | 'CONVITES'
    | 'EXPERIENCIAS'
  disponibilidade: 'EM_IMPLEMENTACAO' | 'PLANEADA'
  nome: string
  primeiraFatia: boolean
}>

const catalogoCanonico: readonly CategoriaDaEntrela[] = Object.freeze([
  Object.freeze({
    codigo: 'EMPRESAS',
    disponibilidade: 'PLANEADA',
    nome: 'Entrela Empresas',
    primeiraFatia: false,
  }),
  Object.freeze({
    codigo: 'EVENTOS',
    disponibilidade: 'PLANEADA',
    nome: 'Entrela Eventos',
    primeiraFatia: false,
  }),
  Object.freeze({
    codigo: 'MOMENTOS',
    disponibilidade: 'EM_IMPLEMENTACAO',
    nome: 'Entrela Momentos',
    primeiraFatia: true,
  }),
  Object.freeze({
    codigo: 'PRESENTES',
    disponibilidade: 'PLANEADA',
    nome: 'Entrela Presentes',
    primeiraFatia: false,
  }),
  Object.freeze({
    codigo: 'CONVITES',
    disponibilidade: 'PLANEADA',
    nome: 'Entrela Convites',
    primeiraFatia: false,
  }),
  Object.freeze({
    codigo: 'EXPERIENCIAS',
    disponibilidade: 'PLANEADA',
    nome: 'Entrela Experiências',
    primeiraFatia: false,
  }),
])

export class ObterCatalogoDeCategorias {
  executar(): readonly CategoriaDaEntrela[] {
    return Object.freeze(catalogoCanonico.map((categoria) => categoria))
  }
}
