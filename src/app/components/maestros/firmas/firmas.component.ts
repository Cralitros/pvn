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
import { firma } from '../../modelos/firma';
import { Column } from '../../modelos/column';

import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
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
  tablaDepartamento: firma[] = [];

  columns: Column[] = [
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
    { columnDef: 'id', header: 'No.', cell: (element: firma) => `${element.id}` },


  ];
  formulario?: FormGroup | any = null;
  dataSource = new MatTableDataSource<any>([]);

  titulo = "Firma";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice: MaestrosserviceService,
    private cartabla: ConversiontablaService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {

    this.cargartabla();

    this.titulos.emit(this.titulo);
  }
  ngOnInit(): void {
    //this.cargartabla();
    this.formulario = this.formBuilder.group({
      codigo: ['']
    });
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params: any) => {
      // const tipo = params['tipo'];
      const data = params['selectedRow'];

      console.log('Selected Row:', data);
      this.cargartabla().then(() => {
        this.buscar(data);
      });
    });

  }
  async buscar(data: any) {
    if (this.tablaDepartamento.length == 0) {
      this.formulario?.setValue({ 'codigo': data });
      this.dialogo();
      return;
    }

    const encontrado = this.tablaDepartamento.find(item => item.codigoDocente == data);

    if (encontrado) {
      console.log("encontrado");
      this.formulario?.setValue({ 'codigo': data });
      this.cartabla.dataSeleccionada = encontrado;
      console.log(this.cartabla.dataSeleccionada);
      this.editar(this.cartabla.dataSeleccionada);
    } else {
      this.formulario?.setValue({ 'codigo': data });
      this.dialogo();
    }
  }
  async cargartabla() {
    this.mservice.ponerurl("firma");
    const source$ = this.mservice.get();
    const finalNumber: any = await lastValueFrom(source$);

    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento = this.cartabla.array;
    console.log(this.tablaDepartamento);

    this.sctabla.setData(this.tablaDepartamento);
  }

  dialogo() {
    let laboral: any;
    this.mservice.ponerurl("firma");
    this.mservice.getid(this.formulario?.value.codigo).subscribe((data: any) => {
      console.log(data);
      laboral = data;
      if (data.length > 0) {//verifica si existe el docente

        this.mservice.ponerurl("firma");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);
          console.log("viendo");

          if (data2.length == 0) {
            const dialogRef = this.dialog.open(FirmasdlgComponent, {
              width: '500px',
              height: '550px',
              data: {
                title: `Agregar ${this.titulo}`,
                valores: { codigo:this.formulario?.value.codigo  },
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
      else{
        const dialogRef = this.dialog.open(FirmasdlgComponent, {
              width: '500px',
              height: '550px',
              data: {
                title: `Agregar ${this.titulo}`,
                valores: { codigo:this.formulario?.value.codigo  },
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
      width: '500px',
      height: '550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          trabajo: this.cartabla.dataSeleccionada.trabajo,
          cargo_actual: this.cartabla.dataSeleccionada.cargo_actual,
          tipo_empresa: this.cartabla.dataSeleccionada.tipo_empresa,
          direccion_empresa: this.cartabla.dataSeleccionada.direccion_empresa,
          telefono_empresa: this.cartabla.dataSeleccionada.telefono_empresa,
          correo_corporativo: this.cartabla.dataSeleccionada.correo_corporativo,
          correo_personal: this.cartabla.dataSeleccionada.correo_personal,
          correo_alternativo: this.cartabla.dataSeleccionada.correo_alternativo,
          contacto: this.cartabla.dataSeleccionada.contacto,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
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
    console.log("dep", element);
    this.mservice.delete(element.id).subscribe(data => {
      console.log("Eliminado");
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }
}
