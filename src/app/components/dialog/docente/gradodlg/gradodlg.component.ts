import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Grado } from '../../../modelos/grado';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gradodlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,

  ],
  templateUrl: './gradodlg.component.html',
  styleUrl: './gradodlg.component.scss'
})
export class GradodlgComponent {
  formularioGrado?: FormGroup| any= null;
  departamentos?:Grado[] ;
  funcion:any;
  fnc:boolean=true;
  grados = ["Bachiller", "Licenciatura","Maestro","Doctor"];
  constructor(public dialogRef: MatDialogRef<GradodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
    this.formularioGrado.setValue({
      id:this.data.valores.id,
      grado: this.data.valores.grado,
      revalidado: this.data.valores.revalidado,
      lugar_obtencion: this.data.valores.lugar_obtencion,
      fecha_obtencion:  this.data.valores.fecha_obtencion,
      codigoDocente:  this.data.valores.codigoDocente,
      profesion:  this.data.valores.profesion,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    console.log(this.data);
    this.formularioGrado = this.formBuilder.group({
      id:[''],
      grado: [''],
      revalidado: [''],
      lugar_obtencion: [''],
      fecha_obtencion:  [''],
      codigoDocente:  [''],
      profesion:  [''],
    });
    this.cgdepr.ponerurl("docentesgrado");
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
      this.poner_codigo();
      this.fnc=true;
    }

  }
  poner_codigo(){
    this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {    
    let body={
      id:this.formularioGrado.value?.id,
      grado: this.formularioGrado.value?.grado,
      revalidado: this.formularioGrado.value?.revalidado,
      lugar_obtencion: this.formularioGrado.value?.lugar_obtencion,
      fecha_obtencion:  this.formularioGrado.value?.fecha_obtencion,
      codigoDocente:  this.formularioGrado.value?.codigoDocente,
      profesion:  this.formularioGrado.value?.profesion,
    }
    this.cgdepr.ponerurl("docentesgrado")
    if (this.formularioGrado?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      }else{
        this.cgdepr.update(body.codigoDocente,body).subscribe(data=>{
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      }

      this.dialogRef.close(this.formularioGrado.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioGrado?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

 

}
