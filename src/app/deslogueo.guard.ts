import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from './services/auth-service.service';
import { isPlatformBrowser } from '@angular/common';

export const deslogueoGuard: CanActivateFn = (route, state) => {
 // localStorage.setItem("token","123456");
   // Obtenemos la plataforma actual
   const platformId = inject(PLATFORM_ID);
  
   // Solo ejecutamos este código si estamos en el navegador
   if (isPlatformBrowser(platformId)) {
     const token = window.localStorage.getItem("token");
     if (token && token.length > 10) {
       return true;
     } else {
       inject(Router).navigate(['login']);
       return false;
     }
   } else {
     // Si estamos en el servidor, permitimos el acceso por defecto o gestionamos como lo necesitemos
     return true;
   }
};
