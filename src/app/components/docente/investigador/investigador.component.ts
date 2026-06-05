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
  // ✅ Método principal corregido
  async abrirDialogoLaboral(): Promise<void> {
    const codigo = this.formulario?.value.codigo;
    if (!codigo) {
      Swal.fire('Atención', 'Por favor ingrese un código de docente primero.', 'warning');
      return;
    }

    if (this.tablaDepartamento.length === 0) {
      await this.cargartabla();
    }

    // ✅ Usar conversión explícita con String() global o template literals
    const encontrado = this.tablaDepartamento.find(
      item => `${item.codigoDocente}` === `${codigo}`
    );

    if (encontrado) {
      this.cartabla.dataSeleccionada = encontrado;
      this.editar(encontrado);
    } else {
      await this.crearNuevo(codigo);
    }
  }

  private async crearNuevo(codigo: string): Promise<void> {
    try {
      this.mservice.ponerurl("docentes/cod");
      const docenteData: any = await lastValueFrom(this.mservice.getid(codigo));

      if (!docenteData || (Array.isArray(docenteData) && docenteData.length === 0)) {
        Swal.fire('Error', 'El código de docente no existe en el sistema.', 'error');
        return;
      }

      const docenteInfo = Array.isArray(docenteData) ? docenteData[0] : docenteData;

      const dialogRef = this.dialog.open(InvestigadlgComponent, {
        width: '750px',
        height: '700px',
        data: {
          title: `Agregar ${this.titulo}`,
          valores: {
            laboral: docenteData,
            docente: docenteInfo
          },
          modo: 0
        }
      });

      dialogRef.afterClosed().subscribe(() => this.cargartabla());
    } catch (error) {
      console.error('Error al verificar docente:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
  }

  async buscar(data: any) {
    this.formulario?.setValue({ 'codigo': data });
    await this.abrirDialogoLaboral();
  }
  existeRegistro(): boolean {
    const codigo = this.formulario?.value.codigo;
    // Usamos == para comparar sin importar si viene como número o texto
    return this.tablaDepartamento.some(item => item.codigoDocente == codigo);
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
    const dialogRef = this.dialog.open(InvestigadlgComponent, {
      width: '800px',
      height: '900px',
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
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
          ri: this.cartabla.dataSeleccionada.ri,
          pibpdu: this.cartabla.dataSeleccionada.pibpdu,
          gadi: this.cartabla.dataSeleccionada.gadi,
          sei: this.cartabla.dataSeleccionada.sei,
          gadd: this.cartabla.dataSeleccionada.gadd,
          gadit: this.cartabla.dataSeleccionada.gadit,
          dfi: this.cartabla.dataSeleccionada.dfi,
          docente: this.cartabla.dataSeleccionada.Docente,
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
