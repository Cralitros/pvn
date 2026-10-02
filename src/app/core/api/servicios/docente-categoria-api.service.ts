import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Categoria } from '../../../components/modelos/categoria';
import { ApiService } from '../api.service';
import { RECURSOS, SUBRUTAS } from '../api-recursos';
import { RecursoApi } from '../recurso-api';

/** Categorías de los docentes (`docentescategoria`). */
@Injectable({ providedIn: 'root' })
export class DocenteCategoriaApiService extends RecursoApi<Categoria> {
  constructor(api: ApiService) {
    super(api, RECURSOS.docentesCategoria);
  }

  /**
   * Sube un trozo del documento que sustenta un evento del histórico.
   *
   * El hosting corta los cuerpos de más de 128 KB, así que el archivo se manda
   * en bloques binarios: `indice = 0` crea el archivo y los siguientes añaden.
   */
  subirTrozoDocumento(archivo: string, indice: number, trozo: Blob): Observable<unknown> {
    return this.api.enviarBinario(SUBRUTAS.docenteCategoriaDocumento, [archivo], trozo, { indice });
  }

  /** `GET docentescategoria/documento/{archivo}` */
  descargarDocumento(archivo: string): Observable<Blob> {
    return this.api.descargar(SUBRUTAS.docenteCategoriaDocumento, archivo);
  }

  /** `DELETE docentescategoria/documento/{archivo}` */
  eliminarDocumento(archivo: string): Observable<unknown> {
    return this.api.eliminar(SUBRUTAS.docenteCategoriaDocumento, archivo);
  }
}
