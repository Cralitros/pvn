import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private router: Router) { }

  /**
   * `localStorage` no existe durante el renderizado en servidor (SSR),
   * así que se accede siempre a través de este accesor seguro.
   */
  private get almacenamiento(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  // Guardar el token en el local storage
  setToken(token: string): void {
    this.almacenamiento?.setItem('token', token);
  }

  // Obtener el token del local storage
  getToken(): string | null {
    return this.almacenamiento?.getItem('token') ?? null;
  }

  /**
   * Comprobar si el token ha expirado.
   *
   * Un token ausente o ilegible (por ejemplo uno que no es un JWT) se considera
   * expirado: antes, un token con formato inesperado lanzaba una excepción
   * desde `JSON.parse(atob(...))`.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload?.exp;

      if (typeof expiry !== 'number') {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      return now >= expiry;
    } catch {
      return true;
    }
  }

  // Método para cerrar sesión
  logout(): void {
    this.almacenamiento?.removeItem('token');
    this.router.navigate(['/login']);
  }

  /**
   * ¿Hay una sesión válida?
   *
   * Corregido: antes preguntaba `token && this.isTokenExpired()`, es decir,
   * devolvía `true` justo cuando el token ESTABA expirado (la condición
   * invertida). Además el `localStorage.length > 0` sobraba: lo único que
   * importa es que exista el token.
   */
  estalogueado(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }
}
