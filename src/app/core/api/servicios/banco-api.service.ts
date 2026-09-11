import { Injectable } from '@angular/core';

import { Banco } from '../../../components/modelos/banco';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Bancos (`bancos`). */
@Injectable({ providedIn: 'root' })
export class BancoApiService extends RecursoApi<Banco> {
  constructor(api: ApiService) {
    super(api, RECURSOS.bancos);
  }
}
