
/**
 * Documento que sustenta un evento del histórico.
 *
 * Hay dos formas guardadas, y las dos se siguen leyendo:
 *
 * - **Nueva (recomendada)**: el archivo vive en el servidor y en el JSON sólo
 *   queda su referencia (`archivo`). El hosting corta cualquier petición de más
 *   de 128 KB, así que el archivo se sube por trozos a
 *   `docentescategoria/documento/{archivo}` y se ve con un `GET` a esa misma
 *   ruta. Mantiene el JSON del histórico pequeño, sin base64.
 * - **Antigua**: el contenido en base64 dentro del propio JSON (`dataUrl`). Se
 *   conserva para los registros que ya estaban guardados así.
 */
export interface DocumentoEvento {
    /** Nombre original del archivo, tal como lo eligió el usuario. */
    nombre: string;
    /** Tipo MIME (`application/pdf`, `image/png`...). */
    tipo: string;
    /** Tamaño en bytes, para mostrarlo en la tabla. */
    tamano: number;
    /** Nombre con el que el archivo quedó guardado en el servidor. */
    archivo?: string;
    /** Contenido del archivo como `data:<tipo>;base64,<datos>` (formato antiguo). */
    dataUrl?: string;
}

/**
 * Una fila del histórico de categoría de un docente.
 *
 * Se guarda como JSON en la columna `categoria` de `docentecategoria` (TEXT).
 * Cada fila es un evento del escalafón con su detalle: fechas, tipo de proceso,
 * línea, departamento, categoría, modalidad de ingreso, dedicación y el
 * documento de sustento.
 *
 * Los campos `nombre` y `fecha` sólo se leen: son la forma antigua de la fila
 * (una categoría y una fecha sueltas) y `normalizarEvento` los reparte entre
 * `categoriaDocente`/`categoriaPredocente` y `fechaInicio`.
 */
export interface EventoCategoria {
    /** Marca la fila como registrada (la tabla del listado sólo pinta las marcadas). */
    seleccionada?: boolean;
    /** Fecha en que el docente pasa a la situación descrita. */
    fechaInicio: string | Date | null;
    /** Fecha en que deja esa situación; vacía si sigue vigente. */
    fechaFin: string | Date | null;
    /** Ingreso, Nombramiento, Promoción, Jubilación... */
    tipoProceso: string;
    /** Predocente o Docente. */
    linea: string;
    /** Derecho u Otro departamento. */
    departamento: string;
    /** Sólo para la línea predocente: Instructor, Ayudante, Asistente, Jefe de práctica. */
    categoriaPredocente: string;
    /** Sólo para la línea docente: Contratado, Auxiliar, Asociado, Principal... */
    categoriaDocente: string;
    /** Entrevista, Evaluación, Directo o No aplica. */
    modalidadIngreso: string;
    /** TC, TPC, TPA o No aplica. */
    dedicacion: string;
    /** Resolución o documento que sustenta el evento. */
    documento: DocumentoEvento | null;
    /** Campo heredado: categoría de los registros anteriores al detalle. */
    nombre?: string;
    /** Campo heredado: fecha de los registros anteriores al detalle. */
    fecha?: string | Date | null;
}

export interface Categoria{
    id:string;
    tipo:string;
    fecha:Date;
    /** Histórico de eventos del docente, en JSON (ver `EventoCategoria`). */
    categoria:string;
    condiciondap:string;
    codigoDocente:string;
    dedicacion:string;
    labor:string;
    categoriadap:string;
    hContratado:Date;
    hAuxiliar:Date;
    hPrincipal:Date;
    hAsociado:Date;
    hProfesorVisita?:Date;
    hInstructor?:Date;
    hJefePract?:Date;
    hAyudante?:Date;
    hAsistente?:Date;
    categoriaJubilacion:string;
    dedicacionJubilacion:string;
    categoriaDAP?:string;
    condicionDAP?:string;
}
