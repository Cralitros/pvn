import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

/**
 * Datos de formato del locale declarado en `LOCALE_ID` (`'es-PE'`).
 *
 * En `app.config.ts` se configura `LOCALE_ID: 'es-PE'`, pero eso **no** carga
 * los datos de formato: solo cambia el identificador. Sin este registro,
 * cualquier pipe que dependa del locale (`| number`, `| date`, `| currency`,
 * `| percent`) lanza `NG0701: Missing locale data for the locale "es-PE"`, y
 * esa excepción **aborta el change detection a media plantilla**: los elementos
 * ya creados se quedan con las interpolaciones vacías y el contenido solo va
 * apareciendo a medida que el usuario provoca nuevos ciclos (un clic, por
 * ejemplo). El panel de control se quedaba a medio pintar por este motivo:
 * barras sin etiquetas, grid vacío y "21 tablas · registros" sin la cifra.
 *
 * Se registra en un módulo propio, y no dentro de `main.ts`, porque la
 * aplicación tiene dos puntos de entrada (`main.ts` y `main.server.ts`) que
 * deben compartir exactamente el mismo registro.
 */
registerLocaleData(localeEsPe, 'es-PE');
