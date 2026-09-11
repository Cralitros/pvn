/**
 * Capa de acceso a datos de la aplicación.
 *
 * Regla: los componentes **nunca** construyen URLs ni conocen rutas de la API.
 * Sólo inyectan el servicio del recurso que necesitan.
 */
export * from './api-base-url.token';
export * from './api-recursos';
export * from './api.types';
export * from './api.service';
export * from './http-error.util';
export * from './recurso-api';
export * from './servicios';
