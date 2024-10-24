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
import { Plan } from '../../modelos/plan';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlandlgComponent } from '../../dialog/maestros/plandlg/plandlg.component';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatRadioModule,
    MatCheckboxModule,
    TablaComponent
],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss'
})
export class PlanComponent {
  tablaDepartamento:Plan[]=[];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Plan) => `${element.id}` },
    { columnDef: 'nombre', header: 'Nombre Departamento', cell: (element: Plan) => `${element.nombre}` },
    { columnDef: 'nivel_academico', header: 'Nivel académico', cell: (element: Plan) => `${element.nivel_academico}` },
    { columnDef: 'vigencia', header: 'Vigencia', cell: (element: Plan) => `${element.vigencia}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo="plan";
  titulo="Plan";

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
    this.mservice.ponerurl("plan");
    const source$ = this.mservice.get();
    const finalNumber:any = await lastValueFrom(source$);
  
    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento=this.cartabla.array;
    this.sctabla.setData(this.tablaDepartamento);
  }
  dialogo(){
    const dialogRef = this.dialog.open(PlandlgComponent, {
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
    const dialogRef = this.dialog.open(PlandlgComponent, {
      width: '250px',
      height:'350px',
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 
          id: this.cartabla.dataSeleccionada.id,
          nombre:this.cartabla.dataSeleccionada.nombre,
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
