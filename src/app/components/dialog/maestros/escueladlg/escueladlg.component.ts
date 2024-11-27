import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Facultad } from '../../../modelos/facultad';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-escueladlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './escueladlg.component.html',
  styleUrl: './escueladlg.component.scss'
})
export class EscueladlgComponent {
  formulario?: FormGroup| any= null;
  departamentos?:Facultad[] ;
  funcion:any;
  fnc:boolean=true;
  constructor(public dialogRef: MatDialogRef<EscueladlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      idFacultad: this.data.valores.idFacultad,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      idFacultad: ['', Validators.required]

    });
    this.cgdepr.ponerurl("facultad");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.departamentos=data;
    });
    if(this.data.modo==1){
      this.funcion="Editar";
      this.fnc=false;
      this.poner_datos();

    }else{
      this.funcion="Añadir"
      this.fnc=true;
    }

  }
  onSubmit() {
    let body={
      id:this.formulario.value?.id,
      nombre:this.formulario.value.nombre,
      idFacultad:this.formulario.value.idFacultad,
    }
    this.cgdepr.ponerurl("escuela")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }else{
        this.cgdepr.update(body.id,body).subscribe(data=>{
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }

      this.dialogRef.close(this.formulario.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
