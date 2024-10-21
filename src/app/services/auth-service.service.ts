import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private router: Router) { }

  // Guardar el token en el local storage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtener el token del local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Comprobar si el token ha expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    const now = Math.floor(new Date().getTime() / 1000);
    return now >= expiry;
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  estalogueado() {
    if (localStorage.length>0) {
      if (localStorage.getItem('token') && this.isTokenExpired()) {
        return true;
      } else {
        return false;
      }
    }
    return false;

    //return localStorage.getItem('token');
  }
}
