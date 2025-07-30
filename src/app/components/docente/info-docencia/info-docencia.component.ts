import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { InfoDocencia } from '../../modelos/infodocencia';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { InfodocenciadlgComponent } from '../../dialog/docente/infodocenciadlg/infodocenciadlg.component';
import { TablaComponent } from "../../objetos/tabla/tabla.component";


@Component({
  selector: 'app-info-docencia',
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
    TablaComponent
],
  templateUrl: './info-docencia.component.html',
  styleUrl: './info-docencia.component.scss'
})
export class InfoDocenciaComponent {
   tablaInfoDocencia: InfoDocencia[] = [];

   /*
   categoria:string;
    dedicacion:string;
    inicio_dictado:Date;
    fin_dictado:Date;
    modo_ingreso:string;
    departamento:string;
    lugar_dictado:string;
    pais_dictado:string;
    dias_extranjero:string;
    labor_administrativa:string;
    rol_anterior:string;
    comisiones:string;
    emision_carne:Date;
    prestamos:string;
    sanciones:string;
    observadap:string;
    historico:string;
    felicitacion:string;
    */
    columns: Column[] = [
      { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },  // Columna de acciones
      { columnDef: 'id', header: 'No.', cell: (element: InfoDocencia) => `${element.id}` },
      { columnDef: 'categoria', header: 'Categoria', cell: (element: InfoDocencia) => `${element.categoria}` },
      { columnDef: 'dedicacion', header: 'Dedicacion', cell: (element: InfoDocencia) => `${element.dedicacion}` },
      { columnDef: 'inicio_dictado', header: 'Inicio Dictado', cell: (element: InfoDocencia) => `${element.inicio_dictado}` },
      { columnDef: 'fin_dictado', header: 'Fin dictado', cell: (element: InfoDocencia) => `${element.fin_dictado}` },
      { columnDef: 'modo_ingreso', header: 'Modo ingreso', cell: (element: InfoDocencia) => `${element.modo_ingreso}` },
      { columnDef: 'lugar_dictado', header: 'Lugar dictado', cell: (element: InfoDocencia) => `${element.lugar_dictado}` },
      { columnDef: 'labor_administrativa', header: 'Labor Adminsitrativa', cell: (element: InfoDocencia) => `${element.labor_administrativa}` },
      { columnDef: 'rol_anterior', header: 'Rol Anterior', cell: (element: InfoDocencia) => `${element.rol_anterior}` },
      { columnDef: 'comisiones', header: 'Comisiones', cell: (element: InfoDocencia) => `${element.comisiones}` },
    ];
    formulario?: FormGroup | any = null;
    departamentoForm: FormGroup;
    dataSource = new MatTableDataSource<any>([]);
  
    titulo = "Info Docencia";
  
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
      console.log(this.tablaInfoDocencia);
  
      sctabla.setData(this.tablaInfoDocencia);
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
      if (this.tablaInfoDocencia.length == 0) {
        this.formulario?.setValue({ 'codigo': data });
        //this.cartabla.dataSeleccionada = item;
        this.dialogo();
  
      }
      for (let item of await this.tablaInfoDocencia) {
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
      this.mservice.ponerurl("docentesinfo");
      const source$ = this.mservice.get();
      const finalNumber: any = await lastValueFrom(source$);
  
      this.cartabla.ponerdata(finalNumber);
      this.tablaInfoDocencia = this.cartabla.array;
      console.log(this.tablaInfoDocencia);
  
      this.sctabla.setData(this.tablaInfoDocencia);
    }
    dialogo() {
      let laboral: any;
      this.mservice.ponerurl("docentes/cod");
      this.mservice.getid(this.formulario?.value.codigo).subscribe((data: any) => {
        console.log(data);
        laboral = data;
        if (data.length > 0) {//verifica si existe el docente
  
          this.mservice.ponerurl("docentesinfo/cod");
          this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {//verifica si existe registro del docente
            console.log(data2);
            if (data2.length == 0) {
              const dialogRef = this.dialog.open(InfodocenciadlgComponent, {
                width: '800px',
                height: '900px',
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
      const dialogRef = this.dialog.open(InfodocenciadlgComponent, {
        width: '800px',
        height: '900px',
        data: {
          title: `Editar ${this.titulo}`,
          valores: {
            id: this.cartabla.dataSeleccionada.id,
            categoria: this.cartabla.dataSeleccionada.categoria,
            dedicacion: this.cartabla.dataSeleccionada.dedicacion,
            inicio_dictado: this.cartabla.dataSeleccionada.inicio_dictado,
            fin_dictado: this.cartabla.dataSeleccionada.fin_dictado,
            modo_ingreso: this.cartabla.dataSeleccionada.modo_ingreso,
            departamento: this.cartabla.dataSeleccionada.departamento,
            lugar_dictado: this.cartabla.dataSeleccionada.lugar_dictado,
            pais_dictado: this.cartabla.dataSeleccionada.pais_dictado,
            dias_extranjero: this.cartabla.dataSeleccionada.dias_extranjero,
            labor_administrativa: this.cartabla.dataSeleccionada.labor_administrativa,
            rol_anterior: this.cartabla.dataSeleccionada.rol_anterior,
            comisiones: this.cartabla.dataSeleccionada.comisiones,
            emision_carne: this.cartabla.dataSeleccionada.emision_carne,
            prestamos: this.cartabla.dataSeleccionada.prestamos,
            sanciones: this.cartabla.dataSeleccionada.sanciones,
            observadap: this.cartabla.dataSeleccionada.observadap,
            historico: this.cartabla.dataSeleccionada.historico,
            felicitacion: this.cartabla.dataSeleccionada.felicitacion,
            codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
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
