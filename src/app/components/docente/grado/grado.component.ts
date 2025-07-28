import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablaComponent } from '../../objetos/tabla/tabla.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Grado } from '../../modelos/grado';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { GradodlgComponent } from '../../dialog/docente/gradodlg/gradodlg.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-grado',
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
  templateUrl: './grado.component.html',
  styleUrl: './grado.component.scss'
})
export class GradoComponent {
  tablaDepartamento: Grado[] = [];

  @Input() codigo: any;

  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Grado) => `${element.id}` },
    { columnDef: 'codigo', header: 'Codigo Docente', cell: (element: Grado) => `${element.codigoDocente}` },
    { columnDef: 'grado', header: 'Grado', cell: (element: Grado) => this.separar_data(element.grado), cssClass: 'pre-formatted' }, // Añade esta propiedad  },
    /* { columnDef: 'revalidado', header: 'Revalidado', cell: (element: Grado) => `${element.revalidado}` },
     { columnDef: 'lugar_obtencion', header: 'Lugar obtencion', cell: (element: Grado) => `${element.lugar_obtencion}` },
     { columnDef: 'fecha_obtencion', header: 'Fecha obtencion', cell: (element: Grado) => `${element.fecha_obtencion}` },*/
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  formulario?: FormGroup | any = null;
  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);

  titulo = "Provincias";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice: MaestrosserviceService,
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

      console.log('Selected Row:', data);
      this.cargartabla().then(() => {
        this.buscar(data);
      });
    });

  }
  async buscar(data: any) {
    if (this.tablaDepartamento.length == 0) {
      this.formulario?.setValue({ 'codigo': data });
      //this.cartabla.dataSeleccionada = item;
      this.dialogo();

    }
    for (let item of await this.tablaDepartamento) {
      console.log(item);
      if (item.codigoDocente == data) {
        console.log("encontrado");
        this.formulario?.setValue({ 'codigo': data });
        this.cartabla.dataSeleccionada = item;
        console.log(this.cartabla.dataSeleccionada);
        this.editar(this.cartabla.dataSeleccionada);
        break;
      } else {
        this.formulario?.setValue({ 'codigo': data });
        this.cartabla.dataSeleccionada = item;
        this.dialogo();
      }

    }
  }
  async cargartabla() {
    this.mservice.ponerurl("docentesgrado");
    const source$ = this.mservice.get();
    const finalNumber: any = await lastValueFrom(source$);

    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento = this.cartabla.array;
    console.log(this.tablaDepartamento);

    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo() {
    let laboral: any;
    this.mservice.ponerurl("docentes/cod");
    this.mservice.getid(this.formulario?.value.codigo).subscribe((data: any) => {
      console.log("******************************************");

      console.log(data);
      laboral = data;
      if (data.length > 0) {//verifica si existe el docente

        this.mservice.ponerurl("docentesgrado");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);

          const dialogRef = this.dialog.open(GradodlgComponent, {
            width: '1000px',
            height: '750px',
            data: {
              title: `Agregar ${this.titulo}`,
              valores: { laboral },
              modo: 0
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            //if (result) {
            this.cargartabla();
            // }
          });


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
    console.log("******************************************");
    console.log(element);

    const dialogRef = this.dialog.open(GradodlgComponent, {
      width: '1000px',
      height: '750px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          grado: this.cartabla.dataSeleccionada.grado,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
          maximo_grado: this.cartabla.dataSeleccionada.maximo_grado,
          pais_grado: this.cartabla.dataSeleccionada.pais_grado,
          bgac: this.cartabla.dataSeleccionada.bgac,
          bga: this.cartabla.dataSeleccionada.bga,
          prestamoc: this.cartabla.dataSeleccionada.prestamoc,
          prestamo: this.cartabla.dataSeleccionada.prestamo,
          docente: element.Docente
          /* revalidado: this.cartabla.dataSeleccionada.revalidado,
           lugar_obtencion: this.cartabla.dataSeleccionada.lugar_obtencion,
           fecha_obtencion: this.cartabla.dataSeleccionada.fecha_obtencion,
           codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
           profesion: this.cartabla.dataSeleccionada.profesion,*/

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

  separar_data(elemento: any) {
    let dat_tojson = JSON.parse(elemento);
    //console.log(dat_tojson);
    let cadena = "";

    for (let i = 0; i < dat_tojson.length; i++) {
      cadena += `-Grado: ${dat_tojson[i].grade}\n-Titulo: ${dat_tojson[i].titulo}\n-Fecha: ${dat_tojson[i].fecha}\n-Lugar: ${dat_tojson[i].lugar}\n-Revalidado: ${dat_tojson[i].revalidado}\n----------------------------------\n`
    }
    return cadena;

  }

}
