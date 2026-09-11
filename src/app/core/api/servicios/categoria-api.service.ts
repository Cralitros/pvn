import { Injectable } from '@angular/core';

import { Condiciones } from '../../../components/modelos/condiciones';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Condiciones / categorías del docente (`categoria`). */
@Injectable({ providedIn: 'root' })
export class CategoriaApiService extends RecursoApi<Condiciones> {
  constructor(api: ApiService) {
    super(api, RECURSOS.categoria);
  }
}
