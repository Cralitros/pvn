
/**
 * Una fila del historial de reconocimientos de un investigador.
 *
 * Se guarda como array JSON en la columna `reconocimientos` de la tabla
 * `docenteinvestigadors` (TEXT):
 * `[{ anio, nombre, categoria, unidad, observaciones }, ...]`
 */
export interface ReconocimientoInvestigador {
    /** Año en que se otorgó el reconocimiento. */
    anio: string;
    /** Nombre del reconocimiento. */
    nombre: string;
    /** Categoría del reconocimiento. */
    categoria: string;
    /** Unidad (facultad, institución...) que lo otorga. */
    unidad: string;
    /** Observaciones. */
    observaciones: string;
}

export interface Investigador{
    id:string;
    orcid:string;
    renacyt:Date;
    grupo:string;
    nivel:string;
    registro:string;
    rol:string;
    reconocimiento:string;
    contenido:string;
    codigoDocente:string;
    condicion:string;
    semestresInvestigacion:string;
    /** Historial de reconocimientos en JSON (columna `reconocimientos`). */
    reconocimientos?:string;
}