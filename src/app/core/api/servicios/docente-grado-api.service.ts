import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Grado } from '../../../components/modelos/grado';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Grados académicos de los docentes (`docentesgrado`). */
@Injectable({ providedIn: 'root' })
export class DocenteGradoApiService extends RecursoApi<Grado> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesGrado);
  }
}
