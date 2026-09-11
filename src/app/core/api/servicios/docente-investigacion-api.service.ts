import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Investigador } from '../../../components/modelos/investigador';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Producción investigadora de los docentes (`docentesinvestiga`). */
@Injectable({ providedIn: 'root' })
export class DocenteInvestigacionApiService extends RecursoApi<Investigador> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesInvestigacion);
  }

  /** `GET docentesinvestiga/cod/{codigo}` */
  obtenerPorCodigo(codigo: IdRecurso): Observable<Investigador[]> {
    return this.api.obtener<Investigador[]>(SUBRUTAS.docenteInvestigacionPorCodigo, codigo);
  }
}
