import { DocenteCurso } from "./docentecurso";

export interface Personal{
    codigo: string;
    nombres: string;
    apellidos: string;
    digito: string;
    especialidad:string;
    domicilio:string;
    telefono: string;
    celular: string;
    estado_civil: string;
    numero_hijos: string;
    pais: string;
    sexo:string;
    dni: string;
    pasaporte: string;
    fallecimiento: string;
    fecha_fallecimiento: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    lugarNacimiento:any;
    banco: string;
    cuenta: string;
    afp: string;
    cussp: string;
    afiliacion: string;
    fecha_cv: string;
    ruc: string;
    observaciones: string;
    idDepartamento:string;
    idProvincia:string;
    idDistrito:string;
    idNacionalidad:string;
    DocenteCursos:DocenteCurso;
}