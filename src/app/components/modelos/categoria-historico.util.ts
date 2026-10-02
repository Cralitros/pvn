import { DocumentoEvento, EventoCategoria } from './categoria';

/**
 * Lógica del histórico de categoría del docente.
 *
 * Está fuera de los componentes a propósito: son funciones puras, así que se
 * pueden probar sin navegador ni servidor (ver `categoria-historico.util.spec.ts`).
 * La usan el diálogo de categoría y el listado, que pinta el detalle de cada
 * evento en la fila desplegada.
 */

// ─── Catálogos del detalle de cada evento ────────────────────────────────────

/** Tipos de proceso que se pueden registrar. */
export const TIPOS_PROCESO: readonly string[] = [
  'Ingreso',
  'Nombramiento',
  'Confirmación',
  'Ratificación',
  'Promoción',
  'Cambio de dedicación',
  'Cambio de departamento',
  'Jubilación',
  'Suspensión',
  'Fallecimiento',
];

/** Líneas del escalafón. Deciden qué categoría se pide en cada fila. */
export const LINEAS_HISTORICO: readonly string[] = ['Predocente', 'Docente'];

/** Departamentos donde puede ocurrir el evento. */
export const DEPARTAMENTOS_HISTORICO: readonly string[] = ['Derecho', 'Otro departamento'];

/** Categorías de la línea predocente. */
export const CATEGORIAS_PREDOCENTE: readonly string[] = [
  'Instructor',
  'Ayudante',
  'Asistente',
  'Jefe de práctica',
];

/** Categorías de la línea docente. */
export const CATEGORIAS_DOCENTE: readonly string[] = [
  'Contratado',
  'Contratado jubilado',
  'Contratado emérito',
  'Auxiliar',
  'Asociado',
  'Principal',
  'Visitante',
  'Emérito',
  'Honorario',
];

/** Formas de acceder al cargo. */
export const MODALIDADES_INGRESO: readonly string[] = ['Entrevista', 'Evaluación', 'Directo', 'No aplica'];

/** Dedicaciones que puede tener el evento. */
export const DEDICACIONES_HISTORICO: readonly string[] = ['TC', 'TPC', 'TPA', 'No aplica'];

/** Categorías con las que se puede registrar la jubilación del docente. */
export const CATEGORIAS_JUBILACION: readonly string[] = ['Principal', 'Asociado', 'Auxiliar', 'Contratado'];

// ─── Catálogo de columnas heredadas de la API ────────────────────────────────

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
 * Las claves son los nombres ya normalizados del catálogo actual.
 */
export const HISTORICO_POR_CATEGORIA: Readonly<Record<string, CorrespondenciaCategoria>> = {
  'Contratado': { columna: 'hContratado', claveValores: 'contratado' },
  'Auxiliar': { columna: 'hAuxiliar', claveValores: 'auxiliar' },
  'Principal': { columna: 'hPrincipal', claveValores: 'principal' },
  'Asociado': { columna: 'hAsociado', claveValores: 'asociado' },
  'Visitante': { columna: 'hProfesorVisita', claveValores: 'profesorvisitante' },
  'Instructor': { columna: 'hInstructor', claveValores: 'instructor' },
  'Jefe de práctica': { columna: 'hJefePract', claveValores: 'jefepractica' },
  'Ayudante': { columna: 'hAyudante', claveValores: 'ayudante' },
  'Asistente': { columna: 'hAsistente', claveValores: 'asistente' },
};

/** Nombres del histórico anterior que hoy tienen otro rótulo. */
const ALIAS_CATEGORIA: Readonly<Record<string, string>> = {
  'Profesor visitante': 'Visitante',
  'Jefe de prácticas': 'Jefe de práctica',
  'Ayudante de docencia': 'Ayudante',
  'Asistente de docencia': 'Asistente',
};

// ─── Documento de sustento ───────────────────────────────────────────────────

/** Extensiones aceptadas para el documento que sustenta el evento. */
export const EXTENSIONES_DOCUMENTO: readonly string[] = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'];

/**
 * Límite del archivo adjunto.
 *
 * El documento ya no viaja en el cuerpo del guardado (se sube por trozos y se
 * guarda en el servidor), así que este tope es de comodidad, no del hosting.
 */
export const MAX_DOCUMENTO_BYTES = 5 * 1024 * 1024;

/**
 * Tamaño de cada trozo al subir el documento.
 *
 * El backend cortaba las peticiones de más de ~100 KB (el límite por defecto de
 * `express.json`), así que los trozos van muy por debajo: 5 MB son 80 peticiones
 * seguidas, con barra de avance en la tabla. Es preferible a que la petición
 * muera sin respuesta.
 */
export const TAMANO_TROZO_BYTES = 64 * 1024;

