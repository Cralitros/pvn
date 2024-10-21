import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime } from 'rxjs';

interface filtro{
  campo:string,
  valor:any,
  accion?:any
}

@Component({
  selector: 'app-inputs',
  standalone: true,
  imports: [
    MatPaginatorModule, 
    FormsModule,
    MatTableModule, 
    CommonModule,
    MatIconModule,
    MatInputModule, 
    MatCheckboxModule, 
    MatSelectModule, 
    FiltroComponent, 
    InputsComponent,
    MatFormFieldModule, 
    MatButtonModule
  ],
  templateUrl: './inputs.component.html',
  styleUrl: './inputs.component.scss'
})
export class InputsComponent implements OnInit{
  valor?:filtro;
  @Input() campo: any ;
  @Output() seleccionado = new EventEmitter<any>();
  private inputSubject: Subject<any> = new Subject();
  
  constructor(){
    this.inputSubject.pipe(
      debounceTime(300) // Espera 300 ms después del último evento antes de emitir el valor
    ).subscribe(value => {
      console.log('El usuario ha dejado de escribir:', value);
      // Lógica cuando el usuario deja de escribir
      this.valor = {
        campo: this.campo,
        valor: value,
        accion: "agregar"
      };
      this.seleccionado.emit(this.valor);
    });
    
  }
  ngOnInit(): void {
    console.log(this.campo);
  }
  inputText: string = '';

  onInputChange(event: any) {
    
    console.log('Texto ingresado:', this.inputText);
    this.inputSubject.next(this.inputText);

  }
  elima(){
    console.log(this.campo);
    this.valor={
      campo:this.campo,
      valor:this.inputText,
      accion:"eliminar"
    }
    this.seleccionado.emit(this.valor);
  }
  onBlur() {
    console.log('El usuario ha dejado de escribir:', this.inputText);
    // Aquí puedes manejar la lógica que necesites cuando el usuario deje de escribir
  }
}
