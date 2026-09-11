import { Usuario } from './usuario';

export interface Firma{
    id?:string;
    firma:string;
    idLogin:string;
    Login:Usuario;
    codigoDocente:  string;
}
