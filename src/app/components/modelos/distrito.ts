import { Provincia } from "./provincia";


export interface Distrito{
    id:string;
    nombre:string;
    provincia_id:string;
    valor:string;
    Provincium:Provincia;
}