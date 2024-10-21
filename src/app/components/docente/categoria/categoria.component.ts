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
import { Categoria } from '../../modelos/categoria';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { CategoriadlgComponent } from '../../dialog/docente/categoriadlg/categoriadlg.component';

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
    { columnDef: 'fecha', header: 'Fecha', cell: (element: Categoria) => `${element.fecha}` },
    { columnDef: 'categoria', header: 'Categoria', cell: (element: Categoria) => `${element.categoria}` },
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

  titulo = "Provincias";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice: MaestrosserviceService,
    private cartabla: ConversiontablaService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
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

  async cargartabla() {
    this.mservice.ponerurl("docentescategoria");
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
      console.log("categoria");
      
      laboral = data;
      if (data[0].DocenteCategoria.length == 0) {//verifica si existe el docente

        this.mservice.ponerurl("docentescategoria");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);

          const dialogRef = this.dialog.open(CategoriadlgComponent, {
            width: '500px',
            height: '750px',
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
      width: '500px',
      height: '750px',
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
          ratificado:this.cartabla.dataSeleccionada.ratificado,
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
    this.mservice.delete(element.codigoDocente).subscribe(data => {
      console.log("Eliminado");
      this.cargartabla();
    })
  }

}
