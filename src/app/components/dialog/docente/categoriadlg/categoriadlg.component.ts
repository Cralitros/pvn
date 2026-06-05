import { CommonModule } from '@angular/common';
import { Component, computed, inject, Inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Categoria } from '../../../modelos/categoria';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Condiciones } from '../../../modelos/condiciones';
import { Aux1Service } from '../../../../services/aux1.service';
import Swal from 'sweetalert2';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-categoriadlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
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
    MatCheckboxModule,
    MatTabsModule,
    MatRadioModule,
    MatCheckboxModule,
  ],
  templateUrl: './categoriadlg.component.html',
  styleUrl: './categoriadlg.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' }, // Opcional: configura localidad
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },

  ]
})
export class CategoriadlgComponent {
  formularioCategoria?: FormGroup | any = null;
  formularioHistorico?: FormGroup | any = null;
  departamentos?: Categoria[];
  condiciones?: Condiciones[];
  funcion: any;
  fnc: boolean = true;
  //categorias = ["Principal", "Asociado","Auxiliar","Contratado","Profesor visitante","Instructor","Jefe de prácticas"];
  tipos = ["Nuevo", "Reincorporado", "Regular", "Otro departamento"];
  dedicacion = ["TC", "TPA", "TPC"];
  lab = ["Si", "No"];
  categoriasdap = ["Ordinario", "Contratado", "Extraordinario", "Honoris Causa", "Honorarios", 'No aplica'];
  condicionesdap = ["Activo", "Inactivo"];
  extraordinarios: string[] = ['Emérito', 'Tenure Track', 'Visitante'];
  inactivos: string[] = ['Jubildado', 'Fallecido', 'Renuncia'];
  ratificado: string[] = ['Ratificado', 'No ratificado'];
  tipoRatificado: string[] = ['Desempeño Academico', 'Investigación', 'Desempeño administrativo', 'Capacitación continua', 'No aplica'];
  bloqueadorg1 = true;
  bloqueadorg2 = true;

  cateJubilacion = ['Principal', 'Asociado', 'Auxiliar', 'Contratado'];


  categorias = [
    { nombre: 'Principal', seleccionada: false, fecha: null },
    { nombre: 'Asociado', seleccionada: false, fecha: null },
    { nombre: 'Auxiliar', seleccionada: false, fecha: null },
    { nombre: 'Contratado', seleccionada: false, fecha: null },
    { nombre: 'Profesor visitante', seleccionada: false, fecha: null },
    { nombre: 'Instructor', seleccionada: false, fecha: null },
    { nombre: 'Jefe de prácticas', seleccionada: false, fecha: null },
    { nombre: 'Ayudante de docencia', seleccionada: false, fecha: null },
    { nombre: 'Asistente de docencia', seleccionada: false, fecha: null },
  ];

  trackByNombre(index: number, item: any) {
    return item.nombre;
  }

