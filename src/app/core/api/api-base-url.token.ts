import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * URL base de la API `backendpucp`.
 *
 * Se expone como `InjectionToken` en lugar de leer `environment` dentro de cada
 * servicio para poder sustituirla en pruebas o en otros despliegues sin tocar
 * una sola línea de los servicios.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.direccion,
});
