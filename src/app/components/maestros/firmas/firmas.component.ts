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
import { Firma } from '../../modelos/firma';
import { Column } from '../../modelos/column';

import { CargatablaService } from '../../../services/cargatabla.service';
import { AuthApiService, FirmaApiService } from '../../../core/api';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { FirmaComponent } from '../../dialog/docente/firma/firma.component';
import { FirmasdlgComponent } from '../../dialog/maestros/firmasdlg/firmasdlg.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-firmas',
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
  templateUrl: './firmas.component.html',
  styleUrl: './firmas.component.scss'
})
export class FirmasComponent {
  tablaDepartamento: Firma[] = [];

  columns: Column[] = [
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
    { columnDef: 'id', header: 'No.', cell: (element: Firma) => `${element.idLogin}` },
    { columnDef: 'dni', header: 'dni', cell: (element: Firma) => `${element.Login.dni}` },


  ];
  formulario?: FormGroup | any = null;
  dataSource = new MatTableDataSource<any>([]);

  titulo = "Firma";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly authApi: AuthApiService,
    private readonly firmaApi: FirmaApiService,
    private cartabla: ConversiontablaService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {

    this.titulos.emit(this.titulo);
  }
  ngOnInit(): void {
    //this.cargartabla();
    this.formulario = this.formBuilder.group({
      codigo: ['']
    });
  }

  info:any;
  ngAfterViewInit() {
    this.route.queryParams.subscribe((params: any) => {
      // const tipo = params['tipo'];
      let data = params['selectedRow'];

      this.authApi.obtenerPorDni(data).subscribe((dat: any) => {

        this.info = dat[0];
        data = dat[0];
        this.cargartabla().then(() => {
          this.buscar(data);
        });

      });

    });

  }
  async buscar(data: any) {
    if (this.tablaDepartamento.length == 0) {
      this.formulario?.setValue({ 'codigo': data.dni });
      this.dialogo();
      return;
    }

    const encontrado = this.tablaDepartamento.find(item => item.codigoDocente == data);

    if (encontrado) {
      this.formulario?.setValue({ 'codigo': data.dni });
      this.cartabla.dataSeleccionada = encontrado;
      this.editar(this.cartabla.dataSeleccionada);
    } else {
      this.formulario?.setValue({ 'codigo': data.dni });
      this.dialogo();
    }
  }
  async cargartabla() {
    try {
      const source$ = this.firmaApi.listar();
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
      title: 'No se pudo actualizar la lista de firmas',
      showConfirmButton: false,
      timer: 4000
    });
  }

  dialogo() {
    let laboral: any;
    this.firmaApi.obtenerPorDni(this.formulario?.value.codigo).subscribe((data: any) => {
      laboral = data;
      if (data.length > 0) {//verifica si existe el docente

        this.firmaApi.obtenerPorDni(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente

          if (data2.length == 0) {
            const dialogRef = this.dialog.open(FirmasdlgComponent, {
              width: '1100px',
              height: '700px',
              data: {
                title: `Agregar ${this.titulo}`,
                valores: { codigo: this.formulario?.value.codigo.dni, id: this.formulario?.value.id },
                modo: 0
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              //if (result) {
              this.cargartabla();
              // }
            });
          } else {
            this.editar(data2[0]);
          }

        });
        /* const dialogRef = this.dialog.open(LaboraldlgComponent, {
           width: '500px',
           height:'550px',
           data: {
             title: `Agregar ${this.titulo}`,
             valores:{},
             modo:0
           }
         });
         dialogRef.afterClosed().subscribe(result => {
           //if (result) {
             this.cargartabla();
          // }
         });*/
      }
      else {
        const dialogRef = this.dialog.open(FirmasdlgComponent, {
          width: '1100px',
          height: '700px',
          data: {
            title: `Agregar ${this.titulo}`,
            valores: { codigo: this.info.dni, id: this.info.id },
            modo: 0
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          //if (result) {
          this.cargartabla();
          // }
        });

      }
    });

    /*const dialogRef = this.dialog.open(LaboraldlgComponent, {
      width: '500px',
      height:'550px',
      data: {
        title: `Agregar ${this.titulo}`,
        valores:{},
        modo:0
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //if (result) {
        this.cargartabla();
     // }
    });*/
  }
  editar(element: any) {
    const dialogRef = this.dialog.open(FirmasdlgComponent, {
      width: '1100px',
      height: '700px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada?.id ? this.cartabla.dataSeleccionada.id : element.id,
          firma: this.cartabla.dataSeleccionada?.firma ? this.cartabla.dataSeleccionada.firma : element.firma,
          idLogin: this.cartabla.dataSeleccionada?.idLogin ? this.cartabla.dataSeleccionada.idLogin : element.idLogin,
          iniciales: this.cartabla.dataSeleccionada?.iniciales ? this.cartabla.dataSeleccionada.iniciales : element.iniciales,
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
    this.firmaApi.eliminar(element.id).subscribe(data => {
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }
}