  toppings = new FormControl<string[]>([]);

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    if (this._locale() === 'ja-JP') {
      return 'YYYY/MM/DD';
    } else if (this._locale() === 'es-Es') {
      return 'DD/MM/YYYY';
    }
    return '';
  });

  constructor(public dialogRef: MatDialogRef<CategoriadlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service) {

    //this.selectedCategory2=true;

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
      let fechaControl;
      if (campo == 'Principal') {
        let grupo = this.formularioCategoria.get("categoria") as FormGroup;
        console.log(grupo);
        //console.log(grupo);
        // 2. Obtener el control específico de "Principal"
        const controlPrincipal = grupo.value;
        console.log(controlPrincipal);
        console.log(controlPrincipal[0]);
        controlPrincipal[0].fecha = '2025-04-16T05:00:00.000Z'
        fechaControl = grupo.get('0')?.value;
        console.log(fechaControl);

      } else {
        fechaControl = this.formularioCategoria.get(campo);
      }
      fechaControl?.patchValue(fecha);

      // Forzar la actualización del datepicker si es necesario
      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }
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
        this.formularioCategoria.get(fieldName)?.setValue(date);
      }
    }
  }
  poner_datos() {
    console.log(this.data);
    let g1 = "";
    let d1 = "";
    let g2 = "";
    let d2 = "";
    let arr1 = this.data.valores.categoriadap.split('-');
    let arr2 = this.data.valores.condiciondap.split('-');
    if (arr1.length > 1) {
      d1 = arr1[0];
      g1 = arr1[1];

    } else {
      d1 = this.data.valores.categoriadap;
      g1 = "";
    }

    if (arr2.length > 1) {
      d2 = arr2[0];
      g2 = arr2[1];

    } else {
      d2 = this.data.valores.condiciondap;
      g2 = "";
    }
    let ratificado = JSON.parse(this.data.valores.ratificado);
    this.formularioCategoria.setValue({
      id: this.data.valores.id,
      tipo: this.data.valores.tipo,
      fecha: new Date(this.data.valores.fecha),
      categoria: JSON.parse(this.data.valores.categoria),
      condiciondap: d2,
      codigoDocente: this.data.valores.codigoDocente,
      dedicacion: this.data.valores.dedicacion,
      labor: this.data.valores.labor,
      categoriadap: d1,
      rg1: g1,
      rg2: g2,
      ratificado: ratificado.ratificado,
      chk1: ratificado.chk1,
      chk2: ratificado.chk2,
      chk3: ratificado.chk3,
      chk4: ratificado.chk4,
      chk5: ratificado.chk5,
    });

    this.formularioHistorico.setValue({
      jefepractica: this.data.valores.jefepractica,
      ayudante: this.data.valores.ayudante,
      asistente: this.data.valores.asistente,
      instructor: this.data.valores.instructor,
      profesorvisitante: this.data.valores.profesorvisitante,
      contratado: this.data.valores.contratado,
      auxiliar: this.data.valores.auxiliar,
      principal: this.data.valores.principal,
      asociado: this.data.valores.asociado,

      dedicacionJubilacion: this.data.valores.dedicacionJubilacion,
      categoriaJubilacion: this.data.valores.categoriaJubilacion,
    });

    let event = { value: ratificado.ratificado }
    this.categorias = JSON.parse(this.data.valores.categoria);
    this.onCategoryChangeRatificado(event);
    //this.form.value.id=this.data.valores.id;

  }

  get selectedOptions() {
    return Object.keys(this.formularioCategoria.get('ratificadobx')?.value || {}).filter(key => this.formularioCategoria.get('ratificadobx')?.value[key]);
  }

  ngOnInit(): void {
    console.log(this.data);
    this.formularioCategoria = this.formBuilder.group({
      id: [''],
      tipo: [''],
      fecha: [''],
      categoria: [''],
      condiciondap: [''],
      codigoDocente: [''],
      dedicacion: [''],
      labor: [''],
      categoriadap: [''],
      rg1: [''],
      rg2: [''],
      ratificado: [''],
      chk1: [''],
      chk2: [''],
      chk3: [''],
      chk4: [''],
      chk5: [''],

    });

    this.formularioHistorico = this.formBuilder.group({
      jefepractica: [''],
      ayudante: [''],
      asistente: [''],
      instructor: [''],
      profesorvisitante: [''],
      contratado: [''],
      auxiliar: [''],
      asociado: [''],
      principal: [''],
      categoriaJubilacion: [''],
      dedicacionJubilacion: [''],

    });
    /*this.saux1.ponerurl("categoria");
    this.saux1.get().subscribe(data => {
      this.condiciones = data;
    })*/

    // ✅ NUEVO: Cada vez que cambie CUALQUIER fecha en el histórico, recalculamos la fecha contrato
    this.formularioHistorico.valueChanges.subscribe(() => {
      this.actualizarFechaContrato();
    });

    this.cgdepr.ponerurl("docentescategoria");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.departamentos = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
      // Llamamos una vez al cargar datos editados para establecer la fecha inicial
      this.actualizarFechaContrato();

    } else {
      this.funcion = "Añadir"
      this.poner_codigo();
      this.fnc = true;
    }

    /* if(this.data.valores.categoriadap=="Extraordinario"){
       this.formularioCategoria.get('rg1')?.enable();
       this.selectedCategory="Extraordinario";
     }else{
       this.selectedCategory=this.data.valores.categoriadap;
       this.formularioCategoria.get('rg1')?.disable();
 
     }
 
     if(this.data.valores.condiciondap=="Inactivo"){
       this.formularioCategoria.get('rg2')?.enable();
       this.selectedCategory2="Inactivo";
     }else{
       this.formularioCategoria.get('rg2')?.disable();
       this.selectedCategory2=this.data.valores.condiciondap;
     }*/

  }
  poner_codigo() {
    this.formularioCategoria.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {
    let categ = this.categorias;
    console.log(this.formularioCategoria.value);
    let ratificado = {
      ratificado: this.formularioCategoria.value?.ratificado,
      chk1: this.formularioCategoria.value?.chk1 == undefined || this.formularioCategoria.value?.chk1 == "" ? false : this.formularioCategoria.value?.chk1,
      chk2: this.formularioCategoria.value?.chk2 == undefined || this.formularioCategoria.value?.chk2 == "" ? false : this.formularioCategoria.value?.chk2,
      chk3: this.formularioCategoria.value?.chk3 == undefined || this.formularioCategoria.value?.chk3 == "" ? false : this.formularioCategoria.value?.chk3,
      chk4: this.formularioCategoria.value?.chk4 == undefined || this.formularioCategoria.value?.chk4 == "" ? false : this.formularioCategoria.value?.chk4,
      chk5: this.formularioCategoria.value?.chk5 == undefined || this.formularioCategoria.value?.chk5 == "" ? false : this.formularioCategoria.value?.chk5,
    }

    let ratificadoString = JSON.stringify(ratificado);

    let body = {
      id: this.formularioCategoria.value?.id,
      tipo: this.formularioCategoria.value?.tipo,
      fecha: this.formularioCategoria.value?.fecha,
      categoria: JSON.stringify(this.categorias),
      condiciondap: this.formularioCategoria.value?.condiciondap,
      codigoDocente: this.formularioCategoria.value?.codigoDocente,
      dedicacion: this.formularioCategoria.value?.dedicacion,
      labor: this.formularioCategoria.value?.labor,
      categoriadap: this.formularioCategoria.value?.categoriadap,
      ratificado: ratificadoString,
      hContratado: this.formularioHistorico.value?.contratado,
      hAuxiliar: this.formularioHistorico.value?.auxiliar,
      hPrincipal: this.formularioHistorico.value?.principal,
      hAsociado: this.formularioHistorico.value?.asociado,
      hProfesorVisita: this.formularioHistorico.value?.profesorvisitante,
      hInstructor: this.formularioHistorico.value?.instructor,
      hJefePract: this.formularioHistorico.value?.jefepractica,
      hAyudante: this.formularioHistorico.value?.ayudante,
      hAsistente: this.formularioHistorico.value?.asistente,
      dedicacionJubilacion: this.formularioHistorico.value?.dedicacionJubilacion,
      categoriaJubilacion: this.formularioHistorico.value?.categoriaJubilacion,
    }
    console.log(body);
    if (body.categoriadap == 'Extraordinario') {
      body.categoriadap = `Extraordinario-${this.formularioCategoria.value?.rg1}`
    }
    if (body.condiciondap == 'Inactivo') {
      body.condiciondap = `Inactivo-${this.formularioCategoria.value?.rg2}`
    }
    console.log(body);

    this.cgdepr.ponerurl("docentescategoria")
    if (this.formularioCategoria?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioCategoria.value);
        })
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioCategoria.value);
        })
      }

      this.dialogRef.close(this.formularioCategoria.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioCategoria?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  selectedCategory = '';
  selectedCategory2 = '';
  onCategoryChange(event: any) {
    this.selectedCategory = event.value;
    if (this.selectedCategory == "Extraordinario") {
      this.formularioCategoria.get('rg1')?.enable();
      this.selectedCategory = "Extraordinario";
    } else {
      this.selectedCategory = this.data.valores.categoriadap;
      this.formularioCategoria.get('rg1')?.disable();

    }

  }
  onCategoryChange2(event: any) {
    /* this.selectedCategory2 = event.value;   
     console.log(this.selectedCategory2);
     
     if(this.selectedCategory2=="Inactivo"){
       this.formularioCategoria.get('rg2')?.enable();
       this.selectedCategory2="Inactivo";
     }else{
       this.formularioCategoria.get('rg2')?.disable();
       this.selectedCategory2=this.data.valores.condiciondap;
     }*/

  }
  selectedCategory3: any;
  onCategoryChangeRatificado(event: any) {
    /* this.selectedCategory3 = event.value;  
     if(this.selectedCategory3=="Ratificado"){
       this.formularioCategoria.get('chk1')?.enable();
       this.formularioCategoria.get('chk2')?.enable();
       this.formularioCategoria.get('chk3')?.enable();
       this.formularioCategoria.get('chk4')?.enable();
       this.formularioCategoria.get('chk5')?.enable();
       //this.selectedCategory3="Inactivo";
     }else{
       this.formularioCategoria.get('chk1')?.disable();
       this.formularioCategoria.get('chk2')?.disable();
       this.formularioCategoria.get('chk3')?.disable();
       this.formularioCategoria.get('chk4')?.disable();
       this.formularioCategoria.get('chk5')?.disable();
     }*/

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

  /**
 * Calcula la fecha más reciente de todos los campos del histórico
 * y actualiza la Fecha Contrato automáticamente.
 */
  actualizarFechaContrato() {
    if (!this.formularioHistorico) return;

    const historico = this.formularioHistorico.value;

    // Lista de todas las fechas que vienen del histórico
    const fechasPosibles = [
      historico.jefepractica,
      historico.ayudante,
      historico.asistente,
      historico.instructor,
      historico.profesorvisitante,
      historico.contratado,
      historico.auxiliar,
      historico.asociado,
      historico.principal
    ];

    // Filtramos nulos/vacíos y convertimos a objetos Date reales
    const fechasValidas: Date[] = [];

    fechasPosibles.forEach(fecha => {
      if (fecha) {
        const d = new Date(fecha);
        if (!isNaN(d.getTime())) { // Verificamos que sea fecha válida
          fechasValidas.push(d);
        }
      }
    });

    // Si no hay fechas, dejamos nulo
    if (fechasValidas.length === 0) {
      this.formularioCategoria.get('fecha')?.setValue(null);
      return;
    }

    // Buscamos la fecha mayor (más reciente)
    // Ordenamos descendente y tomamos la primera
    fechasValidas.sort((a, b) => b.getTime() - a.getTime());

    this.formularioCategoria.get('fecha')?.setValue(fechasValidas[0]);
  }
}
