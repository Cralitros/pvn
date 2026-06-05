import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Laboral } from '../../../modelos/laboral';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-laboraldlg',
  standalone: true,
  imports: [   
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './laboraldlg.component.html',
  styleUrl: './laboraldlg.component.scss'
})
export class LaboraldlgComponent {
  formulario?: FormGroup| any= null;
  departamentos?:Laboral[] ;
  funcion:any;
  fnc:boolean=true;
  tipo_empresa:any=["Público","Privado"];
  docente:any='';
  constructor(public dialogRef: MatDialogRef<LaboraldlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({

      id:this.data.valores.id,
      trabajo: this.data.valores.trabajo,
      cargo_actual: this.data.valores.cargo_actual,
      tipo_empresa: this.data.valores.tipo_empresa,
      direccion_empresa:  this.data.valores.direccion_empresa,
      telefono_empresa:  this.data.valores.telefono_empresa,
      correo_corporativo:  this.data.valores.correo_corporativo,
      correo_personal:  this.data.valores.correo_personal,
      correo_alternativo:  this.data.valores.correo_alternativo,
      contacto: this.data.valores.contacto,
      codigoDocente: this.data.valores.codigoDocente,
      
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    console.log(this.data);
    
    this.formulario = this.formBuilder.group({
      id:[''],
      trabajo: [''],
      cargo_actual: [''],
      tipo_empresa: [''],
      direccion_empresa:  [''],
      telefono_empresa:  [''],
      correo_corporativo:  [''],
      correo_personal:  [''],
      correo_alternativo:  [''],
      contacto: [''],
      codigoDocente: [''],

    });
    this.cgdepr.ponerurl("docenteslaboral");
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
    this.formulario.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  onSubmit() {
    let body={
      id:this.formulario.value?.id,
      trabajo: this.formulario.value?.trabajo,
      cargo_actual: this.formulario.value?.cargo_actual,
      tipo_empresa: this.formulario.value?.tipo_empresa,
      direccion_empresa:  this.formulario.value?.direccion_empresa,
      telefono_empresa:  this.formulario.value?.telefono_empresa,
      correo_corporativo:  this.formulario.value?.correo_corporativo,
      correo_personal:  this.formulario.value?.correo_personal,
      correo_alternativo:  this.formulario.value?.correo_alternativo,
      contacto: this.formulario.value?.contacto,
      codigoDocente: this.formulario.value?.codigoDocente
    }
    this.cgdepr.ponerurl("docenteslaboral")
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
        this.cgdepr.update(body.codigoDocente,body).subscribe(data=>{
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
  verificarInfo(data:any){
    //console.log(data);
    if(data!=undefined){
      console.log(data);
      
      return  `${data.nombres} ${data.apellidos}`
    }
    else{
      console.log("data");
      return "";
    }
    
  }
}
