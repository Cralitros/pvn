import { Injectable } from '@angular/core';

import { Curso } from '../../../components/modelos/cursos';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Cursos (`curso`). */
@Injectable({ providedIn: 'root' })
export class CursoApiService extends RecursoApi<Curso> {
  constructor(api: ApiService) {
    super(api, RECURSOS.curso);
  }
}
