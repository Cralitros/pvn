import { AscensoCategoria } from '../../../modelos/categoria';

/**
 * Lógica del histórico de ascensos del docente.
 *
 * Está fuera del componente a propósito: son funciones puras, así que se pueden
 * probar sin navegador ni servidor (ver `ascensos.util.spec.ts`).
 */

/** Categorías que se pueden registrar en el histórico de ascensos. */
export const CATEGORIAS_ASCENSO: readonly string[] = [
  'Principal',
  'Asociado',
  'Auxiliar',
  'Contratado',
  'Profesor visitante',
  'Instructor',
  'Jefe de prácticas',
  'Ayudante de docencia',
  'Asistente de docencia',
];

/** Correspondencia de cada categoría con la API y con el componente de listado. */
export interface CorrespondenciaCategoria {
  /** Columna `h*` de la tabla `docentecategoria`. */
  columna: string;
  /** Clave con la que `categoria.component` envía esa fecha al diálogo. */
  claveValores: string;
}

/**
 * Columnas `h*` de la API por categoría.
 *
 * Se siguen enviando (derivadas de las filas) porque los generadores de PDF y
 * Word del backend las leen para calcular el rango de semestres del docente.
 */
export const HISTORICO_POR_CATEGORIA: Readonly<Record<string, CorrespondenciaCategoria>> = {
  'Contratado': { columna: 'hContratado', claveValores: 'contratado' },
  'Auxiliar': { columna: 'hAuxiliar', claveValores: 'auxiliar' },
  'Principal': { columna: 'hPrincipal', claveValores: 'principal' },
  'Asociado': { columna: 'hAsociado', claveValores: 'asociado' },
  'Profesor visitante': { columna: 'hProfesorVisita', claveValores: 'profesorvisitante' },
  'Instructor': { columna: 'hInstructor', claveValores: 'instructor' },
  'Jefe de prácticas': { columna: 'hJefePract', claveValores: 'jefepractica' },
  'Ayudante de docencia': { columna: 'hAyudante', claveValores: 'ayudante' },
  'Asistente de docencia': { columna: 'hAsistente', claveValores: 'asistente' },
};

/** Fila del histórico tal como la maneja el componente (fecha suelta). */
export interface FilaAscenso {
  nombre: string;
  fecha: unknown;
}

/**
 * Lee la lista JSON de la columna `categoria`.
 *
 * Devuelve `[]` si el valor viene vacío, corrupto o no es una lista, en lugar de
 * lanzar una excepción como hacía el `JSON.parse` directo.
 */
export function parsearCategoria(valor: unknown): AscensoCategoria[] {
  if (Array.isArray(valor)) {
    return valor as AscensoCategoria[];
  }

  if (typeof valor !== 'string' || valor.trim() === '') {
    return [];
  }

  try {
    const parseado = JSON.parse(valor);
    return Array.isArray(parseado) ? parseado : [];
  } catch {
    return [];
  }
}

/**
 * Convierte las filas del histórico en las columnas `h*` que espera la API.
 *
 * Si una categoría aparece más de una vez se conserva la fecha **más antigua**
 * (cuándo se accedió a esa categoría por primera vez). La lista completa, con
 * todas las filas, viaja igualmente en la columna `categoria`.
 */
export function derivarColumnasHistorico(
  ascensos: readonly FilaAscenso[],
): Record<string, string | null> {
  const columnas: Record<string, string | null> = {};

  for (const { columna } of Object.values(HISTORICO_POR_CATEGORIA)) {
    columnas[columna] = null;
  }

  for (const fila of ascensos) {
    const columna = HISTORICO_POR_CATEGORIA[fila.nombre]?.columna;
    if (!columna || !fila.fecha) {
      continue;
    }

    const fecha = new Date(fila.fecha as string | number | Date);
    if (isNaN(fecha.getTime())) {
      continue;
    }

    const actual = columnas[columna];
    if (!actual || fecha.getTime() < new Date(actual).getTime()) {
      columnas[columna] = fecha.toISOString();
    }
  }

  return columnas;
}

/** Fecha más reciente de una lista de valores de fecha, o `null` si no hay ninguna. */
export function fechaMasReciente(fechas: readonly unknown[]): Date | null {
  const validas = fechas
    .filter(fecha => !!fecha)
    .map(fecha => new Date(fecha as string | number | Date))
    .filter(fecha => !isNaN(fecha.getTime()));

  if (validas.length === 0) {
    return null;
  }

  return validas.reduce((mayor, fecha) => (fecha.getTime() > mayor.getTime() ? fecha : mayor));
}

/**
 * Reconstruye las filas a partir de las columnas `h*`.
 *
 * Sirve para los registros creados antes de que el histórico usara la lista
 * JSON: así no se pierden las fechas que ya estaban guardadas.
 */
export function ascensosDesdeColumnas(valores: Record<string, any> | null | undefined): AscensoCategoria[] {
  if (!valores) {
    return [];
  }

  return Object.entries(HISTORICO_POR_CATEGORIA)
    .map(([nombre, { claveValores }]) => ({ nombre, fecha: valores[claveValores] ?? null }))
    .filter(fila => !!fila.fecha);
}
