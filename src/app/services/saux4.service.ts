import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Saux4Service {
  private apiUrl =  environment.direccion;

  constructor(private http: HttpClient) { }

  ponerurl(direccion:string){
    //this.apiUrl = 'http://localhost:3000/';
    this.apiUrl = environment.direccion;
    this.apiUrl=`${this.apiUrl}${direccion}`;
    console.log(this.apiUrl);
    
  }

  get(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getid(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}`);
  }

  getDepartamentos(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  add(objeto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, objeto);
  }

  update(id: number, objeto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, objeto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
