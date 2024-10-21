import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from './services/auth-service.service';


export const logueoGuard: CanActivateFn = (route, state) => {

  console.log(route);
  console.log(state);
  let flg=inject(AuthServiceService);
  console.log(localStorage);
  
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    //localStorage.setItem("token","123456");
    if(window.localStorage?.getItem("token") && window.localStorage?.getItem("token")!.length>10  ){
      /* console.log("correcto");
       this.router.navigate(['dash']);*/
       inject(Router).navigate(['dashboard']);
       return false;
     }
     else{
      // console.log("incorrecto");
       
       return true;
     }

  

 return true;
  
};
