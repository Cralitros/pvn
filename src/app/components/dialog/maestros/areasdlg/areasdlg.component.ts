import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Area } from '../../../modelos/area';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-areasdlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './areasdlg.component.html',
  styleUrl: './areasdlg.component.scss'
})
export class AreasdlgComponent {
  formulario?: FormGroup | any = null;
  areas?: Area[];
  funcion: any;
  fnc: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<AreasdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService
  ) { }

  poner_datos() {
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
    });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
    });

    this.cgdepr.ponerurl("area");
    this.cgdepr.get().subscribe(data => {
      this.areas = data;
    });

    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
  }

  onSubmit() {
    let body = {
      id: this.formulario.value?.id,
      nombre: this.formulario.value.nombre,
    };

    this.cgdepr.ponerurl("area");

    if (this.formulario?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          Swal.fire({ title: "Agregado", text: "Continuar", icon: "info" });
          this.dialogRef.close(this.formulario.value);
        });
      } else {
        this.cgdepr.update(body.id, body).subscribe(data => {
          Swal.fire({ title: "Actualizado", text: "Continuar", icon: "info" });
          this.dialogRef.close(this.formulario.value);
        });
      }
    } else {
      this.formulario?.markAllAsTouched();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}