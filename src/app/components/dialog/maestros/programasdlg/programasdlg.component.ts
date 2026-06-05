import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Programa } from '../../../modelos/programa';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Facultad } from '../../../modelos/facultad';
import { Escuela } from '../../../modelos/escuela';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-programasdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDialogModule // Necesario para mat-dialog-title, content y actions
  ],
  templateUrl: './programasdlg.component.html',
  styleUrl: './programasdlg.component.scss'
})
export class ProgramasdlgComponent {
  formulario?: FormGroup | any = null;
  facultades?: Facultad[];
  escuelas?: Escuela[];
  programas?: Programa[];
  escuelaSelecionada: any;
  funcion: any;
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ProgramasdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService
  ) { }

  async poner_datos() {
    console.log('Datos recibidos:', this.data);

    // Primero, cargar las facultades
    await this.combos();

    // Buscar la facultad seleccionada por ID
    const facultadSeleccionada = this.facultades?.find(f => f.id === this.data.valores.facultad.id);

    if (facultadSeleccionada) {
      // Cargar las escuelas de esa facultad
      this.escuelas = facultadSeleccionada.Escuelas ?? [];

      // Buscar la escuela seleccionada por ID
      const escuelaSeleccionada = this.escuelas.find(e => e.id === this.data.valores.escuela);

      console.log('Facultad encontrada:', facultadSeleccionada);
      console.log('Escuela encontrada:', escuelaSeleccionada);

      // Ahora sí, establecer los valores del formulario
      this.formulario.setValue({
        id: this.data.valores.id,
        facultad: facultadSeleccionada, // Objeto completo (debe coincidir con [value]="facultad")
        escuela: escuelaSeleccionada, // Objeto completo (debe coincidir con [value]="escuela")
        programa: this.data.valores.programa,
        gestor: this.data.valores.gestor,
        director: this.data.valores.director,
        inicio: this.data.valores.inicio,
        fin: this.data.valores.fin,
      });
    }
  }

  async ngOnInit(): Promise<void> {
    this.formulario = this.formBuilder.group({
      id: [''],
      facultad: ['', Validators.required],
      escuela: ['', Validators.required],
      programa: ['', Validators.required],
      gestor: ['', Validators.required],
      director: ['', Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
    });

    if (this.data.modo === 1) {
      this.funcion = "Editar";
      this.fnc = false;
      await this.poner_datos(); // Esperar a que se carguen los datos
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
      await this.combos(); // Solo cargar facultades
    }
  }

  async combos() {
    this.cgdepr.ponerurl("facultad");
    this.facultades = await firstValueFrom(this.cgdepr.get());
    console.log("cmb", this.facultades);
    this.escuelas = [];
  }

  onSubmit() {
    let body = {
      id: this.formulario.value?.id,
      programa: this.formulario.value.programa,
      gestor: this.formulario.value.gestor,
      director: this.formulario.value.director,
      inicio: this.formulario.value.inicio,
      fin: this.formulario.value.fin,
      idEscuela: this.formulario.value.escuela.id,
    };

    if (this.formulario?.valid) {
      this.cgdepr.ponerurl("programa");

      if (this.fnc) {
        this.cgdepr.add(body).subscribe({
          next: (data) => {
            console.log("agregado", data);
            Swal.fire({
              title: "Agregado",
              text: "El programa se agregó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el programa",
              icon: "error"
            });
          }
        });
      } else {
        this.cgdepr.update(body.id, body).subscribe({
          next: (data) => {
            console.log("actualizado", data);
            Swal.fire({
              title: "Actualizado",
              text: "El programa se actualizó correctamente",
              icon: "success"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar el programa",
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

  onCategoryChangeFacultad(event: any) {
    console.log('Facultad seleccionada:', event.value);
    const facultadSeleccionada: any = this.facultades?.find(f => f.id === event.value.id);
    this.escuelas = facultadSeleccionada?.escuelas ?? []; // ✅ Corregido: 'escuelas' en minúscula

    // Limpiar la escuela seleccionada cuando cambia la facultad
    this.formulario.patchValue({
      escuela: ''
    });
  }

  onCategoryChangeEscuela(event: any) {
    this.escuelaSelecionada = event.value;
    console.log('Escuela seleccionada:', this.escuelaSelecionada);
  }
  trackById(index: number, item: any): number {
    return item.id;
  }
}