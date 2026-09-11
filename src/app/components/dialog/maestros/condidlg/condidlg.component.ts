import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Condiciones } from '../../../modelos/condiciones';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoriaApiService } from '../../../../core/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-condidlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './condidlg.component.html',
  styleUrl: './condidlg.component.scss'
})
export class CondidlgComponent {
  formulario?: FormGroup| any= null;
  departamentos?:Condiciones[] ;
  funcion:any;
  fnc:boolean=true;
  constructor(public dialogRef: MatDialogRef<CondidlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly categoriaApi: CategoriaApiService){
      
      
      
  }
  poner_datos(){
    this.formulario.setValue({
      id: this.data.valores.id,
      condicion: this.data.valores.condicion,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      condicion: ['', Validators.required],
    });
    this.categoriaApi.listar().subscribe(data=>{
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
      condicion:this.formulario.value.condicion,
    }
    if (this.formulario?.valid) {
      // El diálogo se cierra SÓLO cuando el guardado termina. Antes cerraba aquí
      // mismo, sin esperar a la API ni avisar del resultado: el listado recargaba
      // con datos viejos y los errores pasaban desapercibidos.
      if (this.fnc == true) {
        this.categoriaApi.crear(body).subscribe({
          next: () => {
            Swal.fire({ title: 'Agregado', text: 'Continuar', icon: 'info' });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      } else {
        this.categoriaApi.actualizar(body.id, body).subscribe({
          next: () => {
            Swal.fire({ title: 'Actualizado', text: 'Continuar', icon: 'info' });
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

}
