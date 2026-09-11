import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Escuela } from '../../../components/modelos/escuela';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS } from '../api-recursos';

/**
 * Departamentos académicos.
 *
 * La API usa **dos rutas para la misma entidad**: el listado se sirve en
 * `escuela` y la escritura en `departamentoacad`. Esa rareza queda documentada
 * y encapsulada aquí en vez de repartida por los componentes.
 */
@Injectable({ providedIn: 'root' })
export class DepartamentoAcademicoApiService {
  constructor(private readonly api: ApiService) {}

  /** `GET escuela` */
  listar(): Observable<Escuela[]> {
    return this.api.listar<Escuela>(RECURSOS.escuela);
  }

  /** `GET escuela?facultadId={id}` */
  listarPorFacultad(facultadId: IdRecurso): Observable<Escuela[]> {
    return this.api.listar<Escuela>(RECURSOS.escuela, { facultadId });
  }

  /** `POST departamentoacad` */
  crear(cuerpo: unknown): Observable<Escuela> {
    return this.api.crear<Escuela>(RECURSOS.departamentoAcademico, cuerpo);
  }

  /** `PUT departamentoacad/{id}` */
  actualizar(id: IdRecurso, cuerpo: unknown): Observable<Escuela> {
    return this.api.actualizar<Escuela>(RECURSOS.departamentoAcademico, id, cuerpo);
  }

  /** `DELETE escuela/{id}` */
  eliminar(id: IdRecurso): Observable<Escuela> {
    return this.api.eliminar<Escuela>(RECURSOS.escuela, id);
  }
}
