import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthApiService } from '../../core/api';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  formulario?: FormGroup | any = null;

  constructor(private formBuilder: FormBuilder,
    private readonly authApi: AuthApiService,
    private router: Router
  ) {

  }
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      dni: [, Validators.required],
      password: [, Validators.required],
    });
  }

  logueo() {
    const login = this.formulario.value;
    this.authApi.autenticar(login).pipe(
      catchError(error => {
        Swal.fire({
          title: "¡Error en el usuario o contraseña, revise nuevamente sus accesos!",
          text: "Continuar",
          icon: "error"
        });

        return throwError(() => error); // Esto es opcional si deseas propagar el error
      })
    ).subscribe(data => {
      localStorage.setItem("dni", data.dni);
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Continua",
        icon: "success"
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nivel", data.nivel);
        //localStorage.setItem()
        this.router.navigate(['dashboard'])
      }

    });

  }
}
