export type Estado='RASCUNHO'|'PUBLICADA'|'PAUSADA'|'ARQUIVADA'
export interface RepositorioDoCicloDeVida{
 papel(negocioId:string,utilizadorId:string):Promise<'PROPRIETARIO'|'ADMINISTRADOR'|'EDITOR'|null>
 transicionar(e:{negocioId:string;experienciaId:string;de:Estado[];para:Estado;agora:Date}):Promise<boolean>
 criarCorrecao(e:{negocioId:string;experienciaId:string;novaVersaoId:string;utilizadorId:string}):Promise<{versaoAnteriorId:string;numero:number}|null>
 publicarCorrecaoAtomica(e:{negocioId:string;experienciaId:string;novaVersaoId:string;versaoAnteriorId:string;soma:string;agora:Date}):Promise<boolean>
}
