import { Injectable } from '@angular/core';

import { Departamento } from '../../../components/modelos/departamento';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Departamentos (`departamentos`). */
@Injectable({ providedIn: 'root' })
export class DepartamentoApiService extends RecursoApi<Departamento> {
  constructor(api: ApiService) {
    super(api, RECURSOS.departamentos);
  }
}
