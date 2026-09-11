import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Impide volver al login si ya hay una sesión iniciada.
 *
 * Notas de la limpieza:
 * - Se eliminó la inyección de `AuthServiceService` que no se usaba y los
 *   `console.log` de depuración.
 * - Se añadió la comprobación de plataforma: antes se leía `window.localStorage`
 *   sin verificar que `window` existiera, lo que rompía durante el renderizado
 *   en servidor (SSR/prerender). En el navegador el comportamiento es idéntico.
 */
export const logueoGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = window.localStorage?.getItem('token');

  if (token && token.length > 10) {
    inject(Router).navigate(['dashboard']);
    return false;
  }

  return true;
};
