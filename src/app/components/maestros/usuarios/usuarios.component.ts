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
import { Usuario } from '../../modelos/usuario';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { AuthApiService } from '../../../core/api';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { UsuariosdlgComponent } from '../../dialog/maestros/usuariosdlg/usuariosdlg.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
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
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {
  tablaDepartamento: Usuario[] = [];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: Usuario) => `${element.id}` },
    { columnDef: 'dni', header: 'DNI', cell: (element: Usuario) => `${element.dni}` },
    { columnDef: 'nivel', header: 'Nivel', cell: (element: Usuario) => `${element.nivel}` },
    { columnDef: 'rol', header: 'Rol', cell: (element: Usuario) => `${element.rol}` },
    { columnDef: 'nombres', header: 'Nombres', cell: (element: Usuario) => `${element.nombres}` },
    { columnDef: 'apellidos', header: 'Apellidos', cell: (element: Usuario) => `${element.apellidos}` },
    { columnDef: 'email', header: 'Email', cell: (element: Usuario) => `${element.email}` },
    { columnDef: 'cargo', header: 'Cargo', cell: (element: Usuario) => `${element.cargo}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo = "maestros";
  titulo = "Condiciones";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private readonly authApi: AuthApiService,
    private cartabla: ConversiontablaService,
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

  async cargartabla() {
    try {
      const source$ = this.authApi.listarUsuarios();
      const finalNumber: any = await lastValueFrom(source$);
  
      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento = this.cartabla.array;
  
      this.sctabla.setData(this.tablaDepartamento);
    } catch (error) {
      console.error('Error cargando la tabla:', error);
      Swal.fire({
        title: "Error cargando la tabla",
        text: "recargue la  vista",
        icon: "error"
      });
    }
  }
  dialogo() {
    const dialogRef = this.dialog.open(UsuariosdlgComponent, {
      width: '700px',
      height: '800px',
      data: {
        title: `Agregar ${this.titulo}`,
        valores: {},
        modo: 0
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //if (result) {
      this.cargartabla();
      // }
    });
  }
  editar(element: any) {
    const dialogRef = this.dialog.open(UsuariosdlgComponent, {
      width: '700px',
      height: '800px',
      data: {
        title: `Editar ${this.titulo}`,
        valores: {
          id: this.cartabla.dataSeleccionada.id,
          dni: this.cartabla.dataSeleccionada.dni,
          
          nivel: this.cartabla.dataSeleccionada.nivel,
          rol: this.cartabla.dataSeleccionada.rol,
          nombres: this.cartabla.dataSeleccionada.nombres,
          apellidos: this.cartabla.dataSeleccionada.apellidos,
          email: this.cartabla.dataSeleccionada.email,
          cargo: this.cartabla.dataSeleccionada.cargo,
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
    this.authApi.eliminar(element.id).subscribe(data => {
      Swal.fire({
        title: "Eliminado",
        text: "Continuar",
        icon: "info"
      });
      this.cargartabla();
    })
  }
}
