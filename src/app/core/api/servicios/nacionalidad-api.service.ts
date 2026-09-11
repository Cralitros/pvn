import { Injectable } from '@angular/core';

import { Nacionalidad } from '../../../components/modelos/nacionalidad';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Nacionalidades (`nacionalidad`). */
@Injectable({ providedIn: 'root' })
export class NacionalidadApiService extends RecursoApi<Nacionalidad> {
  constructor(api: ApiService) {
    super(api, RECURSOS.nacionalidad);
  }
}
