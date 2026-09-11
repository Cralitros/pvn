import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InfoDocencia } from '../../../components/modelos/infodocencia';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Información de docencia (`docentesinfo`). */
@Injectable({ providedIn: 'root' })
export class DocenteInfoApiService extends RecursoApi<InfoDocencia> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesInfo);
  }

  /** `GET docentesinfo/cod/{codigo}` */
  obtenerPorCodigo(codigo: IdRecurso): Observable<InfoDocencia[]> {
    return this.api.obtener<InfoDocencia[]>(SUBRUTAS.docenteInfoPorCodigo, codigo);
  }
}
