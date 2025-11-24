import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DocenteCurso } from '../../../modelos/docentecurso';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Curso } from '../../../modelos/cursos';
import { Aux1Service } from '../../../../services/aux1.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-docentecursodlg',
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
  ],
  templateUrl: './docentecursodlg.component.html',
  styleUrl: './docentecursodlg.component.scss'
})
export class DocentecursodlgComponent {
  formularioGrado?: FormGroup | any = null;
  departamentos?: DocenteCurso[];
  funcion: any;
  fnc: boolean = true;
  cursos?: Curso[];
  modalidad = ["Presencial", "Semipresencial", "Virtual", "A distancia", "Práctica"];
  tipo = ["Clase", "Asesoría", "Práctica", "Taller"];
  tipo_clase = ["Regular", "Compartida", "Codictado"];
  estado = ["Provisionado", "Provisionado asesoría", "Pendiente", "Falta de V°B° JD",
    "Rechazado", "Duplicado", "Desprovisionado", "No provisionado", "Horario Cerrado", "Curso Cerrado", "Cerrado",
    "Cancelado"]
  constructor(public dialogRef: MatDialogRef<DocentecursodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service) {



  }
  poner_datos() {
    console.log(this.data);


    this.formularioGrado.setValue({
      id: this.data.valores.id,
      fecha_inicio: this.data.valores.fecha_inicio,
      fecha_fin: this.data.valores.fecha_fin,
      codigoCurso: this.data.valores.codigoCurso,
      codigoDocente: this.data.valores.codigoDocente,
      modalidad: this.data.valores.modalidad,
      tipo: this.data.valores.tipo,
      tipo_clase: this.data.valores.tipo_clase,
      estado: this.data.valores.estado,
      horas_semana: this.data.valores.horas_semana,
      horario: this.data.valores.horario,

    });
    //this.form.value.id=this.data.valores.id;
  }
  onCursoSeleccionado(codigoCurso: string | null): void {
    this.formularioGrado.patchValue({
      codigoCurso: codigoCurso || ''
    });
  }
  onDateInput(event: any, fieldName: string) {
    const value = event.target.value;
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const matches = value.match(datePattern);

    if (matches) {
      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const year = parseInt(matches[3], 10);
      const date = new Date(year, month, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        this.formularioGrado.get(fieldName)?.setValue(date);
      }
    }
  }
  onPaste(event: ClipboardEvent, campo: string) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';

    // Limpiar el texto pegado (eliminar espacios, caracteres no numéricos)
    const cleanText = pastedText.replace(/[^\d]/g, '');

    let fecha: Date | null = null;

    // Caso 1: DDMMYYYY (8 dígitos)
    if (cleanText.length === 8) {
      const day = parseInt(cleanText.substring(0, 2), 10);
      const month = parseInt(cleanText.substring(2, 4), 10) - 1; // mesIndex: 0-11
      const year = parseInt(cleanText.substring(4, 8), 10);
      fecha = new Date(year, month, day);
    }
    // Caso 2: DD/MM/YYYY
    else if (pastedText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dayStr, monthStr, yearStr] = pastedText.split('/');
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);
      fecha = new Date(year, month, day);
    }

    console.log(fecha); // Para verificar en consola

    if (fecha) {
      const fechaControl = this.formularioGrado.get(campo);
      fechaControl?.patchValue(fecha);

      // Forzar la actualización del datepicker si es necesario
      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }
  }

  ngOnInit(): void {
    console.log(this.data);

    this.saux1.ponerurl("curso");
    this.saux1.get().subscribe(data => {
      console.log(data);

      this.cursos = data;
    })

    this.formularioGrado = this.formBuilder.group({
      id: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      codigoCurso: [''],
      codigoDocente: [''],
      modalidad: [''],
      tipo: [''],
      tipo_clase: [''],
      estado: [''],
      horas_semana: [''],
      horario: [''],

    });
    this.cgdepr.ponerurl("docentescurso");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.departamentos = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.poner_codigo();
      this.fnc = true;
    }

  }
  poner_codigo() {
    this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {
    let body = {
      id: this.formularioGrado.value?.id,
      fecha_inicio: new Date(this.formularioGrado.value?.fecha_inicio),
      fecha_fin: new Date(this.formularioGrado.value?.fecha_fin),
      codigoCurso: this.formularioGrado.value?.codigoCurso,
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      modalidad: this.formularioGrado.value?.modalidad,
      tipo: this.formularioGrado.value?.tipo,
      tipo_clase: this.formularioGrado.value?.tipo_clase,
      estado: this.formularioGrado.value?.estado,
      horas_semana: this.formularioGrado.value?.horas_semana,
      horario: this.formularioGrado.value?.horario,
    }
    this.cgdepr.ponerurl("docentescurso")
    if (this.formularioGrado?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      }

      this.dialogRef.close(this.formularioGrado.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioGrado?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }


  verificarInfo(data: any) {
    //console.log(data);
    if (data != undefined) {
      console.log(data);

      return `${data.nombres} ${data.apellidos}`
    }
    else {
      console.log("data");
      return "";
    }

  }
}
