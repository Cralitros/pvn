import { Component, EventEmitter, Output } from '@angular/core';
import { Personal } from '../../modelos/personal';
import { Column } from '../../modelos/column';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { DocenteApiService, ProvinciaApiService } from '../../../core/api';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { PersonaldlgComponent } from '../../dialog/docente/personaldlg/personaldlg.component';
import { TablaComponent } from "../../objetos/tabla/tabla.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-personal',
    standalone: true,
    templateUrl: './personal.component.html',
    styleUrl: './personal.component.scss',
    imports: [TablaComponent,
      CommonModule,
      MatCardModule,
      MatFormFieldModule,
      ReactiveFormsModule,
      MatInputModule,
      MatButtonModule,
      MatPaginatorModule, 
      MatTableModule
    ]
})
export class PersonalComponent {
  tablaDepartamento:Personal[]=[];
  tablaDepartamento2:Personal[]=[];
  tipo="docentes";

  columns: Column[] = [
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
    { columnDef: 'codigo', header: 'Codigo', cell: (element: Personal) => `${element.codigo}` },
    { columnDef: 'digito', header: 'Digito', cell: (element: Personal) => `${element.digito}` },
    { columnDef: 'dni', header: 'DNI', cell: (element: Personal) => `${element.dni}` },
    { columnDef: 'nombres', header: 'Nombres', cell: (element: Personal) => `${element.nombres}` },
    { columnDef: 'apellidos', header: 'Apellidos', cell: (element: Personal) => `${element.apellidos}` },
    { columnDef: 'sexo', header: 'Sexo', cell: (element: Personal) => `${element.sexo}` },
    { columnDef: 'domicilio', header: 'Domicilio', cell: (element: Personal) => `${element.domicilio}` },
    { columnDef: 'telefono', header: 'Telefono', cell: (element: Personal) => `${element.telefono}` },
    { columnDef: 'estado_civil', header: 'Estado civil', cell: (element: Personal) => `${element.estado_civil}` },
    { columnDef: 'numero_hijos', header: 'Numero hijos', cell: (element: Personal) => `${element.numero_hijos}` },
    //{ columnDef: 'nacionalidad', header: 'Nacionalidad', cell: (element: Personal) => `${element.nacionalidad}` },
    { columnDef: 'ruc', header: 'RUC', cell: (element: Personal) => `${element.ruc}` },
    { columnDef: 'pasaporte', header: 'Pasaporte', cell: (element: Personal) => `${element.pasaporte}` },
    { columnDef: 'fecha_nacimiento', header: 'Fecha nacimiento', cell: (element: Personal) => `${element.fecha_nacimiento}` },
    { columnDef: 'lugar_nacimiento', header: 'Lugar nacimiento', cell: (element: Personal) => `${element.lugarNacimiento.departamento}, ${element.lugarNacimiento.provincia}, ${element.lugarNacimiento.distrito}` },
    { columnDef: 'banco', header: 'Banco', cell: (element: Personal) => `${element.banco}` },
    { columnDef: 'cuenta', header: 'Cuenta o CCI', cell: (element: Personal) => `${element.cuenta}` },
    { columnDef: 'afp', header: 'AFP', cell: (element: Personal) => `${element.afp}` },
    { columnDef: 'cussp', header: 'CUSSP', cell: (element: Personal) => `${element.cussp}` },
    { columnDef: 'afiliacion', header: 'Afiliacion', cell: (element: Personal) => `${element.afiliacion}` },
    { columnDef: 'fecha_cv', header: 'Fecha_cv', cell: (element: Personal) => `${element.fecha_cv}` },
    { columnDef: 'especialidad', header: 'Especialidad', cell: (element: Personal) => `${element.especialidad}` },
    { columnDef: 'observaciones', header: 'Observaciones', cell: (element: Personal) => `${element.observaciones}` },
    
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);

  titulo="Docentes Personal";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly docenteApi: DocenteApiService,
    private readonly provinciaApi: ProvinciaApiService,
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
      const source$ = this.docenteApi.listar();
      const finalNumber:any = await lastValueFrom(source$);
  
      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento=this.cartabla.array;
      //this.tablaDepartamento2=this.tablaDepartamento;

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
      title: 'No se pudo actualizar la tabla',
      showConfirmButton: false,
      timer: 4000
    });
  }
  dialogo(){
    const dialogRef = this.dialog.open(PersonaldlgComponent, {
      width: '90vw',
      height:'90vw',
      maxWidth: '100vw',
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
    const dialogRef = this.dialog.open(PersonaldlgComponent, {
      width: '70vw',
      height:'10hv',
      
      data: {
        title: `Editar ${this.titulo}`,
        valores:{ 

          codigo: this.cartabla.dataSeleccionada.codigo,
          nombres: this.cartabla.dataSeleccionada.nombres,
          apellidos: this.cartabla.dataSeleccionada.apellidos,
          digito: this.cartabla.dataSeleccionada.digito,
          domicilio:this.cartabla.dataSeleccionada.domicilio,
          telefono: this.cartabla.dataSeleccionada.telefono,
          celular: this.cartabla.dataSeleccionada.celular,
          estado_civil: this.cartabla.dataSeleccionada.estado_civil,
          numero_hijos: this.cartabla.dataSeleccionada.numero_hijos,
          nacionalidad: this.cartabla.dataSeleccionada.Nacionalidad,
          sexo:this.cartabla.dataSeleccionada.sexo,
          dni: this.cartabla.dataSeleccionada.dni,
          pasaporte:this.cartabla.dataSeleccionada.pasaporte,
          fecha_nacimiento:this.cartabla.dataSeleccionada.fecha_nacimiento,
          fallecimiento: this.cartabla.dataSeleccionada.fallecimiento,
          fecha_fallecimiento: this.cartabla.dataSeleccionada.fecha_fallecimiento,
          lugar_nacimiento: this.cartabla.dataSeleccionada.lugar_nacimiento,
          lugarNacimiento: this.cartabla.dataSeleccionada.lugarNacimiento,
          banco:this.cartabla.dataSeleccionada.banco,
          cuenta: this.cartabla.dataSeleccionada.cuenta,
          afp: this.cartabla.dataSeleccionada.afp,
          cussp: this.cartabla.dataSeleccionada.cussp,
          afiliacion: this.cartabla.dataSeleccionada.afiliacion,
          fecha_cv: this.cartabla.dataSeleccionada.fecha_cv,
          ruc: this.cartabla.dataSeleccionada.ruc,
          observaciones: this.cartabla.dataSeleccionada.observaciones,
          especialidad:this.cartabla.dataSeleccionada.especialidad
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
    this.docenteApi.eliminar(element.codigo).subscribe(data=>{
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }
  convertir_data(data:any){
    let js=JSON.parse(data);
    this.provinciaApi.obtenerPorDepartamento(js.provincia).subscribe(()=>{

    })

  }

}
