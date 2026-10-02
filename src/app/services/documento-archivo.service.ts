import { Injectable } from '@angular/core';

/**
 * Apertura y descarga de archivos que ya están en memoria.
 *
 * Lo usan el diálogo de categoría y el listado para el documento que sustenta un
 * evento del histórico: los dos acaban con un `Blob` (descargado del servidor o
 * reconstruido desde el base64 de los registros antiguos) y necesitan lo mismo
 * —abrir el PDF o la imagen en una pestaña, y descargar lo que el navegador no
 * sabe mostrar— sin duplicar el manejo de `URL.createObjectURL` y de la pestaña
 * bloqueada.
 */
@Injectable({ providedIn: 'root' })
export class DocumentoArchivoService {
  /**
   * Abre el archivo en una pestaña nueva.
   *
   * Si el tipo no se puede mostrar (Word) o el navegador bloquea la pestaña, se
   * descarga en lugar de no hacer nada. La URL temporal se libera al minuto: si
   * se revoca antes, la pestaña recién abierta se queda en blanco.
   */
  abrir(blob: Blob, nombre: string, tipo: string): void {
    const url = URL.createObjectURL(blob);
    const sePuedeVer = tipo === 'application/pdf'
      || tipo.startsWith('image/')
      || /\.(pdf|png|jpe?g|webp)$/i.test(nombre);

    if (sePuedeVer) {
      const ventana = window.open(url, '_blank');

      if (ventana) {
        // La pestaña nueva no debe poder tocar la aplicación que la abrió.
        ventana.opener = null;
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }
    }

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  /**
   * `data:<tipo>;base64,<datos>` → `Blob`.
   *
   * Sólo hace falta para los documentos guardados en el formato antiguo, que
   * llevaban el contenido dentro del JSON del histórico.
   */
  desdeBase64(dataUrl: string, tipo: string): Blob {
    const base64 = dataUrl.split(',')[1] ?? '';
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);

    for (let i = 0; i < binario.length; i++) {
      bytes[i] = binario.charCodeAt(i);
    }

    return new Blob([bytes], { type: tipo || 'application/octet-stream' });
  }
}
