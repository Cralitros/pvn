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
import { Categoria, DocumentoEvento, EventoCategoria } from '../../../modelos/categoria';
import {
  ascensosDesdeColumnas,
  CATEGORIAS_DOCENTE,
  CATEGORIAS_JUBILACION,
  CATEGORIAS_PREDOCENTE,
  categoriaVisible,
  crearEventoVacio,
  cuerpoDemasiadoGrande,
  DEDICACIONES_HISTORICO,
  DEPARTAMENTOS_HISTORICO,
  derivarColumnasHistorico,
  eventoVacio,
  fechaMasReciente,
  fechaLocal,
  fechaValida,
  formatearTamano,
  esDocumento,
  LIMITE_CUERPO_BYTES,
  LINEAS_HISTORICO,
  MODALIDADES_INGRESO,
  nombreDocumento,
  parsearCategoria,
  TAMANO_TROZO_BYTES,
  TIPOS_PROCESO,
  validarDocumento,
} from '../../../modelos/categoria-historico.util';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { detalleDeErrorHttp, DocenteCategoriaApiService, tituloDeErrorHttp } from '../../../../core/api';
import { DocumentoArchivoService } from '../../../../services/documento-archivo.service';
import { Condiciones } from '../../../modelos/condiciones';
import { lastValueFrom } from 'rxjs';
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

  /** Catálogos del detalle de cada evento del histórico. */
  readonly catalogoTiposProceso = TIPOS_PROCESO;
  readonly catalogoLineas = LINEAS_HISTORICO;
  readonly catalogoDepartamentos = DEPARTAMENTOS_HISTORICO;
  readonly catalogoCategoriasPredocente = CATEGORIAS_PREDOCENTE;
  readonly catalogoCategoriasDocente = CATEGORIAS_DOCENTE;
  readonly catalogoModalidadesIngreso = MODALIDADES_INGRESO;
  readonly catalogoDedicaciones = DEDICACIONES_HISTORICO;
  readonly cateJubilacion = CATEGORIAS_JUBILACION;

  /** Formatos que acepta el selector de archivos del documento de sustento. */
  readonly aceptaDocumento = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp';

  /**
   * Avance (0-100) de la subida del documento de cada fila, por índice.
   *
   * La ausencia de la clave significa «no se está subiendo».
   */
  readonly progresoSubida: Record<number, number> = {};

  /**
   * Documentos subidos en esta sesión del diálogo y todavía no guardados.
   *
   * Si el usuario cancela o quita la fila, se borran del servidor para no dejar
   * archivos huérfanos.
   */
  private readonly documentosSubidos = new Set<string>();


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
    private readonly archivos: DocumentoArchivoService,
    private readonly docenteCategoriaApi: DocenteCategoriaApiService) {

    //this.selectedCategory2=true;

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
      // Fecha válida o `null`: antes `new Date(valor)` convertía una fecha nula
      // en 1970, una ausente en `Invalid Date` y una sin hora en el día anterior.
      fecha: fechaLocal(this.data.valores.fecha),
      condiciondap: d2,
      codigoDocente: this.data.valores.codigoDocente,
      dedicacion: this.data.valores.dedicacion,
      labor: this.data.valores.labor,
      categoriadap: d1,
      rg1: g1,
      rg2: g2,
      // `setValue` exige un valor para todos los controles: los registros sin
      // `ratificado` guardado (llega vacío) rompían la apertura del diálogo con
      // NG01002, así que se completan con los valores por defecto.
      ratificado: ratificado.ratificado ?? '',
      chk1: ratificado.chk1 ?? false,
      chk2: ratificado.chk2 ?? false,
      chk3: ratificado.chk3 ?? false,
      chk4: ratificado.chk4 ?? false,
      chk5: ratificado.chk5 ?? false,
    });

    this.formularioHistorico.patchValue({
      dedicacionJubilacion: this.data.valores.dedicacionJubilacion,
      categoriaJubilacion: this.data.valores.categoriaJubilacion,
    });

    // Las filas del histórico vienen de la lista JSON guardada en `categoria`.
    this.cargarEventos();

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
      // Filas dinámicas del histórico: cada fila es un evento del escalafón.
      eventos: this.formBuilder.array([]),
      categoriaJubilacion: [''],
      dedicacionJubilacion: [''],

    });
    /*this.saux1.ponerurl("categoria");
    this.saux1.get().subscribe(data => {
      this.condiciones = data;
    })*/

    // ✅ NUEVO: Cada vez que cambie CUALQUIER fecha del histórico, recalculamos la fecha contrato
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

  // ─── Histórico de eventos (filas dinámicas) ──────────────────────────────────

  get eventosArray(): FormArray {
    return this.formularioHistorico.get('eventos') as FormArray;
  }

  /** Añade un evento al histórico. Sin argumentos crea una fila vacía. */
  agregarFilaEvento(datos?: EventoCategoria | null): void {
    const evento = datos ?? crearEventoVacio();

    this.eventosArray.push(this.formBuilder.group({
      // `fechaLocal`: un `2021-08-01` sin hora se leería como UTC y el campo
      // mostraría (y volvería a guardar) el día anterior.
      fechaInicio: [fechaLocal(evento.fechaInicio) ?? ''],
      fechaFin: [fechaLocal(evento.fechaFin) ?? ''],
      tipoProceso: [evento.tipoProceso ?? ''],
      linea: [evento.linea ?? ''],
      departamento: [evento.departamento ?? ''],
      categoriaPredocente: [evento.categoriaPredocente ?? ''],
      categoriaDocente: [evento.categoriaDocente ?? ''],
      modalidadIngreso: [evento.modalidadIngreso ?? ''],
      dedicacion: [evento.dedicacion ?? ''],
      documento: [evento.documento ?? null],
    }));
  }

  eliminarFilaEvento(index: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el evento de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const documento = this.documentoDe(index);

        // El archivo subido se borra del servidor: si no, quedaría huérfano.
        if (documento?.archivo) {
          this.documentosSubidos.delete(documento.archivo);
          this.eliminarDelServidor(documento.archivo);
        }

        delete this.progresoSubida[index];
        this.eventosArray.removeAt(index);
      }
    });
  }

  /** Línea elegida en una fila: decide qué categoría se muestra. */
  lineaDe(index: number): string {
    return (this.eventosArray.at(index)?.get('linea')?.value ?? '') as string;
  }

  /** Documento adjunto de una fila, ya tipado para la plantilla. */
  documentoDe(index: number): DocumentoEvento | null {
    const documento = this.eventosArray.at(index)?.get('documento')?.value;
    return esDocumento(documento) ? documento : null;
  }

  /** Tamaño del documento en texto legible. */
  tamanoLegible(bytes: number): string {
    return formatearTamano(bytes);
  }

  /** Avance (0-100) de la subida del documento de una fila. */
  progresoDe(index: number): number {
    return this.progresoSubida[index] ?? 0;
  }

  /** ¿Se está subiendo el documento de esa fila? */
  subiendoEn(index: number): boolean {
    return this.progresoSubida[index] !== undefined;
  }

  /** Al cambiar la línea se limpia la categoría de la otra línea. */
  onLineaChange(index: number): void {
    const fila = this.eventosArray.at(index);
    if (!fila) {
      return;
    }

    if (this.lineaDe(index) === 'Predocente') {
      fila.get('categoriaDocente')?.setValue('');
    } else if (this.lineaDe(index) === 'Docente') {
      fila.get('categoriaPredocente')?.setValue('');
    }
  }

  /**
   * Adjunta el documento que sustenta el evento.
   *
   * El archivo **no** viaja dentro del JSON del histórico: el hosting corta
   * cualquier petición de más de 128 KB, así que se sube por trozos a
   * `docentescategoria/documento/{archivo}` y en el evento sólo queda la
   * referencia (`archivo`). Así el registro se mantiene pequeño y el archivo se
   * puede volver a ver sin engordar la tabla.
   */
  async onDocumentoSeleccionado(event: Event, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';

    if (!archivo) {
      return;
    }

    const fila = this.eventosArray.at(index);
    if (!fila) {
      return;
    }

    const motivo = validarDocumento(archivo);
    if (motivo) {
      Swal.fire({
        title: 'No se pudo adjuntar',
        text: motivo,
        icon: 'warning'
      });
      return;
    }

    const nombreServidor = nombreDocumento(this.formularioCategoria.value?.codigoDocente, archivo.name);
    this.progresoSubida[index] = 0;

    try {
      await this.subirTrozos(archivo, nombreServidor, index);

      const documento: DocumentoEvento = {
        nombre: archivo.name,
        tipo: archivo.type || 'application/octet-stream',
        tamano: archivo.size,
        archivo: nombreServidor,
      };

      fila.get('documento')?.setValue(documento);
      fila.get('documento')?.markAsDirty();
      this.documentosSubidos.add(nombreServidor);
    } catch (error) {
      console.error('No se pudo subir el documento:', error);
      this.eliminarDelServidor(nombreServidor);
      Swal.fire({
        title: 'No se pudo adjuntar',
        text: this.textoDeErrorDeSubida(error),
        icon: 'error'
      });
    } finally {
      delete this.progresoSubida[index];
    }
  }

  /** Envía el archivo en trozos de `TAMANO_TROZO_BYTES`, en orden. */
  private async subirTrozos(archivo: File, nombreServidor: string, index: number): Promise<void> {
    const total = Math.max(1, Math.ceil(archivo.size / TAMANO_TROZO_BYTES));

    for (let indice = 0; indice < total; indice++) {
      const trozo = archivo.slice(indice * TAMANO_TROZO_BYTES, (indice + 1) * TAMANO_TROZO_BYTES);

      await lastValueFrom(this.docenteCategoriaApi.subirTrozoDocumento(nombreServidor, indice, trozo));
      this.progresoSubida[index] = Math.round(((indice + 1) / total) * 100);
    }
  }

  /** Mensaje del fallo al subir: el 404 delata que falta desplegar la ruta. */
  private textoDeErrorDeSubida(error: unknown): string {
    const { estado, mensaje } = detalleDeErrorHttp(error);

    if (estado === 404) {
      return 'El servidor no tiene la ruta de documentos (docentescategoria/documento). Despliega la ruta del backend antes de adjuntar archivos.';
    }

    if (estado === 413) {
      return 'El servidor cortó la subida por tamaño, aunque va por trozos. Avisa a sistemas.';
    }

    return mensaje ?? 'No se pudo subir el archivo. Inténtalo de nuevo.';
  }

  /** Quita el documento adjunto de una fila (y lo borra del servidor). */
  quitarDocumento(index: number): void {
    const documento = this.documentoDe(index);

    if (documento?.archivo) {
      this.documentosSubidos.delete(documento.archivo);
      this.eliminarDelServidor(documento.archivo);
    }

    this.eventosArray.at(index)?.get('documento')?.setValue(null);
  }

  /** Borra un archivo del servidor sin bloquear la interfaz si falla. */
  private eliminarDelServidor(nombreServidor: string): void {
    this.docenteCategoriaApi.eliminarDocumento(nombreServidor).subscribe({
      error: (error) => console.warn('No se pudo borrar el documento del servidor:', error)
    });
  }

  /**
   * Abre el documento adjunto en otra pestaña.
   *
   * Los documentos nuevos se piden al servidor (`archivo`); los antiguos traen
   * el base64 dentro del JSON (`dataUrl`) y se abren desde memoria. Lo que el
   * navegador sabe mostrar (PDF e imágenes) se abre en una pestaña; el resto se
   * descarga. Si el navegador bloquea la pestaña, se descarga igualmente.
   */
  verDocumento(index: number): void {
    const documento = this.documentoDe(index);
    if (!documento) {
      Swal.fire({
        title: 'Sin documento',
        text: 'Este evento no tiene un documento adjunto.',
        icon: 'info'
      });
      return;
    }

    if (documento.archivo) {
      this.docenteCategoriaApi.descargarDocumento(documento.archivo).subscribe({
        next: (blob) => this.archivos.abrir(blob, documento.nombre, documento.tipo),
        error: (error) => {
          console.error('No se pudo descargar el documento:', error);
          Swal.fire({
            title: tituloDeErrorHttp('No se pudo abrir el documento', error),
            text: detalleDeErrorHttp(error).mensaje ?? 'El archivo ya no está en el servidor.',
            icon: 'error'
          });
        }
      });
      return;
    }

    this.archivos.abrir(
      this.archivos.desdeBase64(documento.dataUrl ?? '', documento.tipo),
      documento.nombre,
      documento.tipo
    );
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
  private cargarEventos(): void {
    while (this.eventosArray.length > 0) {
      this.eventosArray.removeAt(0);
    }

    // Filas guardadas en la lista JSON, en su orden original.
    const guardadas = parsearCategoria(this.data.valores?.categoria)
      .filter(evento => !eventoVacio(evento));

    guardadas.forEach(evento => this.agregarFilaEvento(evento));

    // Completa con las columnas `h*` que no vinieran ya en la lista: son los
    // registros anteriores a este cambio, que sólo tienen esas columnas.
    const categoriasCargadas = new Set(guardadas.map(evento => categoriaVisible(evento)));

    ascensosDesdeColumnas(this.data.valores)
      .filter(evento => !categoriasCargadas.has(categoriaVisible(evento)))
      .forEach(evento => this.agregarFilaEvento(evento));
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

    // Eventos del histórico: se guardan las filas que tengan algún dato, aunque
    // les falten campos (el detalle es opcional a propósito).
    const eventos: EventoCategoria[] = [];

    for (let indice = 0; indice < this.eventosArray.length; indice++) {
      const evento = this.eventoDeFila(this.eventosArray.at(indice) as FormGroup);

      if (eventoVacio(evento)) {
        continue;
      }

      const motivo = this.validarFechas(evento, indice + 1);
      if (motivo) {
        Swal.fire({
          title: 'Revisa las fechas',
          text: motivo,
          icon: 'warning'
        });
        return;
      }

      eventos.push({ ...evento, seleccionada: true });
    }

    let body = {
      id: this.formularioCategoria.value?.id,
      tipo: this.formularioCategoria.value?.tipo,
      fecha: this.formularioCategoria.value?.fecha,
      categoria: JSON.stringify(eventos),
      condiciondap: this.formularioCategoria.value?.condiciondap,
      codigoDocente: this.formularioCategoria.value?.codigoDocente,
      dedicacion: this.formularioCategoria.value?.dedicacion,
      labor: this.formularioCategoria.value?.labor,
      categoriadap: this.formularioCategoria.value?.categoriadap,
      ratificado: ratificadoString,
      // Columnas heredadas, derivadas de las filas: las siguen leyendo los
      // generadores de PDF/Word del backend.
      ...derivarColumnasHistorico(eventos),
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
            // Los documentos subidos ya quedaron referenciados en el registro:
            // dejan de ser huérfanos y no se borran al cerrar.
            this.documentosSubidos.clear();
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
            this.documentosSubidos.clear();
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

  /** Valores de una fila del formulario como evento del histórico. */
  private eventoDeFila(fila: FormGroup): EventoCategoria {
    const valor = fila.value;

    return {
      seleccionada: true,
      fechaInicio: valor.fechaInicio || null,
      fechaFin: valor.fechaFin || null,
      tipoProceso: valor.tipoProceso ?? '',
      linea: valor.linea ?? '',
      departamento: valor.departamento ?? '',
      categoriaPredocente: valor.categoriaPredocente ?? '',
      categoriaDocente: valor.categoriaDocente ?? '',
      modalidadIngreso: valor.modalidadIngreso ?? '',
      dedicacion: valor.dedicacion ?? '',
      documento: valor.documento ?? null,
    };
  }

  /**
   * Única comprobación que bloquea el guardado: una fecha de fin anterior a la
   * de inicio.
   *
   * Del resto del detalle no se exige nada: un evento se puede registrar con los
   * datos que se tengan a mano (sin departamento, sin modalidad de ingreso, sin
   * dedicación...) y completarse después. Sólo se descartan las filas que
   * quedaron totalmente vacías.
   *
   * Devuelve `null` si está correcto o el motivo, ya redactado con el número de
   * fila para que se ubique sin buscarla.
   */
  private validarFechas(evento: EventoCategoria, numero: number): string | null {
    const inicio = fechaValida(evento.fechaInicio);
    const fin = fechaValida(evento.fechaFin);

    if (inicio && fin && fin.getTime() < inicio.getTime()) {
      return `Evento ${numero}: la fecha de fin es anterior a la fecha de inicio.`;
    }

    return null;
  }

  /**
   * ¿Alguna fila lleva el documento dentro del JSON?
   *
   * Sólo pasa con los registros antiguos (base64): los documentos nuevos viajan
   * por su propia ruta y no engordan el cuerpo del guardado.
   */
  private hayDocumentoEnElJson(): boolean {
    return this.eventosArray.controls.some(control => !!control.get('documento')?.value?.dataUrl);
  }

  /** JSON del histórico tal como se va a enviar. */
  private jsonHistorico(): string {
    const eventos = this.eventosArray.controls
      .map(control => this.eventoDeFila(control as FormGroup));

    return JSON.stringify(eventos);
  }

  /** ¿El error apunta a que el cuerpo enviado es demasiado grande? */
  private pareceErrorDeTamano(estado: number | null, mensaje: string | null): boolean {
    if (estado === 413 || estado === 431) {
      return true;
    }

    return /too long|too large|payload|entity too large|max_allowed_packet|exceeds/i.test(mensaje ?? '');
  }

  /**
   * Aviso de guardado fallido.
   *
   * Muestra el estado y el mensaje del servidor en lugar del texto genérico de
   * antes: sin ese detalle no hay forma de distinguir un problema de tamaño, de
   * permisos o de datos.
   */
  private mostrarErrorAlGuardar(error: unknown): void {
    console.error('Error al guardar:', error);

    const { estado, mensaje } = detalleDeErrorHttp(error);
    const json = this.jsonHistorico();
    const llevaBase64 = this.hayDocumentoEnElJson();

    const partes = ['No se pudo guardar el registro.'];

    if (estado === 0) {
      partes.push('La petición se quedó sin respuesta: el navegador vio cortada la conexión antes de que el servidor contestara.');
    } else if (estado) {
      partes.push(`El servidor respondió ${estado}${mensaje ? `: ${mensaje}` : '.'}`);
    } else if (mensaje) {
      partes.push(mensaje);
    }

    partes.push(`El histórico enviado pesa ${formatearTamano(json.length)}${llevaBase64 ? ' e incluye un documento antiguo en base64' : ''}.`);

    if (llevaBase64 && (cuerpoDemasiadoGrande(json) || this.pareceErrorDeTamano(estado, mensaje))) {
      partes.push(`El cuerpo supera los ${formatearTamano(LIMITE_CUERPO_BYTES)} que el backend acepta: vuelve a adjuntar el documento (ahora se sube por trozos) o pide que se amplíe el límite del servidor.`);
    }

    Swal.fire({
      title: tituloDeErrorHttp('No se pudo guardar', error),
      text: partes.join(' '),
      icon: 'error'
    });
  }

  onNoClick(): void {
    // Los documentos subidos y no guardados se borran: si no, quedarían
    // huérfanos en el servidor al cancelar.
    this.documentosSubidos.forEach(nombreServidor => this.eliminarDelServidor(nombreServidor));
    this.documentosSubidos.clear();

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
   * Pone en «Fecha contrato» la fecha de inicio más reciente del histórico.
   *
   * Si ninguna fila tiene fecha de inicio **no se toca** la fecha del contrato.
   * Antes se escribía `null` en ese caso: como el detalle del histórico es
   * opcional, bastaba con añadir una fila sin fechas para dejar el campo vacío y
   * que el guardado lo rechazara (y de paso perdía la fecha ya registrada).
   */
  actualizarFechaContrato() {
    if (!this.formularioHistorico) return;

    // La fecha de contrato es la fecha de inicio más reciente del histórico.
    const fechas = this.eventosArray.controls.map(control => control.get('fechaInicio')?.value);
    const masReciente = fechaMasReciente(fechas);

    if (!masReciente) {
      return;
    }

    this.formularioCategoria.get('fecha')?.setValue(masReciente);
  }
}
