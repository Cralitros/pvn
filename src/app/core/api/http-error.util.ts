/**
 * Utilidades para mostrar errores HTTP de la API.
 *
 * La API responde a los fallos con `{ error: '...' }` o `{ mensaje: '...' }`,
 * así que conviene contemplar los dos formatos en lugar de mostrar siempre un
 * mensaje genérico: cuando algo falla en el navegador, el texto del servidor es
 * lo único que permite saber qué pasó sin abrir la consola.
 */

/** Detalle legible de un error HTTP. */
export interface DetalleErrorHttp {
  /** Código HTTP (500, 404...), si el error lo trae. */
  estado: number | null;
  /** Mensaje devuelto por la API o por Angular, si lo trae. */
  mensaje: string | null;
}

/** Extrae el código y el mensaje de un error de `HttpClient`. */
export function detalleDeErrorHttp(error: unknown): DetalleErrorHttp {
  const respuesta = error as { status?: unknown; error?: unknown; message?: unknown } | null;

  const estado = typeof respuesta?.status === 'number' ? respuesta.status : null;

  return {
    estado,
    mensaje: mensajeDeErrorHttp(respuesta?.error) ?? textoDe(respuesta?.message),
  };
}

/** Título sugerido para el aviso: `Error al guardar (500)`. */
export function tituloDeErrorHttp(accion: string, error: unknown): string {
  const { estado } = detalleDeErrorHttp(error);

  return estado ? `${accion} (${estado})` : accion;
}

/** Texto del cuerpo del error, aceptando texto plano u objeto. */
function mensajeDeErrorHttp(cuerpo: unknown): string | null {
  if (typeof cuerpo === 'string') {
    return textoDe(cuerpo);
  }

  if (cuerpo && typeof cuerpo === 'object') {
    const datos = cuerpo as { error?: unknown; mensaje?: unknown; message?: unknown };

    for (const valor of [datos.error, datos.mensaje, datos.message]) {
      const texto = textoDe(valor);
      if (texto) {
        return texto;
      }
    }
  }

  return null;
}

/** Normaliza un valor a texto recortado (o `null` si queda vacío). */
function textoDe(valor: unknown): string | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto = String(valor).trim();

  return texto === '' ? null : texto.substring(0, 400);
}
