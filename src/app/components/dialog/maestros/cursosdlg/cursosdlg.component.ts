import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Curso } from '../../../modelos/cursos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Aux1Service } from '../../../../services/aux1.service';
import { Aux2Service } from '../../../../services/aux2.service';
import { Facultad } from '../../../modelos/facultad';
import { Escuela } from '../../../modelos/escuela';
import { Programa } from '../../../modelos/programa';
import { Plan } from '../../../modelos/plan';
import Swal from 'sweetalert2';
import { Area } from '../../../modelos/area';

@Component({
  selector: 'app-cursosdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './cursosdlg.component.html',
  styleUrl: './cursosdlg.component.scss'
})
export class CursosdlgComponent {
  formulario?: FormGroup| any= null;
  departamentos?:Curso[] ;
  facultades?:Facultad[];
  escuelas?:Escuela[];
  programas?:Programa[];
  planes?:Plan[];
  areas?:Area[];
  funcion:any;
  fnc:boolean=true;
  constructor(public dialogRef: MatDialogRef<CursosdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService,
    private saux1:Aux1Service,
    private saux2:Aux2Service,
    private saux3:Aux2Service,
    private saux4:Aux2Service,){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
   // 
    this.formulario.setValue({
      codigo: this.data.valores.codigo,
      nombre: this.data.valores.nombre,
      semestre: this.data.valores.semestre,
      nivel: this.data.valores.nivel,
      creditos: this.data.valores.creditos,
      facultad: this.data.valores.programa.Escuela.Facultad.id,
      escuela: this.data.valores.programa.Escuela.id,
      programa: this.data.valores.programa.id,
      plan: this.data.valores.plan.id,
      areas: this.data.valores.areas,

    });
    this.onSelectChangeFacultad(this.data.valores.programa.Escuela.Facultad.id);
    this.onSelectChangeEscuela(this.data.valores.programa.Escuela.id);
    //this.onSelectChangeFacultad(this.data.valores.escuela.id);
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      codigo: [''],
      nombre: ['', Validators.required],
      semestre: ['', Validators.required],
      nivel: ['', Validators.required],
      creditos: ['', Validators.required],
      facultad: ['', Validators.required],
      escuela: ['', Validators.required],
      programa: ['', Validators.required],
      plan: ['', Validators.required],
      areas: [''],
    });
    this.cgdepr.ponerurl("curso");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.departamentos=data;
    });

    this.saux1.ponerurl("facultad");
    this.saux1.get().subscribe(data=>{
      console.log(data);
      this.facultades=data;
    });

    this.saux2.ponerurl("plan");
    this.saux2.get().subscribe(data=>{
      console.log(data);
      this.planes=data;
    });

    this.saux4.ponerurl("area");
    this.saux4.get().subscribe(data=>{
      console.log(data);
      this.areas=data;
    });


    if(this.data.modo==1){
      this.funcion="Editar";
      this.fnc=false;
      this.poner_datos();

    }else{
      this.funcion="Añadir"
      this.fnc=true;
    }

  }
  onSubmit() {
    let body={
      codigo: this.formulario.value.codigo,
      nombre: this.formulario.value.nombre,
      semestre: this.formulario.value.semestre,
      nivel: this.formulario.value.nivel,
      creditos: this.formulario.value.creditos,
      codigoPlan:this.formulario.value.plan,
      idEscuela: this.formulario.value.escuela,
      idPrograma: this.formulario.value.programa,
      areas: this.formulario.value.areas,
    }
    this.cgdepr.ponerurl("curso")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }else{
        this.cgdepr.update(body.codigo,body).subscribe(data=>{
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }

      this.dialogRef.close(this.formulario.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  async onSelectChangeFacultad(event:any){
    this.saux2.ponerurl("escuela/lista");
    console.log(event);
    
    if (this.data.modo == 1) {
      await this.saux2.getid(event).subscribe(data => {
        this.escuelas = data;
      });
    } else  if (this.data.modo == 0){
      await this.saux2.getid(event.value).subscribe(data => {
        this.escuelas = data;
      });
    }
    
  }

  async onSelectChangeEscuela(event:any){
    this.saux3.ponerurl("programa/lista");
    console.log(event);
    
    if (this.data.modo == 1) {
      await this.saux3.getid(event).subscribe(data => {
        this.programas = data;
      });
    } else if (this.data.modo == 0){
      await this.saux3.getid(event.value).subscribe(data => {
        this.programas = data;
      });
    }


  }
  onSelectChangePrograma(event:any){

  }
  

}
