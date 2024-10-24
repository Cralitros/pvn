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
import { Provincia } from '../../modelos/provincia';
import { Column } from '../../modelos/column';

import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { ProvdlgComponent } from '../../dialog/maestros/provdlg/provdlg.component';

@Component({
  selector: 'app-provincia',
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
  templateUrl: './provincia.component.html',
  styleUrl: './provincia.component.scss'
})
export class ProvinciaComponent {
  tablaDepartamento:Provincia[]=[];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Provincia) => `${element.id}` },
    { columnDef: 'nombre', header: 'Nombre Provincia', cell: (element: Provincia) => `${element.nombre}` },
    { columnDef: 'valor', header: 'Valor', cell: (element: Provincia) => `${element.valor}` },
    { columnDef: 'Departamento', header: 'Departamento', cell: (element: Provincia) => `${element.Departamento?.nombre}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo="provincias";

  titulo="Provincias";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice:MaestrosserviceService,
    private cartabla:ConversiontablaService,
    public dialog: MatDialog
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
   }

  async cargartabla(){
    this.mservice.ponerurl("provincias");
    const source$ = this.mservice.get();
    const finalNumber:any = await lastValueFrom(source$);
  
    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento=this.cartabla.array;
    console.log(this.tablaDepartamento);
    
    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo(){
    const dialogRef = this.dialog.open(ProvdlgComponent, {
      width: '290px',
      height:'450px',
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
    const dialogRef = this.dialog.open(ProvdlgComponent, {
      width: '250px',
      height:'450px',
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 
          id: this.cartabla.dataSeleccionada.id,
          nombre:this.cartabla.dataSeleccionada.nombre,
          valor:this.cartabla.dataSeleccionada.valor,
          departamento_id:this.cartabla.dataSeleccionada.departamento_id,
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
      this.cargartabla();
    })
  }
}
