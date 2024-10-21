import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Investigador } from '../../../modelos/investigador';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';

@Component({
  selector: 'app-investigadlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './investigadlg.component.html',
  styleUrl: './investigadlg.component.scss'
})
export class InvestigadlgComponent {
  formulario?: FormGroup | any = null;
  departamentos?: Investigador[];
  funcion: any;
  fnc: boolean = true;
  constructor(public dialogRef: MatDialogRef<InvestigadlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService) {



  }
  poner_datos() {
    console.log(this.data);

    this.formulario.setValue({

      id: this.data.valores.id,
      orcid: this.data.valores.orcid,
      renacyt: this.data.valores.renacyt,
      grupo: this.data.valores.grupo,
      nivel: this.data.valores.nivel,
      registro: this.data.valores.registro,
      rol: this.data.valores.rol,
      reconocimiento: this.data.valores.reconocimiento,
      contenido: this.data.valores.contenido,
      codigoDocente: this.data.valores.codigoDocente

    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    console.log(this.data);

    this.formulario = this.formBuilder.group({
      id: [''],
      orcid: [''],
      renacyt: [''],
      grupo: [''],
      nivel: [''],
      registro: [''],
      rol: [''],
      reconocimiento: [''],
      contenido: [''],
      codigoDocente: [''],

    });
    this.cgdepr.ponerurl("docentesinvestiga");
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
    this.formulario.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  onSubmit() {
    let body = {

      id: this.formulario.value?.id,
      orcid: this.formulario.value?.orcid,
      renacyt: this.formulario.value?.renacyt,
      grupo: this.formulario.value?.grupo,
      nivel: this.formulario.value?.nivel,
      registro: this.formulario.value?.registro,
      rol: this.formulario.value?.rol,
      reconocimiento: this.formulario.value?.reconocimiento,
      contenido: this.formulario.value?.contenido,
      codigoDocente: this.formulario.value?.codigoDocente

    }
    this.cgdepr.ponerurl("docentesinvestiga")
    if (this.formulario?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
        })
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
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
