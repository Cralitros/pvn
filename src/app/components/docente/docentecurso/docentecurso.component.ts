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
import { DocenteCurso } from '../../modelos/docentecurso';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { DocentecursodlgComponent } from '../../dialog/docente/docentecursodlg/docentecursodlg.component';
import { Aux1Service } from '../../../services/aux1.service';
import { Aux2Service } from '../../../services/aux2.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-docentecurso',
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
  templateUrl: './docentecurso.component.html',
  styleUrl: './docentecurso.component.scss'
})
export class DocentecursoComponent {
  tablaDepartamento: DocenteCurso[] = [];
/**id	fecha_inicio	fecha_fin	codigoDocente	codigoCurso	 */
  @Input() codigo: any;

  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: DocenteCurso) => `${element.id}` },
    { columnDef: 'fecha_inicio', header: 'Inicio curso', cell: (element: DocenteCurso) => `${element.fecha_inicio}` },
    { columnDef: 'fecha_fin', header: 'Fin curso', cell: (element: DocenteCurso) => `${element.fecha_fin}` },
    { columnDef: 'modalidad', header: 'Modalidad del curso', cell: (element: DocenteCurso) => `${element.modalidad}` },
    { columnDef: 'tipo', header: 'Tipo de curso', cell: (element: DocenteCurso) => `${element.tipo}` },
    { columnDef: 'tipo_clase', header: 'Tipo de clase', cell: (element: DocenteCurso) => `${element.tipo_clase}` },
    { columnDef: 'estado', header: 'Estado', cell: (element: DocenteCurso) => `${element.estado}` },
    { columnDef: 'codigoDocente', header: 'Codigo Docente', cell: (element: DocenteCurso) => `${element.codigoDocente}` },
    { columnDef: 'codigoCurso', header: 'Codigo Curso', cell: (element: DocenteCurso) => `${element.codigoCurso}` },
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
    private saux2: Aux2Service,
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
    this.mservice.ponerurl("docentescurso");
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
      console.log(data);
      laboral = data;
      if (data.length > 0) {//verifica si existe el docente

        this.saux2.ponerurl("docentescurso/docente");
        this.saux2.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);
          
            const dialogRef = this.dialog.open(DocentecursodlgComponent, {
              width: '500px',
              height: '550px',
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
      }
    });

  }
  editar(element: any) {
    /**id:string;
    fecha_inicio:string;
    fecha_fin:string;
    codigoDocente:string;
    codigoCurso:string; */
    const dialogRef = this.dialog.open(DocentecursodlgComponent, {
      width: '500px',
      height: '550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          fecha_inicio: this.cartabla.dataSeleccionada.fecha_inicio,
          fecha_fin: this.cartabla.dataSeleccionada.fecha_fin,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
          codigoCurso: this.cartabla.dataSeleccionada.codigoCurso,
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
