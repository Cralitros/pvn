import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Firma } from '../../../components/modelos/firma';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Firmas digitalizadas de los docentes (`firma`). */
@Injectable({ providedIn: 'root' })
export class FirmaApiService extends RecursoApi<Firma> {
  constructor(api: ApiService) {
    super(api, RECURSOS.firma);
  }

  /** `GET firma/dni/{dni}` */
  obtenerPorDni(dni: IdRecurso): Observable<Firma[]> {
    return this.api.obtener<Firma[]>(SUBRUTAS.firmaPorDni, dni);
  }
}
