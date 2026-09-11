import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Facultad } from '../../../modelos/facultad';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DepartamentoAcademicoApiService, FacultadApiService } from '../../../../core/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departamentoacaddlg',
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
  templateUrl: './departamentoacaddlg.component.html',
  styleUrl: './departamentoacaddlg.component.scss'
})
export class DepartamentoacaddlgComponent implements OnInit {
  formulario?: FormGroup | any = null;
  facultades?: Facultad[];
  funcion: any;
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DepartamentoacaddlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly facultadApi: FacultadApiService,
    private readonly departamentoAcademicoApi: DepartamentoAcademicoApiService
  ) {}

  poner_datos() {
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      idFacultad: this.data.valores.idFacultad,
    });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      idFacultad: ['', Validators.required]
    });

    // Cargar las facultades para el select
    this.facultadApi.listar().subscribe(data => {
      this.facultades = data;
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
      idFacultad: this.formulario.value.idFacultad,
    };

    if (this.formulario?.valid) {
      if (this.fnc) {
        this.departamentoAcademicoApi.crear(body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Agregado",
              text: "El departamento académico se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el departamento académico",
              icon: "error"
            });
          }
        });
      } else {
        this.departamentoAcademicoApi.actualizar(body.id, body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Actualizado",
              text: "El departamento académico se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar el departamento académico",
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