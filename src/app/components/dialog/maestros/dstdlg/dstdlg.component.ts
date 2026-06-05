import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Provincia } from '../../../modelos/provincia';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dstdlg',
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
  templateUrl: './dstdlg.component.html',
  styleUrl: './dstdlg.component.scss'
})
export class DstdlgComponent implements OnInit {
  formulario?: FormGroup | any = null;
  provincias?: Provincia[]; // Renombrado de 'departamentos' a 'provincias' para ser lógico
  funcion: any;
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DstdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService
  ) {}

  poner_datos() {
    console.log(this.data);
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      valor: this.data.valores.valor,
      provincia_id: this.data.valores.provincia_id,
    });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      valor: ['', Validators.required],
      provincia_id: ['', Validators.required]
    });

    // Cargar las provincias para el select
    this.cgdepr.ponerurl("provincias");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.provincias = data;
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
      provincia_id: this.formulario.value.provincia_id,
    };

    if (this.formulario?.valid) {
      if (this.fnc) {
        this.cgdepr.ponerurl("distritos");
        this.cgdepr.add(body).subscribe({
          next: (data) => {
            console.log("agregado", data);
            Swal.fire({
              title: "Agregado",
              text: "El distrito se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el distrito",
              icon: "error"
            });
          }
        });
      } else {
        this.cgdepr.ponerurl("distritos");
        this.cgdepr.update(body.id, body).subscribe({
          next: (data) => {
            console.log("actualizado", data);
            Swal.fire({
              title: "Actualizado",
              text: "El distrito se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar el distrito",
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