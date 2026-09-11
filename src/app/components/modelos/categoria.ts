
/**
 * Una fila del histórico de ascensos de un docente.
 *
 * Se guarda como JSON en la columna `categoria` de `docentecategoria` (TEXT),
 * que es exactamente la estructura que ya consumía la tabla de categorías:
 * `tabla.component.datos()` recorre el JSON y muestra las filas marcadas con
 * `seleccionada: true` como `nombre - Asignado: fecha`.
 */
export interface AscensoCategoria {
    /** Categoría: Principal, Asociado, Auxiliar, Jefe de prácticas... */
    nombre: string;
    /** Marca la fila como registrada (la tabla sólo pinta las marcadas). */
    seleccionada?: boolean;
    /** Fecha del ascenso. */
    fecha: string | Date | null;
}

export interface Categoria{
    id:string;
    tipo:string;
    fecha:Date;
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
    categoriaJubilacion:string;
    dedicacionJubilacion:string;
    categoriaDAP?:string;
    condicionDAP?:string;
}