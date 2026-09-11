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
import { Column } from '../../modelos/column';
import { Programa } from '../../modelos/programa';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ProgramaApiService } from '../../../core/api';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { ProgramasdlgComponent } from '../../dialog/maestros/programasdlg/programasdlg.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-programa',
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
  templateUrl: './programa.component.html',
  styleUrl: './programa.component.scss'
})
export class ProgramaComponent {
  tablaDepartamento:Programa[]=[];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Programa) => `${element.id}` },
    { columnDef: 'programa', header: 'Nombre Programa', cell: (element: Programa) => `${element.programa}` },
    { columnDef: 'gestor', header: 'Nombre Gestor', cell: (element: Programa) => `${element.gestor}` },
    { columnDef: 'escuela', header: 'Escuela', cell: (element: Programa) => `${element.Escuela?.nombre}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo="programa";
  titulo="Programas";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly programaApi: ProgramaApiService,
    private cartabla:ConversiontablaService,
    public dialog: MatDialog
  ) {

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
    try {
      const source$ = this.programaApi.listar();
      const finalNumber:any = await lastValueFrom(source$);

      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento=this.cartabla.array;

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
      title: 'No se pudo actualizar la lista de programas',
      showConfirmButton: false,
      timer: 4000
    });
  }
  dialogo(){
    const dialogRef = this.dialog.open(ProgramasdlgComponent, {
      width: '700px',
      height:'750px',
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
  editar(element: any){
    
    const dialogRef = this.dialog.open(ProgramasdlgComponent, {
      width: '700px',
      height:'750px',
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 
          
          id:this.cartabla.dataSeleccionada.id,
          facultad: this.cartabla.dataSeleccionada.Escuela.Facultad,
          programa:this.cartabla.dataSeleccionada.programa,
          gestor:this.cartabla.dataSeleccionada.gestor,
          escuela:this.cartabla.dataSeleccionada.Escuela.id,
          director:this.cartabla.dataSeleccionada.director,
          inicio:this.cartabla.dataSeleccionada.inicio,
          fin:this.cartabla.dataSeleccionada.fin,
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
    this.programaApi.eliminar(element.id).subscribe(data=>{
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }

}
