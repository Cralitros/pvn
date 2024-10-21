import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Programa } from '../../../modelos/programa';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Facultad } from '../../../modelos/facultad';
import { Escuela } from '../../../modelos/escuela';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
  selector: 'app-programasdlg',
  standalone: true,
  imports: [MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule],
  templateUrl: './programasdlg.component.html',
  styleUrl: './programasdlg.component.scss'
})
export class ProgramasdlgComponent {
  formulario?: FormGroup| any= null;
  facultades?:Facultad[] ;
  escuelas?:Escuela[] ;
  programas?:Programa[] ;
  escuelaSelecionada:any;
  funcion:any;
  fnc:boolean=true;
  constructor(public dialogRef: MatDialogRef<ProgramasdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    const facultad = this.facultades?.find(fac => fac.id === this.data.valores.facultad.id);
  //const escuela = facultad?.Escuelas?.find(esc => esc.id === this.data.valores.Escuela.id);
    console.log(facultad);
    
    this.formulario.setValue({
      id:this.data.valores.id,
      facultad: this.data.valores.facultad.id,
      programa:this.data.valores.programa,
      gestor:this.data.valores.gestor,
      director:this.data.valores.director,
      inicio: this.data.valores.inicio,
      fin: this.data.valores.fin,
      escuela: this.data.valores.escuela,
      
    });
    if(this.data.valores.facultad){
      this.onCategoryChangeFacultad(this.data.valores.facultad,true);
    }
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      facultad: ['', Validators.required],
      escuela: ['', Validators.required],
      programa: ['', Validators.required],
      gestor: ['', Validators.required],
      director: ['', Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],

    });
    this.cgdepr.ponerurl("facultad");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.facultades=data;
      if(this.data.modo==1){
        this.funcion="Editar";
        this.fnc=false;
        this.poner_datos();
  
      }else{
        this.funcion="Añadir"
        this.fnc=true;
      }
    });
   

  }
  onSubmit() {
    let body={
      id:this.formulario.value?.id,
      programa:this.formulario.value.programa,
      gestor:this.formulario.value.gestor,
      director:this.formulario.value.director,
      inicio: this.formulario.value.inicio,
      fin: this.formulario.value.fin,
      idEscuela:this.formulario.value.escuela.id,
    }
    this.cgdepr.ponerurl("programa")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
        })
      }else{
        this.cgdepr.update(body.id,body).subscribe(data=>{
          console.log("actualizado");
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
  onCategoryChangeFacultad(event:any,tipo?:any){
    console.log(event.value);
    
    if(tipo){
      this.formulario.patchValue({
        facultad: event.id,
      });
    }
    
    this.escuelas=event.value.Escuelas;
  }
  onCategoryChangeEscuela(event:any){
    this.escuelaSelecionada=event.value;
    console.log(this.escuelaSelecionada);
    
  }
}
