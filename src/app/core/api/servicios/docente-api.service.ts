import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Personal } from '../../../components/modelos/personal';
import { ApiService } from '../api.service';
import { IdRecurso } from '../api.types';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Docentes (`docentes`). */
@Injectable({ providedIn: 'root' })
export class DocenteApiService extends RecursoApi<Personal> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentes);
  }

  /** `GET docentes/cod/{codigo}` */
  obtenerPorCodigo(codigo: IdRecurso): Observable<Personal[]> {
    return this.api.obtener<Personal[]>(SUBRUTAS.docentePorCodigo, codigo);
  }

  /** `GET docentes/contrato/{codigo}/{dni}` */
  descargarContrato(codigo: IdRecurso, dni: IdRecurso): Observable<Blob> {
    return this.api.descargar(SUBRUTAS.docenteContrato, codigo, dni);
  }

  /**
   * URL absoluta del contrato.
   *
   * Necesaria para el visor (`<object>`/`<iframe>`), que consume la URL
   * directamente en lugar de un `Blob`.
   */
  urlContrato(codigo: IdRecurso, dni: IdRecurso): string {
    return this.api.urlAbsoluta(SUBRUTAS.docenteContrato, codigo, dni);
  }

  /** `GET docentes/contratow/{codigo}` → contrato en Word. */
  descargarContratoWord(codigo: IdRecurso): Observable<Blob> {
    return this.api.descargar(SUBRUTAS.docenteContratoWord, codigo);
  }

  /** URL absoluta del contrato en Word. */
  urlContratoWord(codigo: IdRecurso): string {
    return this.api.urlAbsoluta(SUBRUTAS.docenteContratoWord, codigo);
  }
}
