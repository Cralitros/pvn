import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Departamento } from '../../../modelos/departamento';
import { Provincia } from '../../../modelos/provincia';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DepartamentoApiService, ProvinciaApiService } from '../../../../core/api';
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
    MatSelectModule,
    MatDialogModule // Necesario para mat-dialog-title, content y actions
  ],
  templateUrl: './provdlg.component.html',
  styleUrl: './provdlg.component.scss'
})
export class ProvdlgComponent implements OnInit {
  formulario?: FormGroup | any = null;
  departamentos?: Departamento[];
  funcion: any;
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ProvdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly departamentoApi: DepartamentoApiService,
    private readonly provinciaApi: ProvinciaApiService
  ) {}

  poner_datos() {
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      valor: this.data.valores.valor,
      departamento_id: this.data.valores.departamento_id,
    });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      valor: ['', Validators.required],
      departamento_id: ['', Validators.required]
    });

    this.departamentoApi.listar().subscribe(data => {
      this.departamentos = data;
    });

    if (this.data?.modo === 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
  }

  onSubmit() {
    let body = {
      id: this.formulario.value?.id,
      nombre: this.formulario.value.nombre,
      valor: this.formulario.value.valor,
      departamento_id: this.formulario.value.departamento_id,
    };

    if (this.formulario?.valid) {
      if (this.fnc === true) {
        this.provinciaApi.crear(body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Agregado",
              text: "La provincia se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar la provincia",
              icon: "error"
            });
          }
        });
      } else {
        this.provinciaApi.actualizar(body.id, body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Actualizado",
              text: "La provincia se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar la provincia",
              icon: "error"
            });
          }
        });
      }
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor, revise los campos marcados en rojo",
        icon: "warning"
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}