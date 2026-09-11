import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url.token';
import { IdRecurso, ParametrosApi, RutaApi, TotalRecurso } from './api.types';

/**
 * Motor HTTP de la API `backendpucp`.
 *
 * Sustituye a los cinco servicios duplicados (`MaestrosserviceService`,
 * `Aux1Service`, `Aux2Service`, `Aux3Service`, `Saux4Service`), que compartían
 * una única propiedad `apiUrl` mutable en un singleton: cualquier componente
 * podía cambiar la URL de otro a mitad de petición.
 *
 * Aquí **no hay estado**: la ruta se recibe en cada llamada, así que dos
 * peticiones simultáneas a recursos distintos nunca se pisan.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string,
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  /** `GET {recurso}` */
  listar<T>(recurso: RutaApi, parametros?: ParametrosApi): Observable<T[]> {
    return this.http.get<T[]>(this.url(recurso), { params: this.httpParams(parametros) });
  }

  /** `GET {recurso}/{id}` */
  obtener<T>(recurso: RutaApi, id: IdRecurso): Observable<T> {
    return this.http.get<T>(this.url(recurso, id));
  }

  /** `POST {recurso}` */
  crear<T>(recurso: RutaApi, cuerpo: unknown): Observable<T> {
    return this.http.post<T>(this.url(recurso), cuerpo);
  }

  /** `PUT {recurso}/{id}` */
  actualizar<T>(recurso: RutaApi, id: IdRecurso, cuerpo: unknown): Observable<T> {
    return this.http.put<T>(this.url(recurso, id), cuerpo);
  }

  /** `DELETE {recurso}/{id}` */
  eliminar<T>(recurso: RutaApi, id: IdRecurso): Observable<T> {
    return this.http.delete<T>(this.url(recurso, id));
  }

  /** `GET {recurso}/total` → `{ total: number }` */
  contar(recurso: RutaApi): Observable<TotalRecurso> {
    return this.obtener<TotalRecurso>(recurso, 'total');
  }

  /** Descarga binaria (`responseType: 'blob'`), típicamente un PDF o un Word. */
  descargar(recurso: RutaApi, ...segmentos: IdRecurso[]): Observable<Blob> {
    return this.http.get(this.url(recurso, ...segmentos), { responseType: 'blob' });
  }

  /**
   * URL absoluta del recurso, sin cabeceras ni observables.
   *
   * Necesario para visores que consumen la URL directamente (por ejemplo el
   * `src` de un `<iframe>` o `<object>`), donde un `Blob` no siempre sirve.
   */
  urlAbsoluta(recurso: RutaApi, ...segmentos: IdRecurso[]): string {
    return this.url(recurso, ...segmentos);
  }

  private url(recurso: RutaApi, ...segmentos: IdRecurso[]): string {
    return this.baseUrl + [recurso, ...segmentos.map(String)].join('/');
  }

  private httpParams(parametros?: ParametrosApi): HttpParams | undefined {
    if (!parametros) {
      return undefined;
    }

    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(parametros)) {
      if (valor !== null && valor !== undefined) {
        params = params.set(clave, String(valor));
      }
    }
    return params;
  }
}
