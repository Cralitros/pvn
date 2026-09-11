import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablaComponent } from '../../objetos/tabla/tabla.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Investigador } from '../../modelos/investigador';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import {
  detalleDeErrorHttp,
  DocenteApiService,
  DocenteInvestigacionApiService,
  tituloDeErrorHttp,
} from '../../../core/api';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { InvestigadlgComponent } from '../../dialog/docente/investigadlg/investigadlg.component';
import {
  ordenarPorAnioDescendente,
  parsearReconocimientos,
} from '../../dialog/docente/investigadlg/reconocimientos.util';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

/**
 * Evita repetir el aviso de "backend desactualizado" en cada recarga de la
 * tabla: sólo se muestra una vez por sesión.
 */
let avisoHistorialMostrado = false;

@Component({
  selector: 'app-investigador',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    TablaComponent,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './investigador.component.html',
  styleUrl: './investigador.component.scss'
})
export class InvestigadorComponent {

  tablaDepartamento: Investigador[] = [];
  /*    id:string;
      orcid:string;
      renacyt:Date;
      grupo:string;
      nivel:string;
      registro:string;
      rol:string;
      reconocimiento:string;
      contenido:string;
      codigoDocente:string;
  }*/
  columns: Column[] = [
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
    { columnDef: 'id', header: 'No.', cell: (element: Investigador) => `${element.id}` },
    { columnDef: 'codigoDocente', header: 'Codigo Docente', cell: (element: Investigador) => `${element.codigoDocente}` },
    { columnDef: 'orcid', header: 'ORCID', cell: (element: Investigador) => `${element.orcid}` },
    { columnDef: 'renacyt', header: 'RENACYT', cell: (element: Investigador) => `${element.renacyt}` },
    { columnDef: 'grupo', header: 'Grupo', cell: (element: Investigador) => `${element.grupo}` },
    { columnDef: 'nivel', header: 'Nivel', cell: (element: Investigador) => `${element.nivel}` },
    { columnDef: 'registro', header: 'Registro', cell: (element: Investigador) => `${element.registro}` },
    { columnDef: 'rol', header: 'Rol', cell: (element: Investigador) => `${element.rol}` },
    { columnDef: 'reconocimiento', header: 'Reconocimiento', cell: (element: Investigador) => `${element.reconocimiento}` },
    {
      columnDef: 'reconocimientos',
      header: 'Reconocimientos (historial)',
      cell: (element: Investigador) => this.resumenReconocimientos(element.reconocimientos)
    },
    { columnDef: 'contenido', header: 'Contenido', cell: (element: Investigador) => `${element.contenido}` },
  ];
  formulario?: FormGroup | any = null;
  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);

  titulo = "Investigador";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly docenteApi: DocenteApiService,
    private readonly docenteInvestigacionApi: DocenteInvestigacionApiService,
    private cartabla: ConversiontablaService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {

    sctabla.setData(this.tablaDepartamento);
    this.departamentoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
    this.titulos.emit(this.titulo);
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
    // Se limpia el código: si se pega con espacios, no coincidía con el de la
    // tabla y el diálogo se abría en modo Añadir con la tabla vacía.
    const codigo = `${this.formulario?.value.codigo ?? ''}`.trim();

    if (!codigo) {
      Swal.fire('Atención', 'Por favor ingrese un código de docente primero.', 'warning');
      return;
    }

    if (this.tablaDepartamento.length === 0) {
      await this.cargartabla();
    }

    const encontrado = this.tablaDepartamento.find(
      item => `${item.codigoDocente}`.trim() === codigo
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

      // Se comprueba contra la API si ya tiene registro. Antes se abría siempre
      // en modo Añadir, con la tabla de reconocimientos vacía: parecía que no
      // había nada guardado y al guardar se podía duplicar el registro.
      const registros: any = await lastValueFrom(this.docenteInvestigacionApi.obtenerPorCodigo(codigo));
      const existente = Array.isArray(registros) ? registros[0] : registros;

      if (existente) {
        this.cartabla.dataSeleccionada = existente;
        this.editar(existente);
        return;
      }

      const dialogRef = this.dialog.open(InvestigadlgComponent, {
        width: '1100px',
        maxWidth: '95vw',
        height: '850px',
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

  /**
   * Resumen del historial para la columna de la tabla.
   *
   * Antes la lista no mostraba nada de los reconocimientos (sólo existía la
   * columna del campo antiguo `reconocimiento`), así que parecía que no se había
   * guardado nada. El detalle completo está en el diálogo.
   */
  private resumenReconocimientos(valor: unknown): string {
    const filas = ordenarPorAnioDescendente(parsearReconocimientos(valor));

    if (filas.length === 0) {
      return '';
    }

    const masReciente = filas[0];
    const etiqueta = [masReciente.anio, masReciente.nombre].filter(parte => !!parte).join(' - ')
      || masReciente.categoria
      || '(sin nombre)';

    return filas.length === 1
      ? etiqueta
      : `${filas.length} reconocimientos · más reciente: ${etiqueta}`;
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
      const source$ = this.docenteInvestigacionApi.listar();
      const finalNumber: any = await lastValueFrom(source$);

      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento = this.cartabla.array;

      this.sctabla.setData(this.tablaDepartamento);

      this.avisarSiLaApiNoDevuelveElHistorial(this.tablaDepartamento);
    } catch (error) {
      this.mostrarErrorAlCargar(error);
    }
  }

  /**
   * Avisa (una vez por sesión) si la API no devuelve el campo `reconocimientos`.
   *
   * Pasa cuando el backend desplegado todavía tiene el modelo antiguo. Sequelize
   * ignora en silencio los campos que no conoce, así que el historial de
   * reconocimientos parecería guardarse y se perdería sin ningún error.
   */
  private avisarSiLaApiNoDevuelveElHistorial(registros: unknown[]): void {
    if (avisoHistorialMostrado || registros.length === 0) {
      return;
    }

    const laApiLoTiene = registros.some(
      registro => !!registro && typeof registro === 'object' && 'reconocimientos' in registro
    );

    if (laApiLoTiene) {
      return;
    }

    avisoHistorialMostrado = true;
    Swal.fire({
      title: 'Backend desactualizado',
      html: 'La API no devuelve el campo <b>reconocimientos</b>, así que el historial de ' +
        'reconocimientos <b>no se va a guardar</b>.<br><br>' +
        'Falta actualizar <code>models/DocenteInvestigador.js</code> y ejecutar el ' +
        '<code>ALTER TABLE</code> en la base de datos.',
      icon: 'warning'
    });
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
  /**
   * Datos que recibe el diálogo de investigación.
   *
   * Lo usan tanto el lápiz de la tabla como la búsqueda por código, para que en
   * los dos casos el historial de reconocimientos (`reconocimientos`) llegue al
   * diálogo y no se pierda al guardar.
   */
  private valoresDelRegistro(registro: any, docente?: any): Record<string, unknown> {
    return {
      id: registro?.id,
      orcid: registro?.orcid,
      renacyt: registro?.renacyt,
      grupo: registro?.grupo,
      nivel: registro?.nivel,
      registro: registro?.registro,
      rol: registro?.rol,
      reconocimiento: registro?.reconocimiento,
      contenido: registro?.contenido,
      codigoDocente: registro?.codigoDocente,
      condicion: registro?.condicion,
      semestresInvestigacion: registro?.semestresInvestigacion,
      reconocimientos: registro?.reconocimientos,
      docente: docente ?? registro?.Docente,
    };
  }

  editar(element: any) {
    const dialogRef = this.dialog.open(InvestigadlgComponent, {
      width: '1100px',
      maxWidth: '95vw',
      height: '850px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: this.valoresDelRegistro(this.cartabla.dataSeleccionada),
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
    this.docenteInvestigacionApi.eliminar(element.id).subscribe({
      next: () => {
        Swal.fire({
          title: "Eliminado",
          text: "Continuar",
          icon: "info"
        });
        this.cargartabla();
      },
      error: (error) => {
        // Antes no había manejador: si el borrado fallaba, no pasaba nada y
        // parecía que el botón no funcionaba. Ahora se ve el motivo real.
        console.error('No se pudo eliminar el registro:', error);
        Swal.fire({
          title: tituloDeErrorHttp('No se pudo eliminar', error),
          text: detalleDeErrorHttp(error).mensaje ?? 'Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    })
  }

}
