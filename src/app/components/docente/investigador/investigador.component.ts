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
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { InvestigadlgComponent } from '../../dialog/docente/investigadlg/investigadlg.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

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
    { columnDef: 'contenido', header: 'Contenido', cell: (element: Investigador) => `${element.contenido}` },
  ];
  formulario?: FormGroup | any = null;
  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);

  titulo = "Investigador";

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
    console.log("************");
    console.log(this.tablaDepartamento);

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
    this.mservice.ponerurl("docentesinvestiga");
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

        this.mservice.ponerurl("docentesinvestiga/cod");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);
          if (data2.length == 0) {
            const dialogRef = this.dialog.open(InvestigadlgComponent, {
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
          }

        });
      }
    });
  }
  editar(element: any) {
    const dialogRef = this.dialog.open(InvestigadlgComponent, {
      width: '500px',
      height: '550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          orcid: this.cartabla.dataSeleccionada.orcid,
          renacyt: this.cartabla.dataSeleccionada.renacyt,
          grupo: this.cartabla.dataSeleccionada.grupo,
          nivel: this.cartabla.dataSeleccionada.nivel,
          registro: this.cartabla.dataSeleccionada.registro,
          rol: this.cartabla.dataSeleccionada.rol,
          reconocimiento: this.cartabla.dataSeleccionada.reconocimiento,
          contenido: this.cartabla.dataSeleccionada.contenido,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente
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
