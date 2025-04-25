import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { logins } from '../../../modelos/usuario';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuariosdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatRadioModule  
  ],
  templateUrl: './usuariosdlg.component.html',
  styleUrl: './usuariosdlg.component.scss'
})
export class UsuariosdlgComponent {
  formulario?: FormGroup| any= null;
  usuarios?:logins[] ;
  funcion:any;
  fnc:boolean=true;
  nivel:any[]=[
    {"nivel":1,"descripcion":"Acceso total"},
    {"nivel":2,"descripcion":
      "-Acceso a Tablas en general.\n"+
      "-Acceso a Reportes"},
    {"nivel":3,"descripcion":
      "-Acceso a Reportes.\n"},
  ];
  cargos: { [key: string]: string } = {
    "1": "Jefe departamento",
    "2": "Secretaria",
  };
  rol:any[]=["Administrador","Data entry","Lector"];
  constructor(public dialogRef: MatDialogRef<UsuariosdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){      
  }

  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({
      id: this.data.valores.id,
      dni: this.data.valores.dni,
      nivel: Number(this.data.valores.nivel),
      rol: this.data.valores.rol,
      nombres: this.data.valores.nombres,
      apellidos: this.data.valores.apellidos,
      email: this.data.valores.email,
      cargo: this.data.valores.cargo,
      password:""
    });
    //this.form.value.id=this.data.valores.id;
  }
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      dni: ['', Validators.required],
      password: ['', Validators.required],
      nivel: ['', Validators.required],
      rol: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', Validators.required],
      cargo: ['', Validators.required],

    });
    this.cgdepr.ponerurl("login");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.usuarios=data;
    });
    if(this.data.modo==1){
      this.funcion="Editar";
      this.fnc=false;
      this.poner_datos();
      this.formulario.get('password')?.clearValidators();

    }else{
      this.funcion="Añadir"
      this.fnc=true;
    }

  }
  async onSubmit() {
    let body={
      id:this.formulario.value?.id,
      dni:this.formulario.value.dni,
      password:this.formulario.value.password,
      nivel:this.formulario.value.nivel,
      rol: this.formulario.value.rol,
      nombres: this.formulario.value.nombres,
      apellidos: this.formulario.value.apellidos,
      email: this.formulario.value.email,
      cargo: this.formulario.value.cargo,
    }
    this.cgdepr.ponerurl("login")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.ponerurl("login/register")
        await this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Usuario agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }else{
        await this.cgdepr.update(body.id,body).subscribe(data=>{
          console.log("actualizado");
          Swal.fire({
            title: "Usuario actualizado",
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
