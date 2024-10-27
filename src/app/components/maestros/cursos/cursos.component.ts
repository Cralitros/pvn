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
import { Curso } from '../../modelos/cursos';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { CursosdlgComponent } from '../../dialog/maestros/cursosdlg/cursosdlg.component';

@Component({
  selector: 'app-cursos',
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
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss'
})
export class CursosComponent {

  tablaDepartamento:Curso[]=[];
  columns: Column[] = [
    { columnDef: 'codigo', header: 'Codigo', cell: (element: Curso) => `${element.codigo}` },
    { columnDef: 'nombre', header: 'Nombre Curso', cell: (element: Curso) => `${element.nombre}` },
    { columnDef: 'semestre', header: 'Semestre Curso', cell: (element: Curso) => `${element.semestre}` },
    { columnDef: 'nivel', header: 'Nivel', cell: (element: Curso) => `${element.nivel}` },
    { columnDef: 'creditos', header: 'Creditos', cell: (element: Curso) => `${element.creditos}` },
    { columnDef: 'programa', header: 'Programa', cell: (element: Curso) => `${element.Programa.programa}` },
    { columnDef: 'plan', header: 'Plan', cell: (element: Curso) => `${element.Plan.nombre}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo="curso";
  titulo="Departamentos";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice:MaestrosserviceService,
    private cartabla:ConversiontablaService,
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

  async cargartabla(){
    this.mservice.ponerurl("curso");
    const source$ = this.mservice.get();
    const finalNumber:any = await lastValueFrom(source$);
  
    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento=this.cartabla.array;
    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo(){
    const dialogRef = this.dialog.open(CursosdlgComponent, {
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
    });
  }
    /*codigo	nombre	semestre	nivel	creditos	programa	escuela */
  editar(element: any){
    console.log(this.cartabla.dataSeleccionada);
    console.log(element);
    
    
    const dialogRef = this.dialog.open(CursosdlgComponent, {
      width: '500px',
      height:'550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 
          codigo: this.cartabla.dataSeleccionada.codigo,
          nombre:this.cartabla.dataSeleccionada.nombre,
          semestre:this.cartabla.dataSeleccionada.semestre,
          nivel:this.cartabla.dataSeleccionada.nivel,
          programa:this.cartabla.dataSeleccionada.Programa,
          plan:this.cartabla.dataSeleccionada.Plan,
          creditos:this.cartabla.dataSeleccionada.creditos,
        },
        modo:1     
      }
    });
    dialogRef.afterClosed().subscribe(result => {
     // if (result) {
        this.cargartabla();
    //  }
    });

  }
  eliminar(element: any){
    console.log("dep",element);
    this.mservice.delete(element.codigo).subscribe(data=>{
      console.log("Eliminado");
      this.cargartabla();
    })
  }

}
