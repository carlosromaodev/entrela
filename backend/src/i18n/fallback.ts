export type Idioma='pt-AO'|'en'
export function localizar<T>(conteudo:Partial<Record<Idioma,T>>,pedido:Idioma,predefinido:Idioma):Readonly<{idioma:Idioma;valor:T}>|null{for(const idioma of [pedido,predefinido,'pt-AO','en'] as const){const valor=conteudo[idioma];if(valor!==undefined)return{idioma,valor}}return null}
