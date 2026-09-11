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
import { AscensoCategoria, Categoria } from '../../../modelos/categoria';
import {
  ascensosDesdeColumnas,
  CATEGORIAS_ASCENSO,
  derivarColumnasHistorico,
  fechaMasReciente,
  parsearCategoria,
} from './ascensos.util';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocenteCategoriaApiService } from '../../../../core/api';
import { Condiciones } from '../../../modelos/condiciones';
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


  /** Categorías que se pueden registrar en el histórico de ascensos. */
  readonly catalogoAscensos = CATEGORIAS_ASCENSO;

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
    private readonly docenteCategoriaApi: DocenteCategoriaApiService) {

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

    if (fecha) {
      let fechaControl;
      if (campo == 'Principal') {
        let grupo = this.formularioCategoria.get("categoria") as FormGroup;
        //console.log(grupo);
        // 2. Obtener el control específico de "Principal"
        const controlPrincipal = grupo.value;
        controlPrincipal[0].fecha = '2025-04-16T05:00:00.000Z'
        fechaControl = grupo.get('0')?.value;

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
  poner_datos() {
    let g1 = "";
    let d1 = "";
    let g2 = "";
    let d2 = "";
    let arr1 = (this.data.valores.categoriadap ?? '').split('-');
    let arr2 = (this.data.valores.condiciondap ?? '').split('-');
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
    let ratificado = this.parsearJson(this.data.valores.ratificado);
    this.formularioCategoria.setValue({
      id: this.data.valores.id,
      tipo: this.data.valores.tipo,
      fecha: new Date(this.data.valores.fecha),
      categoria: parsearCategoria(this.data.valores.categoria),
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

    this.formularioHistorico.patchValue({
      dedicacionJubilacion: this.data.valores.dedicacionJubilacion,
      categoriaJubilacion: this.data.valores.categoriaJubilacion,
    });

    // Las filas del histórico vienen de la lista JSON guardada en `categoria`.
    this.cargarAscensos();

    let event = { value: ratificado.ratificado }
    this.onCategoryChangeRatificado(event);
    //this.form.value.id=this.data.valores.id;

  }

  get selectedOptions() {
    return Object.keys(this.formularioCategoria.get('ratificadobx')?.value || {}).filter(key => this.formularioCategoria.get('ratificadobx')?.value[key]);
  }

  ngOnInit(): void {
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
      // Filas dinámicas del histórico: cada fila es { categoría, fecha }.
      ascensos: this.formBuilder.array([]),
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

    this.docenteCategoriaApi.listar().subscribe(data => {
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
  // ─── Histórico de ascensos (filas dinámicas) ─────────────────────────────────

  get ascensosArray(): FormArray {
    return this.formularioHistorico.get('ascensos') as FormArray;
  }

  /** Añade una fila al histórico. Sin argumentos crea una fila vacía. */
  agregarFilaAscenso(datos?: AscensoCategoria | null): void {
    this.ascensosArray.push(this.formBuilder.group({
      nombre: [datos?.nombre ?? ''],
      fecha: [datos?.fecha ? new Date(datos.fecha) : ''],
    }));
  }

  eliminarFilaAscenso(index: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el ascenso de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ascensosArray.removeAt(index);
      }
    });
  }

  /** `JSON.parse` tolerante: devuelve `{}` si el valor viene vacío o corrupto. */
  private parsearJson(valor: unknown): any {
    if (typeof valor !== 'string' || valor.trim() === '') {
      return {};
    }

    try {
      return JSON.parse(valor);
    } catch {
      console.error('No se pudo interpretar un campo JSON del registro:', valor);
      return {};
    }
  }

  /**
   * Rellena las filas del histórico al abrir el diálogo en modo edición.
   *
   * Primero usa la lista guardada en `categoria`. Si el registro es anterior a
   * este cambio (la lista llegó vacía, con todas las fechas en null), la
   * reconstruye desde las columnas `h*` para no perder lo ya registrado.
   */
  private cargarAscensos(): void {
    while (this.ascensosArray.length > 0) {
      this.ascensosArray.removeAt(0);
    }

    // Filas guardadas en la lista JSON, en su orden original.
    const guardadas = parsearCategoria(this.data.valores?.categoria)
      .filter(fila => !!fila?.nombre && !!fila.fecha);

    guardadas.forEach(fila => this.agregarFilaAscenso({ nombre: fila.nombre, fecha: fila.fecha }));

    // Completa con las columnas `h*` que no vinieran ya en la lista: son los
    // registros anteriores a este cambio, que sólo tienen esas columnas.
    const nombresCargados = new Set(guardadas.map(fila => fila.nombre));

    ascensosDesdeColumnas(this.data.valores)
      .filter(fila => !nombresCargados.has(fila.nombre))
      .forEach(fila => this.agregarFilaAscenso(fila));
  }

  poner_codigo() {
    this.formularioCategoria.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {
    const ratificado = {
      ratificado: this.formularioCategoria.value?.ratificado,
      chk1: this.formularioCategoria.value?.chk1 == undefined || this.formularioCategoria.value?.chk1 == "" ? false : this.formularioCategoria.value?.chk1,
      chk2: this.formularioCategoria.value?.chk2 == undefined || this.formularioCategoria.value?.chk2 == "" ? false : this.formularioCategoria.value?.chk2,
      chk3: this.formularioCategoria.value?.chk3 == undefined || this.formularioCategoria.value?.chk3 == "" ? false : this.formularioCategoria.value?.chk3,
      chk4: this.formularioCategoria.value?.chk4 == undefined || this.formularioCategoria.value?.chk4 == "" ? false : this.formularioCategoria.value?.chk4,
      chk5: this.formularioCategoria.value?.chk5 == undefined || this.formularioCategoria.value?.chk5 == "" ? false : this.formularioCategoria.value?.chk5,
    }

    let ratificadoString = JSON.stringify(ratificado);

    // Filas del histórico: una categoría por fila con su fecha.
    const ascensos = this.ascensosArray.controls
      .map(control => ({
        nombre: (control.get('nombre')?.value ?? '') as string,
        fecha: control.get('fecha')?.value ?? null,
      }))
      .filter(fila => !!fila.nombre && !!fila.fecha);

    const filasIncompletas = this.ascensosArray.controls
      .filter(control => !!control.get('nombre')?.value && !control.get('fecha')?.value);

    if (filasIncompletas.length > 0) {
      Swal.fire({
        title: 'Faltan fechas',
        text: 'Hay ascensos con categoría pero sin fecha. Completa la fecha o elimina la fila.',
        icon: 'warning'
      });
      return;
    }

    const categoriasGuardar: AscensoCategoria[] = ascensos.map(fila => ({
      nombre: fila.nombre,
      seleccionada: true,
      fecha: fila.fecha,
    }));

    let body = {
      id: this.formularioCategoria.value?.id,
      tipo: this.formularioCategoria.value?.tipo,
      fecha: this.formularioCategoria.value?.fecha,
      categoria: JSON.stringify(categoriasGuardar),
      condiciondap: this.formularioCategoria.value?.condiciondap,
      codigoDocente: this.formularioCategoria.value?.codigoDocente,
      dedicacion: this.formularioCategoria.value?.dedicacion,
      labor: this.formularioCategoria.value?.labor,
      categoriadap: this.formularioCategoria.value?.categoriadap,
      ratificado: ratificadoString,
      // Columnas heredadas, derivadas de las filas: las siguen leyendo los
      // generadores de PDF/Word del backend.
      ...derivarColumnasHistorico(ascensos),
      dedicacionJubilacion: this.formularioHistorico.value?.dedicacionJubilacion,
      categoriaJubilacion: this.formularioHistorico.value?.categoriaJubilacion,
    }
    if (body.categoriadap == 'Extraordinario') {
      body.categoriadap = `Extraordinario-${this.formularioCategoria.value?.rg1}`
    }
    if (body.condiciondap == 'Inactivo') {
      body.condiciondap = `Inactivo-${this.formularioCategoria.value?.rg2}`
    }
    if (this.formularioCategoria?.valid) {
      // Cierre SÓLO tras la respuesta: cerrar antes hacía que el listado de
      // categorías recargara sin ver todavía el registro guardado.
      if (this.fnc == true) {
        this.docenteCategoriaApi.crear(body).subscribe({
          next: () => {
            Swal.fire({
              title: "Agregado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formularioCategoria.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      } else {
        this.docenteCategoriaApi.actualizar(body.codigoDocente, body).subscribe({
          next: () => {
            Swal.fire({
              title: "Actualizado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formularioCategoria.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      }
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioCategoria?.markAllAsTouched();
    }
  }

  /** Aviso común si el guardado falla: el diálogo se queda abierto para reintentar. */
  private mostrarErrorAlGuardar(error: unknown): void {
    console.error('Error al guardar:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar. Inténtalo de nuevo.',
      icon: 'error'
    });
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
      return `${data.nombres} ${data.apellidos}`
    }
    else {
      return "";
    }

  }

  /**
 * Calcula la fecha más reciente de todas las filas del histórico
 * y actualiza la Fecha Contrato automáticamente.
 */
  actualizarFechaContrato() {
    if (!this.formularioHistorico) return;

    // La fecha de contrato es la más reciente de las filas del histórico.
    const fechas = this.ascensosArray.controls.map(control => control.get('fecha')?.value);

    this.formularioCategoria.get('fecha')?.setValue(fechaMasReciente(fechas));
  }
}
