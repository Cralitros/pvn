import { Escuela } from "./escuela";

export interface Facultad{
    id:string;
    nombre:string;
    Escuelas?: Escuela[]; // ← Debe estar en minúscula
}