import { ReconocimientoInvestigador } from '../../../modelos/investigador';

/**
 * Lógica del historial de reconocimientos del investigador.
 *
 * Son funciones puras, así que se pueden probar sin navegador ni backend
 * (ver `reconocimientos.util.spec.ts`).
 *
 * El historial sustituye a los 7 campos fijos que usaba antes la pantalla
 * (ri, pibpdu, gadi, sei, gadd, gadit, dfi): sus datos se pasaron al historial
 * con el script `sql/migracion_reconocimientos_datos_y_limpieza.sql`.
 */

/** Campos de una fila, en el orden en que se muestran en la tabla. */
export const CAMPOS_RECONOCIMIENTO: readonly (keyof ReconocimientoInvestigador)[] = [
  'anio',
  'nombre',
  'categoria',
  'unidad',
  'observaciones',
];

/** Fila vacía del historial. */
export function reconocimientoVacio(): ReconocimientoInvestigador {
  return { anio: '', nombre: '', categoria: '', unidad: '', observaciones: '' };
}

/** Texto limpio de un valor que puede venir nulo o con espacios. */
function texto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor).trim();
}

/** Normaliza cualquier objeto a una fila con los cinco campos como texto. */
function normalizarFila(fila: unknown): ReconocimientoInvestigador {
  const datos = (fila ?? {}) as Partial<ReconocimientoInvestigador>;

  return {
    anio: texto(datos.anio),
    nombre: texto(datos.nombre),
    categoria: texto(datos.categoria),
    unidad: texto(datos.unidad),
    observaciones: texto(datos.observaciones),
  };
}

/**
 * Lee el historial guardado en la columna `reconocimientos`.
 *
 * Devuelve `[]` si el valor viene vacío, corrupto o no es una lista, en lugar de
 * lanzar una excepción.
 */
export function parsearReconocimientos(valor: unknown): ReconocimientoInvestigador[] {
  let lista: unknown = valor;

  if (typeof valor === 'string') {
    if (valor.trim() === '') {
      return [];
    }

    try {
      lista = JSON.parse(valor);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map(normalizarFila);
}

/** Año como número (0 si no es un año válido), para poder ordenar. */
export function anioNumerico(valor: unknown): number {
  const anio = parseInt(texto(valor), 10);

  if (isNaN(anio)) {
    return 0;
  }

  // Un año fuera de este rango se considera dato inválido y va al final.
  return anio >= 1000 && anio <= 9999 ? anio : 0;
}

/** Ordena de más reciente a más antiguo, sin mutar el arreglo original. */
export function ordenarPorAnioDescendente(
  filas: readonly ReconocimientoInvestigador[],
): ReconocimientoInvestigador[] {
  return [...filas].sort((a, b) => anioNumerico(b.anio) - anioNumerico(a.anio));
}

/**
 * JSON que se envía a la API.
 *
 * Se ordena de más reciente a más antiguo para que el historial quede siempre
 * con el último reconocimiento arriba y no dependa del orden en que se
 * introdujeron las filas.
 */
export function serializarReconocimientos(
  filas: readonly ReconocimientoInvestigador[],
): string {
  const limpias = ordenarPorAnioDescendente(filas)
    .map(normalizarFila)
    .filter(fila => fila.anio !== '' || fila.nombre !== '' || fila.categoria !== ''
      || fila.unidad !== '' || fila.observaciones !== '');

  return JSON.stringify(limpias);
}
