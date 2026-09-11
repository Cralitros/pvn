import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConversiontablaService {

  public array:any[]=[];
  public dataSeleccionada?:any;

  constructor() { }

  ponerdata(todos:any[]){
    this.array=todos;   
  }
  data(datos:any){
    this.dataSeleccionada=datos;
  }
}
