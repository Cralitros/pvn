import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { MaestrosserviceService } from '../../services/maestrosservice.service';

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
    this.srconsulta.add(login).subscribe(data=>{
      console.log(data);
      if(data.token){
        localStorage.setItem("token",data.token);
        localStorage.setItem("nivel",data.nivel);
        //localStorage.setItem()
        this.router.navigate(['dashboard'])
      }
      
    });
    
  }
}
