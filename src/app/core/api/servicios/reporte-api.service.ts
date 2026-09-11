import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { Recurso } from '../api-recursos';

/**
 * Descarga de reportes en PDF.
 *
 * Antes esto vivía en los cinco servicios duplicados y usaba la `apiUrl`
 * mutable: el reporte que se abría dependía de cuál fue el **último**
 * `ponerurl()` ejecutado por cualquier componente de la aplicación. Ahora el
 * recurso es un parámetro obligatorio.
 */
@Injectable({ providedIn: 'root' })
export class ReporteApiService {
  constructor(private readonly api: ApiService) {}

  /** `GET {recurso}/report` → PDF del listado. */
  reporteDe(recurso: Recurso): Observable<Blob> {
    return this.api.descargar(`${recurso}/report`);
  }
}
