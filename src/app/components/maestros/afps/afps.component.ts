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
import { Afp } from '../../modelos/afp';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { AfpApiService } from '../../../core/api';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject } from 'rxjs';
import { DptdlgComponent } from '../../dialog/maestros/dptdlg/dptdlg.component';
import { AfpsdlgComponent } from '../../dialog/maestros/afpsdlg/afpsdlg.component';
import Swal from 'sweetalert2';
import { Tablas, TipoTablaService } from '../../../services/tipo-tabla.service';

@Component({
  selector: 'app-afps',
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
  templateUrl: './afps.component.html',
  styleUrl: './afps.component.scss'
})
export class AfpsComponent {
  tipotabla = "m"

  tablaDepartamento: Afp[] = [];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Afp) => `${element.id}` },
    { columnDef: 'nombre', header: 'Nombre AFP', cell: (element: Afp) => `${element.nombre}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo = "afps";
  titulo = "AFP";
  private destroy$ = new Subject<void>();
  private readonly TABLA: Tablas = 'AFP'; // Definimos el tipo de tabla

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly afpApi: AfpApiService,
    private cartabla: ConversiontablaService,
    public dialog: MatDialog,
    private mensajeService: TipoTablaService
  ) {

    sctabla.setData(this.tablaDepartamento);
    this.departamentoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
    this.titulos.emit(this.titulo);
  }
  ngOnInit(): void {
    this.cargartabla();
    // Simulación de carga de datos
    const datosTabla = { id: 1, nombre: 'Tabla AFP' };
    
    // Enviar datos a través del servicio
    this.mensajeService.enviarDatos(this.TABLA, datosTabla);
  }

  async cargartabla() {
    try {
      const source$ = this.afpApi.listar();
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
      title: 'No se pudo actualizar la lista de AFP',
      showConfirmButton: false,
      timer: 4000
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Opcional: Limpiar el canal cuando el componente se destruye
    this.mensajeService.limpiarCanal(this.TABLA);
  }
  dialogo() {
    const dialogRef = this.dialog.open(AfpsdlgComponent, {
      width: '800px',
      height: '350px',
      data: {
        title: `Agregar ${this.titulo}`,
        valores: {},
        modo: 0
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //if (result) {
      this.cargartabla();
      // }
    });
  }
  editar(element: any) {
    const dialogRef = this.dialog.open(AfpsdlgComponent, {
      width: '800px',
      height: '350px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          nombre: this.cartabla.dataSeleccionada.nombre,
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
    this.afpApi.eliminar(element.id).subscribe(data => {
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }

}
