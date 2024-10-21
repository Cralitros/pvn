import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from 'express';

export const hijoGuard: CanActivateFn = (route, state) => {

  if(localStorage.getItem("token") && localStorage.getItem("token")!.length>10 ){
     return true;
   }
   else{
    inject(Router).navigate(['login']);
     return false;
   }
};
