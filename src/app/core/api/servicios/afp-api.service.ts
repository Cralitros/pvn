import { Injectable } from '@angular/core';

import { Afp } from '../../../components/modelos/afp';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** AFP (`afps`). */
@Injectable({ providedIn: 'root' })
export class AfpApiService extends RecursoApi<Afp> {
  constructor(api: ApiService) {
    super(api, RECURSOS.afps);
  }
}
