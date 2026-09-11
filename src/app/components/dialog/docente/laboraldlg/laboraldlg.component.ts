import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Laboral } from '../../../modelos/laboral';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocenteLaboralApiService } from '../../../../core/api';
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
    private readonly docenteLaboralApi: DocenteLaboralApiService){
      
      
      
  }
  poner_datos(){
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
    this.docenteLaboralApi.listar().subscribe(data=>{
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
    if (this.formulario?.valid) {
      // El diálogo se cierra SÓLO cuando el guardado ha terminado. Antes había un
      // `close()` aquí fuera: se cerraba antes de que respondiera la API, el
      // listado recargaba y todavía no veía el registro nuevo.
      if (this.fnc == true) {
        this.docenteLaboralApi.crear(body).subscribe({
          next: () => {
            Swal.fire({
              title: "Agregado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      } else {
        this.docenteLaboralApi.actualizar(body.codigoDocente, body).subscribe({
          next: () => {
            Swal.fire({
              title: "Actualizado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      }
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
    }
  }
  /** Aviso común si el guardado falla: el diálogo se queda abierto para reintentar. */
  private mostrarErrorAlGuardar(error: unknown): void {
    console.error('Error al guardar:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar. Inténtalo de nuevo.',
      icon: 'error'
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  verificarInfo(data:any){
    //console.log(data);
    if(data!=undefined){
      return  `${data.nombres} ${data.apellidos}`
    }
    else{
      return "";
    }
    
  }
}
