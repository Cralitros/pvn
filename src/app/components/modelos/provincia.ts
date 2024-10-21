import { Departamento } from "./departamento";

export interface Provincia{
    id:string;
    nombre:string;
    departamento_id:string;
    valor:string;
    Departamento:Departamento;
}