/** Tamaño en bytes → texto legible (`350 KB`, `1.4 MB`). */
export function formatearTamano(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Cuerpo JSON por encima del cual el backend rechaza el guardado.
 *
 * Espeja el `express.json({ limit: '10mb' })` de `app.js`. Sólo puede alcanzarse
 * con los documentos **antiguos** (los que llevan el base64 dentro del propio
 * JSON): los nuevos se suben por su propia ruta y el histórico queda diminuto.
 */
export const LIMITE_CUERPO_BYTES = 10 * 1024 * 1024;

/** ¿El JSON del histórico es tan grande que el backend lo va a rechazar? */
export function cuerpoDemasiadoGrande(json: string): boolean {
  return json.length > LIMITE_CUERPO_BYTES;
}

/**
 * Nombre con el que se guarda el documento en el servidor.
 *
 * Se genera aquí para que sea único y seguro: el backend sólo acepta letras,
 * números, guiones y puntos, así que del nombre original sólo se conserva la
 * extensión.
 */
export function nombreDocumento(codigo: unknown, original: string): string {
  const extension = (original.split('.').pop() ?? '').toLowerCase();
  const sufijo = EXTENSIONES_DOCUMENTO.includes(extension) ? `.${extension}` : '';
  const referencia = texto(codigo).replace(/[^A-Za-z0-9]/g, '') || 'docente';
  const marca = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  return `cat-${referencia}-${marca}${sufijo}`;
}

/**
 * Comprueba si un archivo se puede adjuntar.
 *
 * Devuelve `null` cuando es válido y, si no, el motivo del rechazo ya redactado
 * para mostrarlo al usuario.
 */
export function validarDocumento(archivo: { name?: string; size?: number } | null | undefined): string | null {
  if (!archivo) {
    return 'No se seleccionó ningún archivo.';
  }

  const nombre = archivo.name ?? '';
  const extension = nombre.includes('.') ? nombre.split('.').pop()!.toLowerCase() : '';

  if (!EXTENSIONES_DOCUMENTO.includes(extension)) {
    return 'Formato no permitido. Adjunta un PDF, un Word o una imagen.';
  }

  const tamano = archivo.size ?? 0;
  if (tamano > MAX_DOCUMENTO_BYTES) {
    return `El archivo pesa ${formatearTamano(tamano)} y el máximo es ${formatearTamano(MAX_DOCUMENTO_BYTES)}.`;
  }

  return null;
}

/**
 * ¿El valor guardado tiene la forma de un documento adjunto?
 *
 * Vale tanto el formato nuevo (referencia al archivo del servidor, `archivo`)
 * como el antiguo (contenido en base64, `dataUrl`).
 */
export function esDocumento(valor: unknown): valor is DocumentoEvento {
  const documento = valor as DocumentoEvento | null | undefined;

  if (!documento || typeof documento !== 'object') {
    return false;
  }

  return (typeof documento.archivo === 'string' && documento.archivo.trim() !== '')
    || (typeof documento.dataUrl === 'string' && documento.dataUrl.trim() !== '');
}

// ─── Filas del histórico ─────────────────────────────────────────────────────

/** Convierte cualquier valor en texto; `null`/`undefined` se vuelven `''`. */
function texto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return '';
  }

  return typeof valor === 'string' ? valor : String(valor);
}

/** `Date` válida a partir de lo que venga guardado, o `null`. */
export function fechaValida(valor: unknown): Date | null {
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor as string | number | Date);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * `Date` en hora local a partir de un valor guardado.
 *
 * Los valores con hora (los que guarda el propio formulario, que parte de la
 * medianoche local) se interpretan tal cual. Los que vienen sin hora
 * (`2021-08-01`, típico de una columna de fecha de la base de datos) se
 * construyen en local a propósito: `new Date('2021-08-01')` los lee como UTC y en
 * hora de Perú eso es el **día anterior**, así que el 1 de agosto se veía como 31
 * de julio y, al reabrirlo en el formulario, se guardaba un día menos.
 */
export function fechaLocal(valor: unknown): Date | null {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);

  if (soloFecha) {
    const fecha = new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]));
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  return fechaValida(valor);
}

/** Fila del histórico vacía y lista para editar. */
export function crearEventoVacio(): EventoCategoria {
  return {
    seleccionada: true,
    fechaInicio: null,
    fechaFin: null,
    tipoProceso: '',
    linea: '',
    departamento: '',
    categoriaPredocente: '',
    categoriaDocente: '',
    modalidadIngreso: '',
    dedicacion: '',
    documento: null,
  };
}

/**
 * Normaliza una fila guardada, venga del formato nuevo o del antiguo.
 *
 * El formato antiguo tenía una sola categoría (`nombre`) y una sola fecha
 * (`fecha`): se reparten según la línea a la que pertenezca la categoría, para
 * que los registros ya existentes se sigan viendo y no se pierdan al guardar.
 */
