import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TablaComponent } from '../../objetos/tabla/tabla.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Categoria, DocumentoEvento, EventoCategoria } from '../../modelos/categoria';
import {
  categoriaVisible,
  fechaLocal,
  formatearTamano,
  parsearCategoria,
} from '../../modelos/categoria-historico.util';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { DocumentoArchivoService } from '../../../services/documento-archivo.service';
import { detalleDeErrorHttp, DocenteApiService, DocenteCategoriaApiService, tituloDeErrorHttp } from '../../../core/api';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { CategoriadlgComponent } from '../../dialog/docente/categoriadlg/categoriadlg.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TablaComponent,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent {
  tablaDepartamento: Categoria[] = [];

  @Input() codigo: any;

  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Categoria) => `${element.id}` },
    { columnDef: 'codigo', header: 'Codigo Docente', cell: (element: Categoria) => `${element.codigoDocente}` },
    { columnDef: 'tipo', header: 'Tipo', cell: (element: Categoria) => `${element.tipo}` },
    { columnDef: 'fecha', header: 'Fecha', cell: (element: Categoria) => `${this.fechaCorta(element.fecha)}` },
    // El histórico llega como texto JSON: en la celda se resume en una línea por
    // evento y en la fila desplegada se ve el detalle completo (ver la plantilla).
    { columnDef: 'categoria', header: 'Categoria', cell: (element: Categoria) => this.resumenEventos(element) },
    { columnDef: 'condiciondap', header: 'Condicion', cell: (element: Categoria) => `${element.condiciondap}` },
    { columnDef: 'dedicacion', header: 'Dedicacion', cell: (element: Categoria) => `${element.dedicacion}` },
    { columnDef: 'labor', header: 'Labor', cell: (element: Categoria) => `${element.labor}` },
    { columnDef: 'categoriadap', header: 'Categoria DAP', cell: (element: Categoria) => `${element.categoriadap}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];
  /**/

  formulario?: FormGroup | any = null;
  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);

  /**
   * Tamaño con el que se abre el diálogo de categoría.
   *
   * La pestaña «Histórico» tiene diez columnas, así que necesita más ancho que
   * el resto de diálogos; se acota al ancho de la ventana para que no se salga
   * en pantallas pequeñas (dentro, la tabla se desplaza en horizontal).
   */
  private readonly configuracionDialogo = {
    width: '1400px',
    maxWidth: '96vw',
    height: '85vh',
    maxHeight: '92vh',
    panelClass: 'categoria-dialog',
  };

  titulo = "Provincias";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly docenteApi: DocenteApiService,
    private readonly docenteCategoriaApi: DocenteCategoriaApiService,
    private readonly archivos: DocumentoArchivoService,
    private cartabla: ConversiontablaService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {

    this.departamentoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
    this.titulos.emit(this.titulo);
  }

  // ─── Histórico de eventos en la tabla ────────────────────────────────────────

  /**
   * Eventos del histórico de un registro.
   *
   * La API entrega la columna `categoria` como texto JSON, así que se parsea con
   * la misma función tolerante que usa el diálogo: un valor vacío, corrupto o de
   * un formato viejo devuelve `[]` en lugar de romper la tabla.
   */
  eventosDe(elemento: Categoria | null | undefined): EventoCategoria[] {
    return parsearCategoria((elemento as Categoria | undefined)?.categoria)
      .filter(evento => evento.seleccionada);
  }

  /** Resumen de la celda: una línea por evento, para que la tabla siga siendo legible. */
  resumenEventos(elemento: Categoria | null | undefined): string {
    return this.eventosDe(elemento)
      .map(evento => this.resumenEvento(evento))
      .join('\n');
  }

  /** `Categoría - Proceso: inicio a fin` de un evento. */
  private resumenEvento(evento: EventoCategoria): string {
    const categoria = categoriaVisible(evento) || 'Sin categoría';
    const proceso = evento.tipoProceso || 'Asignado';
    const inicio = this.fechaCorta(evento.fechaInicio ?? evento.fecha);
    const fin = this.fechaCorta(evento.fechaFin);
    const rango = inicio ? `: ${inicio}${fin ? ` a ${fin}` : ''}` : '';

    return `${categoria} - ${proceso}${rango}`;
  }

  /** Categoría que corresponde al evento según su línea. */
  categoriaDe(evento: EventoCategoria): string {
    return categoriaVisible(evento);
  }

  /** Fecha del evento en `dd/mm/aaaa`; vacío si no hay fecha válida. */
  fechaCorta(valor: unknown): string {
    // `fechaLocal` (y no `fechaValida`) para que un `2021-08-01` sin hora no se
    // lea como UTC y salga el día anterior en hora de Perú.
    const fecha = fechaLocal(valor);

    if (!fecha) {
      return '';
    }

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    return `${dia}/${mes}/${fecha.getFullYear()}`;
  }

  /** Tamaño del documento en texto legible. */
  tamanoLegible(bytes: number): string {
    return formatearTamano(bytes);
  }

  /**
   * Abre el documento que sustenta un evento.
   *
   * Los documentos nuevos se piden al servidor por su nombre de archivo; los
   * registros antiguos traen el base64 dentro del JSON del histórico.
   */
  verDocumento(evento: EventoCategoria): void {
    const documento = evento.documento;

    if (!documento) {
      return;
    }

    if (documento.archivo) {
      this.docenteCategoriaApi.descargarDocumento(documento.archivo).subscribe({
        next: (blob) => this.archivos.abrir(blob, documento.nombre, documento.tipo),
        error: (error) => {
          console.error('No se pudo abrir el documento:', error);
          Swal.fire({
            title: tituloDeErrorHttp('No se pudo abrir el documento', error),
            text: detalleDeErrorHttp(error).mensaje ?? 'El archivo ya no está en el servidor.',
            icon: 'error'
          });
        }
      });
      return;
    }

    if (documento.dataUrl) {
      this.archivos.abrir(
        this.archivos.desdeBase64(documento.dataUrl, documento.tipo),
        documento.nombre,
        documento.tipo
      );
    }
  }

  /** ¿El evento tiene un documento que se pueda abrir? */
  tieneDocumento(evento: EventoCategoria): boolean {
    const documento: DocumentoEvento | null = evento.documento;
    return !!documento && (!!documento.archivo || !!documento.dataUrl);
  }
  ngOnInit(): void {
    this.cargartabla();
    this.formulario = this.formBuilder.group({
      codigo: ['']
    });
  }
  ngAfterViewInit() {
    this.route.queryParams.subscribe((params: any) => {
      // const tipo = params['tipo'];
      const data = params['selectedRow'];

      this.cargartabla().then(() => {
        this.buscar(data);
      });
    });

  }
  // ✅ Método principal corregido
  async abrirDialogoLaboral(): Promise<void> {
    const codigo = this.formulario?.value.codigo;
    if (!codigo) {
      Swal.fire('Atención', 'Por favor ingrese un código de docente primero.', 'warning');
      return;
    }

    if (this.tablaDepartamento.length === 0) {
      await this.cargartabla();
    }

    // ✅ Usar conversión explícita con String() global o template literals
    const encontrado = this.tablaDepartamento.find(
      item => `${item.codigoDocente}` === `${codigo}`
    );

    if (encontrado) {
      this.cartabla.dataSeleccionada = encontrado;
      this.editar(encontrado);
    } else {
      await this.crearNuevo(codigo);
    }
  }

  private async crearNuevo(codigo: string): Promise<void> {
    try {
      const docenteData: any = await lastValueFrom(this.docenteApi.obtenerPorCodigo(codigo));

      if (!docenteData || (Array.isArray(docenteData) && docenteData.length === 0)) {
        Swal.fire('Error', 'El código de docente no existe en el sistema.', 'error');
        return;
      }

      const docenteInfo = Array.isArray(docenteData) ? docenteData[0] : docenteData;

      const dialogRef = this.dialog.open(CategoriadlgComponent, {
        ...this.configuracionDialogo,
        data: {
          title: `Agregar ${this.titulo}`,
          valores: {
            laboral: docenteData,
            docente: docenteInfo
          },
          modo: 0
        }
      });

      dialogRef.afterClosed().subscribe(() => this.cargartabla());
    } catch (error) {
      console.error('Error al verificar docente:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
  }

  async buscar(data: any) {
    // Sin fila seleccionada no hay nada que buscar. Antes se hacía
    // `setValue({ codigo: undefined })`, que lanza NG01002 cada vez que se
    // entraba a la pantalla sin venir de una fila seleccionada.
    if (data === undefined || data === null || `${data}`.trim() === '') {
      return;
    }

    this.formulario?.setValue({ 'codigo': data });
    await this.abrirDialogoLaboral();
  }
  existeRegistro(): boolean {
    const codigo = this.formulario?.value.codigo;
    // Usamos == para comparar sin importar si viene como número o texto
    return this.tablaDepartamento.some(item => item.codigoDocente == codigo);
  }

  async cargartabla() {
    try {
      const source$ = this.docenteCategoriaApi.listar();
      const finalNumber: any = await lastValueFrom(source$);

      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento = this.cartabla.array;

      this.sctabla.setData(this.tablaDepartamento);
    } catch (error) {
      this.mostrarErrorAlCargar(error);
    }
  }

  /** La recarga falló: se avisa sin borrar lo que ya había en pantalla. */
  private mostrarErrorAlCargar(error: unknown): void {
    console.error('No se pudo actualizar la tabla:', error);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'No se pudo actualizar la tabla',
      showConfirmButton: false,
      timer: 4000
    });
  }
  dialogo() {
    let laboral: any;
    this.docenteApi.obtenerPorCodigo(this.formulario?.value.codigo).subscribe((data: any) => {
      laboral = data;
      if (data[0].DocenteCategoria.length == 0) {//verifica si existe el docente

        this.docenteCategoriaApi.obtener(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente

          const dialogRef = this.dialog.open(CategoriadlgComponent, {
            ...this.configuracionDialogo,
            data: {
              title: `Agregar ${this.titulo}`,
              valores: { laboral },
              modo: 0
            }
          });
          dialogRef.afterClosed().subscribe(result => {

            this.cargartabla();

          });


        });

      }
    });


  }
  /*id:this.formularioCategoria.value?.id,
      tipo: this.formularioCategoria.value?.tipo,
      fecha: this.formularioCategoria.value?.fecha,
      categoria: this.formularioCategoria.value?.categoria,
      condiciondap:  this.formularioCategoria.value?.condiciondap,
      codigoDocente:  this.formularioCategoria.value?.codigoDocente,
      dedicacion:  this.formularioCategoria.value?.dedicacion,
      labor:  this.formularioCategoria.value?.labor,
      categoriadap:  this.formularioCategoria.value?.categoriadap */
  editar(element: any) {
    const dialogRef = this.dialog.open(CategoriadlgComponent, {
      ...this.configuracionDialogo,
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          tipo: this.cartabla.dataSeleccionada.tipo,
          fecha: this.cartabla.dataSeleccionada.fecha,
          categoria: this.cartabla.dataSeleccionada.categoria,
          condiciondap: this.cartabla.dataSeleccionada.condiciondap,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
          dedicacion: this.cartabla.dataSeleccionada.dedicacion,
          labor: this.cartabla.dataSeleccionada.labor,
          categoriadap: this.cartabla.dataSeleccionada.categoriadap,
          ratificado: this.cartabla.dataSeleccionada.ratificado,
          contratado: this.cartabla.dataSeleccionada.hContratado,
          auxiliar: this.cartabla.dataSeleccionada.hAuxiliar,
          principal: this.cartabla.dataSeleccionada.hPrincipal,
          asociado: this.cartabla.dataSeleccionada.hAsociado,
          jefepractica: this.cartabla.dataSeleccionada.hJefePract,
          ayudante: this.cartabla.dataSeleccionada.hAyudante,
          asistente: this.cartabla.dataSeleccionada.hAsistente,
          instructor: this.cartabla.dataSeleccionada.hInstructor,
          profesorvisitante: this.cartabla.dataSeleccionada.hProfesorVisita,
          dedicacionJubilacion: this.cartabla.dataSeleccionada.dedicacionJubilacion,
          categoriaJubilacion: this.cartabla.dataSeleccionada.categoriaJubilacion,
          docente: this.cartabla.dataSeleccionada.Docente,
        },
        modo: 1
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result) {
      this.cargartabla();
      //  }
    });

  }
  eliminar(element: any) {
    this.docenteCategoriaApi.eliminar(element.codigoDocente).subscribe(data => {
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }

}
