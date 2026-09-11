import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Programa } from '../../../components/modelos/programa';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Programas académicos (`programa`). */
@Injectable({ providedIn: 'root' })
export class ProgramaApiService extends RecursoApi<Programa> {
  constructor(api: ApiService) {
    super(api, RECURSOS.programa);
  }

  /** `GET programa?escuelaId={id}` */
  listarPorEscuela(escuelaId: IdRecurso): Observable<Programa[]> {
    return this.listar({ escuelaId });
  }
}
