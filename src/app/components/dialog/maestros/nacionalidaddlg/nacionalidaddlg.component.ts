import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Nacionalidad } from '../../../modelos/nacionalidad';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nacionalidaddlg',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule, // Necesario para mat-dialog-title, content y actions
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './nacionalidaddlg.component.html',
  styleUrl: './nacionalidaddlg.component.scss'
})
export class NacionalidaddlgComponent implements OnInit {
  formulario!: FormGroup;
  planes?: Nacionalidad[];
  funcion: string = 'Añadir';
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<NacionalidaddlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService
  ) {}

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      pais: ['', Validators.required],
    });

    this.cgdepr.ponerurl("nacionalidad");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.planes = data;
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
    console.log(this.data);
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      pais: this.data.valores.pais,
    });
  }

  onSubmit() {
    if (this.formulario?.valid) {
      let body = {
        id: this.formulario.value?.id,
        nombre: this.formulario.value.nombre,
        pais: this.formulario.value.pais,
      };

      if (this.fnc) {
        this.cgdepr.ponerurl("nacionalidad"); // Ajusta a "nacionalidad/register" si tu API lo requiere
        this.cgdepr.add(body).subscribe({
          next: (data) => {
            console.log("agregado", data);
            Swal.fire({
              title: "Agregado",
              text: "La nacionalidad se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar la nacionalidad",
              icon: "error"
            });
          }
        });
      } else {
        this.cgdepr.ponerurl("nacionalidad");
        this.cgdepr.update(body.id, body).subscribe({
          next: (data) => {
            console.log("actualizado", data);
            Swal.fire({
              title: "Actualizado",
              text: "La nacionalidad se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar la nacionalidad",
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