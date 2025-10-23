import { logins } from "./usuario";

export interface firma{
    id?:string;
    firma:string;
    idLogin:string;
    Login:logins;
    codigoDocente:  string;
}
