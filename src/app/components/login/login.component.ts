import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { MaestrosserviceService } from '../../services/maestrosservice.service';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterOutlet,  ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  username: string = '';
  password: string = '';
  formulario?: FormGroup | any = null;

  constructor(private formBuilder: FormBuilder,
    private srconsulta:MaestrosserviceService,
    private router:Router
  ){

  }
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      dni:[,Validators.required],
      password:[,Validators.required],
    });
  }
  
  logueo(){
    console.log(this.formulario.value);
    const login=this.formulario.value;
    this.srconsulta.ponerurl("login/login");
    this.srconsulta.add(login).pipe(
      catchError(error => {
        console.log("Error capturado:", error);
        Swal.fire({
          title: "¡Error en el usuario o contraseña, revise nuevamente sus accesos!",
          text: "Continuar",
          icon: "error"
        });

        return throwError(error); // Esto es opcional si deseas propagar el error
      })
    ).subscribe(data=>{
      console.log("******************");
      localStorage.setItem("dni",data.dni);
      console.log(data);
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Continua",
        icon: "success"
      });
      if(data.token){
        localStorage.setItem("token",data.token);
        localStorage.setItem("nivel",data.nivel);
        //localStorage.setItem()
        this.router.navigate(['dashboard'])
      }
      
    });
    
  }
}
