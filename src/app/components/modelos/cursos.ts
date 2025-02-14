import { Area } from "./area";
import { Plan } from "./plan";
import { Programa } from "./programa";

export interface Curso{
    codigo:string;
    nombre:string;
    semestre:string;
    nivel:string;
    creditos:string;
    idPrograma:string;
    codigoPlan:string;
    Programa:Programa;
    Plan:Plan;
    areas:Area;
}