
export interface Categoria{
    id:string;
    tipo:string;
    fecha:Date;
    categoria:string;
    condiciondap:string;
    codigoDocente:string;
    dedicacion:string;
    labor:string;
    categoriadap:string;
    hContratado:Date;
    hAuxiliar:Date;
    hPrincipal:Date;
    hAsociado:Date;
    categoriaJubilacion:string;
    dedicacionJubilacion:string;
    categoriaDAP?:string;
    condicionDAP?:string;
}