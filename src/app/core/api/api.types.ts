import { Recurso } from './api-recursos';

/** Identificador de un registro (`id` numérico, `codigo`/`dni` alfanumérico...). */
export type IdRecurso = string | number;

/** Valor admitido como parámetro de consulta (`null`/`undefined` se omiten). */
export type ValorParametro = string | number | boolean | null | undefined;

/** Parámetros de consulta enviados como `?clave=valor`. */
export type ParametrosApi = Record<string, ValorParametro>;

/**
 * Ruta de la API: un recurso base (`'afps'`) o una sub-ruta (`'docentes/cod'`).
 */
export type RutaApi = Recurso | `${Recurso}/${string}`;

/** Respuesta de los endpoints `{recurso}/total` usados por el dashboard. */
export interface TotalRecurso {
  total: number;
}

/** Opciones de una descarga (segmentos de ruta y parámetros de consulta). */
export interface OpcionesDescarga {
  segmentos?: readonly IdRecurso[];
  parametros?: ParametrosApi;
}
