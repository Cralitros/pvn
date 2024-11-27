import { Component, EventEmitter, Output } from '@angular/core';
import { Departamento } from '../../modelos/departamento';
import { Column } from '../../modelos/column';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { lastValueFrom } from 'rxjs';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { TablaComponent } from '../../objetos/tabla/tabla.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DptdlgComponent } from '../../dialog/maestros/dptdlg/dptdlg.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departamento',
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
  templateUrl: './departamento.component.html',
  styleUrl: './departamento.component.scss'
})
export class DepartamentoComponent {
  tablaDepartamento:Departamento[]=[];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Departamento) => `${element.id}` },
    { columnDef: 'nombre', header: 'Nombre Departamento', cell: (element: Departamento) => `${element.nombre}` },
    { columnDef: 'valor', header: 'Valor', cell: (element: Departamento) => `${element.valor}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo="departamento";
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
    this.mservice.ponerurl("departamentos");
    const source$ = this.mservice.get();
    const finalNumber:any = await lastValueFrom(source$);
  
    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento=this.cartabla.array;
    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo(){
    const dialogRef = this.dialog.open(DptdlgComponent, {
      width: '290px',
      height:'350px',
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
    const dialogRef = this.dialog.open(DptdlgComponent, {
      width: '250px',
      height:'350px',
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 
          id: this.cartabla.dataSeleccionada.id,
          nombre:this.cartabla.dataSeleccionada.nombre,
          valor:this.cartabla.dataSeleccionada.valor,
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
    this.mservice.delete(element.id).subscribe(data=>{
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
