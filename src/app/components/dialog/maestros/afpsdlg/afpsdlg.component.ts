import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Afp } from '../../../modelos/afp';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';
import { Tablas, TipoTablaService } from '../../../../services/tipo-tabla.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-afpsdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatRadioModule,
    MatCheckboxModule
  ],
  templateUrl: './afpsdlg.component.html',
  styleUrl: './afpsdlg.component.scss'
})
export class AfpsdlgComponent {
  formulario?: FormGroup | any = null;
  planes?: Afp[];
  funcion: any;
  fnc: boolean = true;

  private destroy$ = new Subject<void>();
  private readonly TABLA: Tablas = 'AFP';
  datosRecibidos: any;

  constructor(
    public dialogRef: MatDialogRef<AfpsdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private mensajeService: TipoTablaService
  ) {
    this.mensajeService.obtenerCanal(this.TABLA)
      .pipe(
        takeUntil(this.destroy$),
        filter(datos => datos !== null)
      )
      .subscribe(datos => {
        console.log('Datos recibidos en diálogo:', datos);
        this.datosRecibidos = datos;
      });
  }

  poner_datos() {
    console.log(this.data);
    this.formulario.setValue({
      id: this.data.valores.id || '',
      nombre: this.data.valores.nombre || '',
    });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.cgdepr.ponerurl("afps");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.planes = data;
    });

    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    let body = {
      id: this.formulario.value?.id,
      nombre: this.formulario.value.nombre,
    };

    this.cgdepr.ponerurl("afps");

    if (this.formulario?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe({
          next: (data) => {
            console.log("agregado", data);
            Swal.fire({
              title: "Agregado",
              text: "La AFP se ha guardado correctamente",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => {
            console.error("Error al agregar:", error);
            Swal.fire({
              title: "Error",
              text: "Ocurrió un error al guardar la AFP",
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
              text: "La AFP se ha actualizado correctamente",
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => {
            console.error("Error al actualizar:", error);
            Swal.fire({
              title: "Error",
              text: "Ocurrió un error al actualizar la AFP",
              icon: "error"
            });
          }
        });
      }
    } else {
      this.formulario?.markAllAsTouched();
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor complete todos los campos requeridos",
        icon: "warning"
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}