import { Escuela } from "./escuela";

export interface Programa{
    id:string;
    programa:string;
    gestor:string;
    director:string;
    inicio:string;
    fin:string;
    idEscuela:string;
    Escuela:Escuela;
}