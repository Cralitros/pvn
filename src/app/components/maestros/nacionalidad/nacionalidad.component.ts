import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { TablaComponent } from '../../objetos/tabla/tabla.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Nacionalidad } from '../../modelos/nacionalidad';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { NacionalidaddlgComponent } from '../../dialog/maestros/nacionalidaddlg/nacionalidaddlg.component';

@Component({
  selector: 'app-nacionalidad',
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
  templateUrl: './nacionalidad.component.html',
  styleUrl: './nacionalidad.component.scss'
})
export class NacionalidadComponent {
  tablaDepartamento: Nacionalidad[] = [];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Nacionalidad) => `${element.id}` },
    { columnDef: 'nombre', header: 'Nacionalidad', cell: (element: Nacionalidad) => `${element.nombre}` },
    { columnDef: 'pais', header: 'Pais', cell: (element: Nacionalidad) => `${element.pais}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo = "nacionalidades";
  titulo = "Nacionalidad";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice: MaestrosserviceService,
    private cartabla: ConversiontablaService,
    public dialog: MatDialog
  ) {

    this.cargartabla();
    console.log(this.tablaDepartamento);

    sctabla.setData(this.tablaDepartamento);
    this.departamentoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
    this.titulos.emit(this.titulo);
  }
  ngOnInit(): void {
    this.cargartabla();
  }

  async cargartabla() {
    this.mservice.ponerurl("nacionalidad");
    const source$ = this.mservice.get();
    const finalNumber: any = await lastValueFrom(source$);

    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento = this.cartabla.array;
    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo() {
    const dialogRef = this.dialog.open(NacionalidaddlgComponent, {
      width: '500px',
      height: '550px',
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
    const dialogRef = this.dialog.open(NacionalidaddlgComponent, {
      width: '500px',
      height: '550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          nombre: this.cartabla.dataSeleccionada.nombre,
          pais: this.cartabla.dataSeleccionada.pais,
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
    console.log("Elemento a eliminar:", element);

    // Verificar qué propiedad tiene el nombre (puede ser 'nombre', 'descripcion', etc.)
    const nombreElemento = element.nombre || element.descripcion || 'este elemento';

    Swal.fire({
      title: `¿Deseas eliminar a ${nombreElemento}?`,
      text: "Sí eliminas, no se podrá revertir el cambio.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, Eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mservice.delete(element.id).subscribe({
          next: (data) => {
            console.log("Eliminado", data);
            Swal.fire({
              title: "Eliminado",
              text: "El elemento ha sido eliminado correctamente",
              icon: "success"
            });
            this.cargartabla();
          },
          error: (err) => {
            console.error("Error al eliminar", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el elemento",
              icon: "error"
            });
          }
        });
      }
    });
  }

}
