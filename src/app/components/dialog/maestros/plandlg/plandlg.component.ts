import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Plan } from '../../../modelos/plan';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-plandlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatRadioModule,
    MatCheckboxModule
  ],
  templateUrl: './plandlg.component.html',
  styleUrl: './plandlg.component.scss'
})
export class PlandlgComponent {
  formulario?: FormGroup| any= null;
  planes?:Plan[] ;
  funcion:any;
  fnc:boolean=true;
  nivelesacad:any[]=["Pregrado", "Maestria", "Doctorado"]
  constructor(public dialogRef: MatDialogRef<PlandlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      nivel_academico: this.data.valores.nivel_academico,
      vigencia: this.data.valores.vigencia,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      nivel_academico: ['', Validators.required],
      vigencia: ['', Validators.required],
    });
    this.cgdepr.ponerurl("plan");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.planes=data;
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
      id:this.formulario.value?.id,
      nombre:this.formulario.value.nombre,
      nivel_academico:this.formulario.value.nivel_academico,
      vigencia:this.formulario.value.vigencia
    }
    this.cgdepr.ponerurl("plan")
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

}
