import { Injectable } from '@angular/core';

import { Plan } from '../../../components/modelos/plan';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Planes académicos (`plan`). */
@Injectable({ providedIn: 'root' })
export class PlanApiService extends RecursoApi<Plan> {
  constructor(api: ApiService) {
    super(api, RECURSOS.plan);
  }
}
