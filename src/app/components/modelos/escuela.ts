import { Facultad } from "./facultad";

export interface Escuela{
    id:string;
    nombre:string;
    idFacultad:string;
    Facultad:Facultad;
}