export function normalizarEvento(fila: unknown): EventoCategoria {
  const evento = crearEventoVacio();

  if (!fila || typeof fila !== 'object') {
    return evento;
  }

  const datos = fila as Record<string, unknown>;

  evento.seleccionada = datos['seleccionada'] === undefined ? true : !!datos['seleccionada'];
  evento.fechaInicio = (datos['fechaInicio'] ?? datos['fecha'] ?? null) as EventoCategoria['fechaInicio'];
  evento.fechaFin = (datos['fechaFin'] ?? null) as EventoCategoria['fechaFin'];
  evento.tipoProceso = texto(datos['tipoProceso']);
  evento.linea = texto(datos['linea']);
  evento.departamento = texto(datos['departamento']);
  evento.categoriaPredocente = texto(datos['categoriaPredocente']);
  evento.categoriaDocente = texto(datos['categoriaDocente']);
  evento.modalidadIngreso = texto(datos['modalidadIngreso']);
  evento.dedicacion = texto(datos['dedicacion']);
  evento.documento = esDocumento(datos['documento']) ? datos['documento'] : null;

  // Registros anteriores al detalle: una categoría suelta en `nombre`.
  const heredada = texto(datos['nombre']);
  if (heredada) {
    const categoria = ALIAS_CATEGORIA[heredada] ?? heredada;

    if (CATEGORIAS_PREDOCENTE.includes(categoria)) {
      evento.categoriaPredocente = evento.categoriaPredocente || categoria;
      evento.linea = evento.linea || 'Predocente';
    } else {
      evento.categoriaDocente = evento.categoriaDocente || categoria;
      evento.linea = evento.linea || 'Docente';
    }
  }

  return evento;
}

/**
 * Lee la lista JSON de la columna `categoria`.
 *
 * Devuelve `[]` si el valor viene vacío, corrupto o no es una lista, en lugar de
 * lanzar una excepción como hacía el `JSON.parse` directo.
 */
export function parsearCategoria(valor: unknown): EventoCategoria[] {
  if (Array.isArray(valor)) {
    return valor.map(normalizarEvento);
  }

  if (typeof valor !== 'string' || valor.trim() === '') {
    return [];
  }

  try {
    const parseado = JSON.parse(valor);
    return Array.isArray(parseado) ? parseado.map(normalizarEvento) : [];
  } catch {
    return [];
  }
}

/**
 * Categoría que representa al evento.
 *
 * Manda la de la línea elegida; si el evento viene de los registros antiguos
 * (sin línea) se toma la que tenga dato.
 */
export function categoriaVisible(evento: EventoCategoria): string {
  if (evento.linea === 'Predocente') {
    return evento.categoriaPredocente || evento.categoriaDocente;
  }

  if (evento.linea === 'Docente') {
    return evento.categoriaDocente || evento.categoriaPredocente;
  }

  return evento.categoriaDocente || evento.categoriaPredocente;
}

/** Fecha de inicio del evento, contemplando el campo heredado `fecha`. */
export function fechaInicioDe(evento: EventoCategoria): EventoCategoria['fechaInicio'] {
  return evento.fechaInicio ?? evento.fecha ?? null;
}

/** ¿La fila no tiene ningún dato? Sirve para descartar las filas sin llenar. */
export function eventoVacio(evento: EventoCategoria): boolean {
  return !categoriaVisible(evento)
    && !fechaInicioDe(evento)
    && !evento.fechaFin
    && !evento.tipoProceso
    && !evento.linea
    && !evento.departamento
    && !evento.modalidadIngreso
    && !evento.dedicacion
    && !evento.documento;
}

/**
 * Convierte las filas del histórico en las columnas `h*` que espera la API.
 *
 * Si una categoría aparece más de una vez se conserva la fecha **más antigua**
 * (cuándo se accedió a esa categoría por primera vez). La lista completa, con
 * todas las filas, viaja igualmente en la columna `categoria`.
 */
export function derivarColumnasHistorico(
  eventos: readonly EventoCategoria[],
): Record<string, string | null> {
  const columnas: Record<string, string | null> = {};

  for (const { columna } of Object.values(HISTORICO_POR_CATEGORIA)) {
    columnas[columna] = null;
  }

  for (const evento of eventos) {
    const columna = HISTORICO_POR_CATEGORIA[categoriaVisible(evento)]?.columna;
    const fecha = fechaValida(fechaInicioDe(evento));

    if (!columna || !fecha) {
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
    .map(fechaValida)
    .filter((fecha): fecha is Date => !!fecha);

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
export function ascensosDesdeColumnas(
  valores: Record<string, any> | null | undefined,
): EventoCategoria[] {
  if (!valores) {
    return [];
  }

  return Object.entries(HISTORICO_POR_CATEGORIA)
    .map(([nombre, { claveValores }]) => ({ nombre, fecha: valores[claveValores] ?? null }))
    .filter(fila => !!fila.fecha)
    .map(normalizarEvento);
}
