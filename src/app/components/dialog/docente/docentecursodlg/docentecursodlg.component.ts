import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DocenteCurso } from '../../../modelos/docentecurso';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Curso } from '../../../modelos/cursos';
import { Aux1Service } from '../../../../services/aux1.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-docentecursodlg',
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
  ],
  templateUrl: './docentecursodlg.component.html',
  styleUrl: './docentecursodlg.component.scss'
})
export class DocentecursodlgComponent {
  formularioGrado?: FormGroup | any = null;
  departamentos?: DocenteCurso[];
  funcion: any;
  fnc: boolean = true;
  cursos?: Curso[];
  modalidad=["Presencial","Semipresencial","Virtual","A distancia","Práctica"];
  tipo=["Clase","Asesoría","Práctica","Taller"];
  tipo_clase=["Única","Compartida","Codictado"];
  estado=["Provisionado","Provisionado asesoría","Pendiente", "Falta de V°B° JD",
    "Rechazado","Duplicado","Desprovisionado","No provisionado","Horario Cerrado","Curso Cerrado","Cerrado",
    "Cancelado"]
  constructor(public dialogRef: MatDialogRef<DocentecursodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service) {



  }
  poner_datos() {
    console.log(this.data);


    this.formularioGrado.setValue({
      id: this.data.valores.id,
      fecha_inicio: this.data.valores.fecha_inicio,
      fecha_fin: this.data.valores.fecha_fin,
      codigoCurso: this.data.valores.codigoCurso,
      codigoDocente: this.data.valores.codigoDocente,
      modalidad: this.data.valores.modalidad,
      tipo: this.data.valores.tipo,
      tipo_clase: this.data.valores.tipo_clase,
      estado: this.data.valores.estado,
    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    console.log(this.data);

    this.saux1.ponerurl("curso");
    this.saux1.get().subscribe(data => {
      console.log(data);

      this.cursos = data;
    })

    this.formularioGrado = this.formBuilder.group({
      id: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      codigoCurso: [''],
      codigoDocente: [''],
      modalidad: [''],
      tipo: [''],
      tipo_clase: [''],
      estado: [''],

    });
    this.cgdepr.ponerurl("docentescurso");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.departamentos = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.poner_codigo();
      this.fnc = true;
    }

  }
  poner_codigo() {
    this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {
    let body = {
      id: this.formularioGrado.value?.id,
      fecha_inicio: this.formularioGrado.value?.fecha_inicio,
      fecha_fin: this.formularioGrado.value?.fecha_fin,
      codigoCurso: this.formularioGrado.value?.codigoCurso,
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      modalidad: this.formularioGrado.value?.modalidad,
      tipo:this.formularioGrado.value?.tipo,
      tipo_clase: this.formularioGrado.value?.tipo_clase,
      estado: this.formularioGrado.value?.estado,
    }
    this.cgdepr.ponerurl("docentescurso")
    if (this.formularioGrado?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        })
      }

      this.dialogRef.close(this.formularioGrado.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioGrado?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }


}
