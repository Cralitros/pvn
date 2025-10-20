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
import { logins } from '../../modelos/usuario';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
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
  tablaDepartamento: logins[] = [];
  columns: Column[] = [
    { columnDef: 'id', header: 'No.', cell: (element: logins) => `${element.id}` },
    { columnDef: 'dni', header: 'DNI', cell: (element: logins) => `${element.dni}` },
    { columnDef: 'nivel', header: 'Nivel', cell: (element: logins) => `${element.nivel}` },
    { columnDef: 'rol', header: 'Rol', cell: (element: logins) => `${element.rol}` },
    { columnDef: 'nombres', header: 'Nombres', cell: (element: logins) => `${element.nombres}` },
    { columnDef: 'apellidos', header: 'Apellidos', cell: (element: logins) => `${element.apellidos}` },
    { columnDef: 'email', header: 'Email', cell: (element: logins) => `${element.email}` },
    { columnDef: 'cargo', header: 'Cargo', cell: (element: logins) => `${element.cargo}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];

  departamentoForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  tipo = "maestros";
  titulo = "Condiciones";

  @Output() titulos = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
    private sctabla: CargatablaService,
    private mservice: MaestrosserviceService,
    private cartabla: ConversiontablaService,
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

  async cargartabla() {
    try {
      this.mservice.ponerurl("login");
      const source$ = this.mservice.get();
      const finalNumber: any = await lastValueFrom(source$);
  
      this.cartabla.ponerdata(finalNumber);
      this.tablaDepartamento = this.cartabla.array;
      console.log(this.tablaDepartamento);
  
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
      width: '520px',
      height: '650px',
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
      width: '520px',
      height: '650px',
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
