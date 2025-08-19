import { Component, computed, Inject, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  rol_anterior = ["Asesoria", "De baja", "Extension", "Egresado", "Externo", "Jefe de práctica", "Otro departamento", "Profesr visitante"]
  comisiones=["C. Seguimiento Docente","C. Investigación","C. Internacionalización","C. Responsabilidad Social Universitaria"]
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
      id: this.validar_datos(this.data.valores.id),
      categoria: this.validar_datos(this.data.valores.categoria),
      dedicacion: this.validar_datos(this.data.valores.dedicacion),
      inicio_dictado: this.validar_datos(this.data.valores.inicio_dictado),
      fin_dictado: this.validar_datos(this.data.valores.fin_dictado),
      modo_ingreso: this.validar_datos(this.data.valores.modo_ingreso),
      departamento: this.validar_datos(this.data.valores.departamento),
      lugar_dictado: this.validar_datos(this.data.valores.lugar_dictado),
      pais_dictado: this.validar_datos(this.data.valores.pais_dictado),
      dias_extranjero: this.validar_datos(this.data.valores.dias_extranjero),
      labor_administrativa: this.validar_datos(this.data.valores.labor_administrativa),
      rol_anterior: this.validar_datos(this.data.valores.rol_anterior),
      comisiones: this.validar_datos(this.data.valores.comisiones),
      emision_carne: this.validar_datos(this.data.valores.emision_carne),
      prestamos: this.validar_datos(this.data.valores.prestamos),
      sanciones: this.validar_datos(this.data.valores.sanciones),
      observadap: this.validar_datos(this.data.valores.observadap),
      historico: this.validar_datos(this.data.valores.historico),
      felicitacion: this.validar_datos(this.data.valores.felicitacion),
      codigoDocente: this.validar_datos(this.data.valores.codigoDocente),
      semestre:this.validar_datos(this.data.valores.semestre)
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
      inicio_dictado: ['',Validators.required],
      fin_dictado: ['',Validators.required],
      modo_ingreso: [''],
      departamento: [''],
      lugar_dictado: [''],
      pais_dictado: [''],
      dias_extranjero: [''],
      labor_administrativa: [''],
      rol_anterior: [''],
      comisiones: [''],
      emision_carne: ['',Validators.required],
      prestamos: [''],
      sanciones: [''],
      observadap: [''],
      historico: [''],
      felicitacion: [''],
      codigoDocente: [''],
      semestre:['']
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
      categoria: this.validar_datos(this.formularioInfo.value?.categoria),
      dedicacion: this.validar_datos(this.formularioInfo.value?.dedicacion),
      inicio_dictado: this.validar_datos(this.formularioInfo.value?.inicio_dictado),
      fin_dictado: this.validar_datos(this.formularioInfo.value?.fin_dictado),
      modo_ingreso: this.validar_datos(this.formularioInfo.value?.modo_ingreso),
      departamento: this.validar_datos(this.formularioInfo.value?.departamento),
      lugar_dictado: this.validar_datos(this.formularioInfo.value?.lugar_dictado),
      pais_dictado: this.validar_datos(this.formularioInfo.value?.pais_dictado),
      dias_extranjero: this.validar_datos(this.formularioInfo.value?.dias_extranjero),
      labor_administrativa: this.validar_datos(this.formularioInfo.value?.labor_administrativa),
      rol_anterior: this.validar_datos(this.formularioInfo.value?.rol_anterior),
      comisiones: this.validar_datos(this.formularioInfo.value?.comisiones),
      emision_carne: this.validar_datos(this.formularioInfo.value?.emision_carne),
      prestamos: this.validar_datos(this.formularioInfo.value?.prestamos),
      sanciones: this.validar_datos(this.formularioInfo.value?.sanciones),
      observadap: this.validar_datos(this.formularioInfo.value?.observadap),
      historico: this.validar_datos(this.formularioInfo.value?.historico),
      felicitacion: this.validar_datos(this.formularioInfo.value?.felicitacion),
      codigoDocente: this.validar_datos(this.formularioInfo.value?.codigoDocente),
      semestre:this.validar_datos(this.formularioInfo.value?.semestre)
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

  verificarInfo(data:any){
    //console.log(data);
    if(data!=undefined){
      console.log(data);
      
      return  `${data.nombres} ${data.apellidos}`
    }
    else{
      console.log("data");
      return "";
    }
    
  }
  validar_datos(data:any){
     if(data!=undefined){
      return data;
     }
     return "";
  }
}
