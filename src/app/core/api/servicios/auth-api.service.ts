import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Usuario } from '../../../components/modelos/usuario';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Credenciales que espera `POST login/login`. */
export interface CredencialesLogin {
  dni: string;
  password: string;
}

/** Respuesta de `POST login/login`. */
export interface RespuestaLogin {
  dni: string;
  token: string;
  nivel: string;
}

/**
 * Autenticación y gestión de usuarios (`login`).
 *
 * Extiende `RecursoApi<Usuario>` para heredar el CRUD sobre `login`
 * (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`, `contar`), y añade
 * los métodos con nombre propio de las sub-rutas.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService extends RecursoApi<Usuario> {
  constructor(api: ApiService) {
    super(api, RECURSOS.login);
  }

  /** `POST login/login` */
  autenticar(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    return this.api.crear<RespuestaLogin>(SUBRUTAS.loginAutenticar, credenciales);
  }

  /** `GET login` */
  listarUsuarios(): Observable<Usuario[]> {
    return this.listar();
  }

  /** `POST login/register` */
  registrar(cuerpo: unknown): Observable<Usuario> {
    return this.api.crear<Usuario>(SUBRUTAS.loginRegistrar, cuerpo);
  }

  /** `PUT login/{id}` */
  actualizarUsuario(id: IdRecurso, cuerpo: unknown): Observable<Usuario> {
    return this.actualizar(id, cuerpo);
  }

  /** `DELETE login/{id}` */
  eliminarUsuario(id: IdRecurso): Observable<Usuario> {
    return this.eliminar(id);
  }

  /** `GET login/dni/{dni}` */
  obtenerPorDni(dni: IdRecurso): Observable<Usuario[]> {
    return this.api.obtener<Usuario[]>(SUBRUTAS.loginPorDni, dni);
  }
}
