import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from './services/auth-service.service';

export const deslogueoGuard: CanActivateFn = (route, state) => {
 // localStorage.setItem("token","123456");
 let flg=inject(AuthServiceService);
  if(window.localStorage.getItem("token") && window.localStorage.getItem("token")!.length>10 ){
     return true;
   }
   else{
    inject(Router).navigate(['login']);
     return false;
   }
};
