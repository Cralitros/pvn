import { Curso } from "./cursos";

export interface DocenteCurso{
    id:string;
    fecha_inicio:string;
    fecha_fin:string;
    modalidad:string;
    tipo:string;
    tipo_clase:string;
    estado:string;
    codigoDocente:string;
    codigoCurso:string;
    Curso:Curso;
}
