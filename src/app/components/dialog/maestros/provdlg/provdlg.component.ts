import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Departamento } from '../../../modelos/departamento';
import { Provincia } from '../../../modelos/provincia';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './provdlg.component.html',
  styleUrl: './provdlg.component.scss'
})
export class ProvdlgComponent {
  formulario?: FormGroup| any= null;
  departamentos?:Departamento[] ;
  funcion:any;
  fnc:boolean=true;
  constructor(public dialogRef: MatDialogRef<ProvdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      valor: this.data.valores.valor,
      departamento_id: this.data.valores.departamento_id,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      valor: ['', Validators.required],
      departamento_id: ['', Validators.required]

    });
    this.cgdepr.ponerurl("departamentos");
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
      valor:this.formulario.value.valor,
      departamento_id:this.formulario.value.departamento_id,
    }
    this.cgdepr.ponerurl("provincias")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Provincia actualizada",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }else{
        this.cgdepr.update(body.id,body).subscribe(data=>{
          console.log("actualizado");
          Swal.fire({
            title: "Provincia actualizada",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }

      
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
