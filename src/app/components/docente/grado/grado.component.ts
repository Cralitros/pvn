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
import { Grado } from '../../modelos/grado';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { GradodlgComponent } from '../../dialog/docente/gradodlg/gradodlg.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grado',
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
  templateUrl: './grado.component.html',
  styleUrl: './grado.component.scss'
})
export class GradoComponent {
  tablaDepartamento: Grado[] = [];

  @Input() codigo: any;

  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Grado) => `${element.id}` },
    { columnDef: 'codigo', header: 'Codigo Docente', cell: (element: Grado) => `${element.codigoDocente}` },
    { columnDef: 'grado', header: 'Grado', cell: (element: Grado) => this.separar_data(element.grado), cssClass: 'pre-formatted' },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }
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
    this.route.queryParams.subscribe((params: any) => {
      const data = params['selectedRow'];
      console.log('Selected Row:', data);
      this.cargartabla().then(() => {
        this.buscar(data);
      });
    });
  }

  ngAfterViewInit() { }

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

      const dialogRef = this.dialog.open(GradodlgComponent, {
        width: '1200px',
        maxWidth: '95vw',
        height: '85vh',
        maxHeight: '90vh',
        panelClass: 'grados-dialog',
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
    return this.tablaDepartamento.some(item => item.codigoDocente == codigo);
  }

  async cargartabla() {
    this.mservice.ponerurl("docentesgrado");
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
      console.log("******************************************");
      console.log(data);
      laboral = data;
      if (data.length > 0) {
        this.mservice.ponerurl("docentesgrado");
        this.mservice.getid(this.formulario?.value.codigo ? this.formulario?.value.codigo : 0).subscribe((data2: any) => {
          console.log(data2);

          const dialogRef = this.dialog.open(GradodlgComponent, {
            width: '1200px',
            maxWidth: '95vw',
            height: '85vh',
            maxHeight: '90vh',
            panelClass: 'grados-dialog',
            data: {
              title: `Agregar ${this.titulo}`,
              valores: {
                laboral: laboral,
                docente: laboral[0]
              },
              modo: 0
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            this.cargartabla();
          });
        });
      } else {
        Swal.fire('Error', 'El código de docente no existe', 'error');
      }
    });
  }

  editar(element: any) {
    console.log("******************************************");
    console.log(element);

    const dialogRef = this.dialog.open(GradodlgComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '85vh',
      maxHeight: '90vh',
      panelClass: 'grados-dialog',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          grado: this.cartabla.dataSeleccionada.grado,
          codigoDocente: this.cartabla.dataSeleccionada.codigoDocente,
          maximo_grado: this.cartabla.dataSeleccionada.maximo_grado,
          pais_grado: this.cartabla.dataSeleccionada.pais_grado,
          bgac: this.cartabla.dataSeleccionada.bgac,
          bga: this.cartabla.dataSeleccionada.bga,
          prestamoc: this.cartabla.dataSeleccionada.prestamoc,
          prestamo: this.cartabla.dataSeleccionada.prestamo,
          docente: element.Docente || element.docente
        },
        modo: 1
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.cargartabla();
    });
  }

  eliminar(element: any) {
    console.log("dep", element);
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente el registro',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mservice.delete(element.id).subscribe(data => {
          console.log("Eliminado");
          Swal.fire('Eliminado', 'El registro ha sido eliminado', 'success');
          this.cargartabla();
        });
      }
    });
  }

  // ✅ Método separar_data corregido para manejar el nuevo formato
  separar_data(elemento: any): string {
    if (!elemento) return '';

    let dat_tojson: any[] = [];

    // Manejar diferentes formatos de entrada
    if (typeof elemento === 'string') {
      try {
        // Limpiar caracteres de escape si es necesario
        const cleaned = elemento.replace(/\\"/g, '"');
        dat_tojson = JSON.parse(cleaned);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return 'Error al cargar datos';
      }
    } else if (Array.isArray(elemento)) {
      dat_tojson = elemento;
    } else {
      return '';
    }

    if (!dat_tojson.length) return '';

    let cadena = "";

    for (let i = 0; i < dat_tojson.length; i++) {
      const grado = dat_tojson[i];

      // Formatear fechas correctamente
      const formatFecha = (fecha: any): string => {
        if (!fecha) return 'No registrada';
        try {
          const date = new Date(fecha);
          if (isNaN(date.getTime())) return fecha;
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } catch {
          return fecha;
        }
      };

      cadena += `🎓 Grado: ${grado.grade || 'No especificado'}\n`;
      cadena += `📜 Título: ${grado.titulo || 'No especificado'}\n`;
      cadena += `📅 Fecha: ${formatFecha(grado.fecha)}\n`;
      cadena += `🏛️ Institución: ${grado.lugar || 'No especificada'}\n`;
      cadena += `🌍 País: ${grado.pais || 'No especificado'}\n`;
      cadena += `✅ SUNEDU: ${grado.revalidado ? 'Sí' : 'No'}\n`;
      if (grado.fechaRevalidado) {
        cadena += `📅 Fecha Revalidación: ${formatFecha(grado.fechaRevalidado)}\n`;
      }
      cadena += `─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n`;
    }

    return cadena;
  }
}