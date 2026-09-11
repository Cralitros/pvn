import { Injectable } from '@angular/core';

import { Area } from '../../../components/modelos/area';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Áreas académicas (`area`). */
@Injectable({ providedIn: 'root' })
export class AreaApiService extends RecursoApi<Area> {
  constructor(api: ApiService) {
    super(api, RECURSOS.area);
  }
}
