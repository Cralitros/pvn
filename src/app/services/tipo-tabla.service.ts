import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

// tipos.ts
export type Tablas = 'AFP' | 'OTRA_TABLA' | 'OTRA_MAS';

@Injectable({
  providedIn: 'root'
})
export class TipoTablaService {

   private canales: {[key in Tablas]?: BehaviorSubject<any>} = {};

  /**
   * Obtiene o crea un canal de comunicación para una tabla específica
   * @param tabla Nombre de la tabla (tipado estricto)
   */
  obtenerCanal(tabla: Tablas): BehaviorSubject<any> {
    if (!this.canales[tabla]) {
      this.canales[tabla] = new BehaviorSubject<any>(null);
    }
    return this.canales[tabla]!;
  }

  /**
   * Envía datos a través de un canal específico
   * @param tabla Nombre de la tabla
   * @param datos Datos a enviar
   */
  enviarDatos(tabla: Tablas, datos: any): void {
    this.obtenerCanal(tabla).next(datos);
  }

  /**
   * Limpia un canal específico
   * @param tabla Nombre de la tabla
   */
  limpiarCanal(tabla: Tablas): void {
    if (this.canales[tabla]) {
      this.canales[tabla]!.complete();
      delete this.canales[tabla];
    }
  }
}
