import { Injectable } from '@angular/core';

import { Categoria } from '../../../components/modelos/categoria';
import { ApiService } from '../api.service';
import { RECURSOS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Categorías de los docentes (`docentescategoria`). */
@Injectable({ providedIn: 'root' })
export class DocenteCategoriaApiService extends RecursoApi<Categoria> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesCategoria);
  }
}
