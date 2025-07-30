import { Component, computed, Inject, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Aux1Service } from '../../../../services/aux1.service';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Facultad } from '../../../modelos/facultad';
import { Nacionalidad } from '../../../modelos/nacionalidad';
import { Aux2Service } from '../../../../services/aux2.service';

@Component({
  selector: 'app-infodocenciadlg',
  standalone: true,
  imports: [
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatAutocompleteModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './infodocenciadlg.component.html',
  styleUrl: './infodocenciadlg.component.scss'
})
export class InfodocenciadlgComponent {
  formularioInfo?: FormGroup | any = null;
  //departamentos?: DocenteCurso[];
  funcion: any;
  fnc: boolean = true;
  //cursos?: Curso[];
  categoria_actual = ["PRINCIPAL", "ASOCIADO", "AUXILIAR", "CONTRATADO", "PROFESOR VISITANTE","EMÉRITO","PROFESOR EXTRAORDINARIO","CONTRATADO - EMÉRITO"];
  dedicacion = ["TPA", "TPC", "TC"];
  ingreso = ["Entrevista", "Evaluacion", "Directo"];
  unidades_academicas:Facultad|any=[];
  labor_adminsitrativa=["Si", "No"];
  lugar_dictado=["Lima","Provincia (Dentro del país)","Extranjero"]
  pais_dictado:Nacionalidad|any=[];

  estado = ["Provisionado", "Provisionado asesoría", "Pendiente", "Falta de V°B° JD",
    "Rechazado", "Duplicado", "Desprovisionado", "No provisionado", "Horario Cerrado", "Curso Cerrado", "Cerrado",
    "Cancelado"]
  constructor(public dialogRef: MatDialogRef<InfodocenciadlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service,
    private saux2: Aux2Service,) {



  }
  poner_datos() {
    console.log(this.data);

    this.formularioInfo.setValue({
      id: this.data.valores.id,
      categoria: this.data.valores.categoria,
      dedicacion: this.data.valores.dedicacion,
      inicio_dictado: this.data.valores.inicio_dictado,
      fin_dictado: this.data.valores.fin_dictado,
      modo_ingreso: this.data.valores.modo_ingreso,
      departamento: this.data.valores.departamento,
      lugar_dictado: this.data.valores.lugar_dictado,
      pais_dictado: this.data.valores.pais_dictado,
      dias_extranjero: this.data.valores.dias_extranjero,
      labor_administrativa: this.data.valores.labor_administrativa,
      rol_anterior: this.data.valores.rol_anterior,
      comisiones: this.data.valores.comisiones,
      emision_carne: this.data.valores.emision_carne,
      prestamos: this.data.valores.prestamos,
      sanciones: this.data.valores.sanciones,
      observadap: this.data.valores.observadap,
      historico: this.data.valores.historico,
      felicitacion: this.data.valores.felicitacion,
      codigoDocente: this.data.valores.codigoDocente,
    });
    //this.form.value.id=this.data.valores.id;
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
        this.formularioInfo.get(fieldName)?.setValue(date);
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
      const fechaControl = this.formularioInfo.get(campo);
      fechaControl?.patchValue(fecha);

      // Forzar la actualización del datepicker si es necesario
      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }
  }

  ngOnInit(): void {

    this.formularioInfo = this.formBuilder.group({
      id: [''],
      categoria: [''],
      dedicacion: [''],
      inicio_dictado: [''],
      fin_dictado: [''],
      modo_ingreso: [''],
      departamento: [''],
      lugar_dictado: [''],
      pais_dictado: [''],
      dias_extranjero: [''],
      labor_administrativa: [''],
      rol_anterior: [''],
      comisiones: [''],
      emision_carne: [''],
      prestamos: [''],
      sanciones: [''],
      observadap: [''],
      historico: [''],
      felicitacion: [''],
      codigoDocente: [''],
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
    this.cargar_unidades_academicas();
    this.cargar_nacionalidad();

  }
  poner_codigo() {
    this.formularioInfo.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  cargar_unidades_academicas(){
    this.saux1.ponerurl("facultad");
    this.saux1.get().subscribe(data=>{
      console.log(data);
      this.unidades_academicas=data;
    });

  }
  cargar_nacionalidad(){
    this.saux1.ponerurl("nacionalidad");
    this.saux1.get().subscribe(data=>{
      console.log(data);
      this.pais_dictado=data;
    });
  }

  add_grado() {
    let body = {
      categoria: this.formularioInfo.value?.categoria,
      dedicacion: this.formularioInfo.value?.dedicacion,
      inicio_dictado: new Date(this.formularioInfo.value?.inicio_dictado + 'T00:00:00'),
      fin_dictado: new Date(this.formularioInfo.value?.fin_dictado + 'T00:00:00'),
      modo_ingreso: this.formularioInfo.value?.modo_ingreso,
      departamento: this.formularioInfo.value?.departamento,
      lugar_dictado: this.formularioInfo.value?.lugar_dictado,
      pais_dictado: this.formularioInfo.value?.pais_dictado,
      dias_extranjero: this.formularioInfo.value?.dias_extranjero,
      labor_administrativa: this.formularioInfo.value?.labor_administrativa,
      rol_anterior: this.formularioInfo.value?.rol_anterior,
      comisiones: this.formularioInfo.value?.comisiones,
      emision_carne: new Date(this.formularioInfo.value?.emision_carne + 'T00:00:00'),
      prestamos: this.formularioInfo.value?.prestamos,
      sanciones: this.formularioInfo.value?.sanciones,
      observadap: this.formularioInfo.value?.observadap,
      historico: this.formularioInfo.value?.historico,
      felicitacion: this.formularioInfo.value?.felicitacion,
      codigoDocente: this.formularioInfo.value?.codigoDocente,
    }
    this.cgdepr.ponerurl("docentesinfo")
    if (this.formularioInfo?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioInfo.value);
        })
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioInfo.value);
        })
      }

      this.dialogRef.close(this.formularioInfo.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioInfo?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
