import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { IdRecurso, ParametrosApi, RutaApi, TotalRecurso } from './api.types';

/**
 * Clase base de los servicios de recurso.
 *
 * Concentra el CRUD que antes estaba copiado y pegado en cinco servicios
 * distintos, de modo que cada recurso concreto sólo declara **cuál** es su
 * recurso y **qué** operaciones propias añade.
 *
 * @typeParam T  Entidad que devuelve la API.
 * @typeParam TId Tipo del identificador (por defecto `string | number`).
 */
export abstract class RecursoApi<T, TId extends IdRecurso = IdRecurso> {
  protected constructor(
    protected readonly api: ApiService,
    protected readonly recurso: RutaApi,
  ) {}

  /** `GET {recurso}` */
  listar(parametros?: ParametrosApi): Observable<T[]> {
    return this.api.listar<T>(this.recurso, parametros);
  }

  /** `GET {recurso}/{id}` */
  obtener(id: TId): Observable<T> {
    return this.api.obtener<T>(this.recurso, id);
  }

  /** `POST {recurso}` */
  crear(cuerpo: unknown): Observable<T> {
    return this.api.crear<T>(this.recurso, cuerpo);
  }

  /** `PUT {recurso}/{id}` */
  actualizar(id: TId, cuerpo: unknown): Observable<T> {
    return this.api.actualizar<T>(this.recurso, id, cuerpo);
  }

  /** `DELETE {recurso}/{id}` */
  eliminar(id: TId): Observable<T> {
    return this.api.eliminar<T>(this.recurso, id);
  }

  /** `GET {recurso}/total` */
  contar(): Observable<TotalRecurso> {
    return this.api.contar(this.recurso);
  }
}
