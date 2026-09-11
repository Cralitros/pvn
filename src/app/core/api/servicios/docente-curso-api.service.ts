import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DocenteCurso } from '../../../components/modelos/docentecurso';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Cursos asignados a los docentes (`docentescurso`). */
@Injectable({ providedIn: 'root' })
export class DocenteCursoApiService extends RecursoApi<DocenteCurso> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesCurso);
  }

  /** `GET docentescurso/docente/{codigo}` */
  obtenerPorDocente(codigo: IdRecurso): Observable<DocenteCurso[]> {
    return this.api.obtener<DocenteCurso[]>(SUBRUTAS.docenteCursoPorDocente, codigo);
  }
}
