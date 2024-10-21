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
import { Laboral } from '../../modelos/laboral';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { LaboraldlgComponent } from '../../dialog/docente/laboraldlg/laboraldlg.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Personal } from '../../modelos/personal';

@Component({
  selector: 'app-laboral',
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
  templateUrl: './laboral.component.html',
  styleUrl: './laboral.component.scss'
})
export class LaboralComponent {
  tablaDepartamento: Laboral[] = [];

  columns: Column[] = [
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
    { columnDef: 'id', header: 'No.', cell: (element: Laboral) => `${element.id}` },
    { columnDef: 'codigoDocente', header: 'Codigo docente', cell: (element: Laboral) => `${element.codigoDocente}` },
    { columnDef: 'trabajo', header: 'Trabajo', cell: (element: Laboral) => `${element.trabajo}` },
    { columnDef: 'cargo_actual', header: 'Cargo actual', cell: (element: Laboral) => `${element.cargo_actual}` },
    { columnDef: 'tipo_empresa', header: 'Tipo empresa', cell: (element: Laboral) => `${element.tipo_empresa}` },
    { columnDef: 'direccion_empresa', header: 'Direccion empresa', cell: (element: Laboral) => `${element.direccion_empresa}` },
    { columnDef: 'telefono_empresa', header: 'Telefono empresa', cell: (element: Laboral) => `${element.telefono_empresa}` },
    { columnDef: 'correo_corporativo', header: 'Correo corporativo', cell: (element: Laboral) => `${element.correo_corporativo}` },
    { columnDef: 'correo_personal', header: 'Correo personal', cell: (element: Laboral) => `${element.correo_personal}` },
    { columnDef: 'correo_alternativo', header: 'Correo alternativo', cell: (element: Laboral) => `${element.correo_alternativo}` },
    { columnDef: 'contacto', header: 'Contacto', cell: (element: Laboral) => `${element.contacto}` },

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
    //this.cargartabla();
    this.formulario = this.formBuilder.group({
      codigo: ['']
    });
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params:any) => {
     // const tipo = params['tipo'];
      const data = params['selectedRow'];
  
      console.log('Selected Row:', data);
      this.cargartabla().then(() => {
        this.buscar(data);
      });
    });
    
  }
  async cargartabla() {
    this.mservice.ponerurl("docenteslaboral");
    const source$ = this.mservice.get();
    const finalNumber: any = await lastValueFrom(source$);

    this.cartabla.ponerdata(finalNumber);
    this.tablaDepartamento = this.cartabla.array;
    console.log(this.tablaDepartamento);

    this.sctabla.setData(this.tablaDepartamento);
  }
  async buscar(data:any){
    for(let item of await this.tablaDepartamento ){
      console.log(item);
      if(item.codigoDocente== data){
        console.log("encontrado");
        this.formulario?.setValue({'codigo':data});
        this.cartabla.dataSeleccionada=item;
        console.log(this.cartabla.dataSeleccionada);
        this.editar(this.cartabla.dataSeleccionada);
        break;
      }
      
    }
  }
  dialogo() {
    let laboral: any;
    this.mservice.ponerurl("docentes/cod");
    this.mservice.getid(this.formulario?.value.codigo).subscribe((data: any) => {
      console.log(data);
      laboral = data;
      if (data.length > 0) {//verifica si existe el docente

        this.mservice.ponerurl("docenteslaboral/cod");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
          console.log(data2);
          console.log("viendo");

          if (data2.length == 0) {
            const dialogRef = this.dialog.open(LaboraldlgComponent, {
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
    const dialogRef = this.dialog.open(LaboraldlgComponent, {
      width: '500px',
      height: '550px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          trabajo: this.cartabla.dataSeleccionada.trabajo,
          cargo_actual: this.cartabla.dataSeleccionada.cargo_actual,
          tipo_empresa: this.cartabla.dataSeleccionada.tipo_empresa,
          direccion_empresa: this.cartabla.dataSeleccionada.direccion_empresa,
          telefono_empresa: this.cartabla.dataSeleccionada.telefono_empresa,
          correo_corporativo: this.cartabla.dataSeleccionada.correo_corporativo,
          correo_personal: this.cartabla.dataSeleccionada.correo_personal,
          correo_alternativo: this.cartabla.dataSeleccionada.correo_alternativo,
          contacto: this.cartabla.dataSeleccionada.contacto,
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
      this.cargartabla();
    })
  }

}
