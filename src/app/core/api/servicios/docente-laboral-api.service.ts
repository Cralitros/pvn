import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Laboral } from '../../../components/modelos/laboral';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Información laboral de los docentes (`docenteslaboral`). */
@Injectable({ providedIn: 'root' })
export class DocenteLaboralApiService extends RecursoApi<Laboral> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesLaboral);
  }

  /** `GET docenteslaboral/cod/{codigo}` */
  obtenerPorCodigo(codigo: IdRecurso): Observable<Laboral[]> {
    return this.api.obtener<Laboral[]>(SUBRUTAS.docenteLaboralPorCodigo, codigo);
  }
}
