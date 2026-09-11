import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Guard para rutas hijas: sin token en `localStorage` se vuelve al login.
 *
 * Corregido: importaba `Router` desde **`express`** en lugar de
 * `@angular/router`, así que `navigate()` no existía (y arrastraba Express entero
 * al bundle del navegador). Además leía `localStorage` sin comprobar la
 * plataforma, lo que rompía el renderizado en servidor.
 */
export const hijoGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = window.localStorage.getItem('token');

  if (token && token.length > 10) {
    return true;
  }

  inject(Router).navigate(['login']);
  return false;
};
