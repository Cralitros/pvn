import { Injectable } from '@angular/core';

import { Facultad } from '../../../components/modelos/facultad';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Unidades académicas (`facultad`). */
@Injectable({ providedIn: 'root' })
export class FacultadApiService extends RecursoApi<Facultad> {
  constructor(api: ApiService) {
    super(api, RECURSOS.facultad);
  }
}
