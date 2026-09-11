import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Departamento } from '../../../modelos/departamento';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DepartamentoApiService } from '../../../../core/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dptdlg',
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
  templateUrl: './dptdlg.component.html',
  styleUrl: './dptdlg.component.scss'
})
export class DptdlgComponent implements OnInit {
  formulario!: FormGroup;
  departamentos?: Departamento[];
  funcion: string = 'Añadir';
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DptdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly departamentoApi: DepartamentoApiService
  ) {}

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      valor: ['', Validators.required]
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

  poner_datos() {
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      valor: this.data.valores.valor,
    });
  }

  onSubmit() {
    if (this.formulario?.valid) {
      let body = {
        id: this.formulario.value?.id,
        nombre: this.formulario.value.nombre,
        valor: this.formulario.value.valor
      };

      if (this.fnc) {
        this.departamentoApi.crear(body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Agregado",
              text: "El departamento se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el departamento",
              icon: "error"
            });
          }
        });
      } else {
        this.departamentoApi.actualizar(body.id, body).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Actualizado",
              text: "El departamento se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar el departamento",
              icon: "error"
            });
          }
        });
      }
    } else {
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