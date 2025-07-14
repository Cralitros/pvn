import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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


@Component({
  selector: 'app-info-docencia',
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
  templateUrl: './info-docencia.component.html',
  styleUrl: './info-docencia.component.scss'
})
export class InfoDocenciaComponent {
  formulario1?: FormGroup | any = null;

  categoria: string[] = ['Emerito', '...', '...', '...', '...', '...'];
  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.formulario1 = this.formBuilder.group({
      codigo: ['', Validators.required],
      categoria: ['', Validators.required],
      dedicacion: ['', Validators.required],
      inicioDictado: [''],
      finDictado: ['', Validators.required],
      modoIngreso: ['', Validators.required],
      departamento: ['', Validators.required],
      lugarDictado: ['', Validators.required],
      paisDictado: ['', Validators.required],
      diasPermanencia: ['', Validators.required],
      laborAdministrativa: ['', Validators.required],
      rolAnterior: ['', Validators.required],
      comisionEspecial: [''],
      emisionCarne: [''],
      prestamo: ['', Validators.required],
      sanciones: ['', Validators.required],
      observaDAP: ['', Validators.required],
      historicoRatifica: ['', Validators.required],
      felicitacionEncuesta: ['', Validators.required],
      
    });
  }
  onSubmit(){
    console.log("click");
    
  }
}
