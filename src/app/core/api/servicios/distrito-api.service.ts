import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Distrito } from '../../../components/modelos/distrito';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Distritos (`distritos`). */
@Injectable({ providedIn: 'root' })
export class DistritoApiService extends RecursoApi<Distrito> {
  constructor(api: ApiService) {
    super(api, RECURSOS.distritos);
  }
}
