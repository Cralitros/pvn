import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Protege las rutas del dashboard: sin token en `localStorage` se vuelve al
 * login. En el servidor (SSR) se permite el acceso, como antes.
 */
export const deslogueoGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = window.localStorage.getItem('token');
    if (token && token.length > 10) {
      return true;
    }

    inject(Router).navigate(['login']);
    return false;
  }

  return true;
};
