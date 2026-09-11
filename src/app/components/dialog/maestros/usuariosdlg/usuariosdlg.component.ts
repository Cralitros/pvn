import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../modelos/usuario';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AuthApiService } from '../../../../core/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuariosdlg',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './usuariosdlg.component.html',
  styleUrl: './usuariosdlg.component.scss'
})
export class UsuariosdlgComponent implements OnInit {
  formulario!: FormGroup;
  usuarios?: Usuario[];
  funcion: string = 'Añadir';
  fnc: boolean = true;

  nivel: any[] = [
    { "nivel": 1, "descripcion": "Acceso total" },
    { "nivel": 2, "descripcion": "Acceso a Tablas en general.\nAcceso a Reportes" },
    { "nivel": 3, "descripcion": "Acceso a Reportes" }
  ];

  cargos: { [key: string]: string } = {
    "1": "Jefe departamento",
    "2": "Secretaria"
  };

  rol: string[] = ["Administrador", "Data entry", "Lector"];

  constructor(
    public dialogRef: MatDialogRef<UsuariosdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly authApi: AuthApiService
  ) { }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      dni: ['', Validators.required],
      password: ['', Validators.required],
      nivel: ['', Validators.required],
      rol: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cargo: ['', Validators.required],
    });

    this.authApi.listarUsuarios().subscribe(data => {
      this.usuarios = data;
    });

    if (this.data?.modo === 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
      this.formulario.get('password')?.clearValidators();
      this.formulario.get('password')?.updateValueAndValidity();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
  }

  poner_datos() {
    this.formulario.setValue({
      id: this.data.valores.id,
      dni: this.data.valores.dni,
      nivel: Number(this.data.valores.nivel),
      rol: this.data.valores.rol,
      nombres: this.data.valores.nombres,
      apellidos: this.data.valores.apellidos,
      email: this.data.valores.email,
      cargo: this.data.valores.cargo,
      password: ""
    });
  }

  async onSubmit() {
    if (this.formulario?.valid) {
      let body = {
        id: this.formulario.value.id,
        dni: this.formulario.value.dni,
        password: this.formulario.value.password,
        nivel: this.formulario.value.nivel,
        rol: this.formulario.value.rol,
        nombres: this.formulario.value.nombres,
        apellidos: this.formulario.value.apellidos,
        email: this.formulario.value.email,
        cargo: this.formulario.value.cargo,
      };

      if (this.fnc) {
        this.authApi.registrar(body).subscribe({
          next: (data) => {
            Swal.fire({ title: "Usuario agregado", text: "Continuar", icon: "success" });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            Swal.fire({ title: "Error", text: "No se pudo agregar el usuario", icon: "error" });
          }
        });
      } else {
        this.authApi.actualizarUsuario(body.id, body).subscribe({
          next: (data) => {
            Swal.fire({ title: "Usuario actualizado", text: "Continuar", icon: "success" });
            this.dialogRef.close(this.formulario.value);
          },
          error: (err) => {
            Swal.fire({ title: "Error", text: "No se pudo actualizar el usuario", icon: "error" });
          }
        });
      }
    } else {
      this.formulario?.markAllAsTouched();
      Swal.fire({ title: "Campos incompletos", text: "Por favor, revise los campos marcados en rojo", icon: "warning" });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}