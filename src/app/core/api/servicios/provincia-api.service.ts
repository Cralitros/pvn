import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Provincia } from '../../../components/modelos/provincia';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Provincias (`provincias`). */
@Injectable({ providedIn: 'root' })
export class ProvinciaApiService extends RecursoApi<Provincia> {
  constructor(api: ApiService) {
    super(api, RECURSOS.provincias);
  }

  /**
   * `GET provincias/provin/{departamentoId}`
   *
   * Se conserva la ruta exacta que usaba la aplicación anterior (nacía de
   * `getid('provin/' + id)`). Sirve para el desplegable encadenado
   * departamento → provincia.
   */
  obtenerPorDepartamento(departamentoId: IdRecurso): Observable<Provincia[]> {
    return this.api.obtener<Provincia[]>(RECURSOS.provincias, `provin/${departamentoId}`);
  }
}
