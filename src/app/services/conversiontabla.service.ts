import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConversiontablaService {

  public array:any[]=[];
  public dataSeleccionada?:any;

  constructor(private http: HttpClient) { }

  ponerdata(todos:any[]){
    console.log("poniendo");
    
    this.array=todos;   
    console.log(this.array);
    
  }
  data(datos:any){
    this.dataSeleccionada=datos;
  }
}
