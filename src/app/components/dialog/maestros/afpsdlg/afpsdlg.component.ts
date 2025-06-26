import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Afp } from '../../../modelos/afp';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import Swal from 'sweetalert2';
import { Tablas, TipoTablaService } from '../../../../services/tipo-tabla.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-afpsdlg',
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
  templateUrl: './afpsdlg.component.html',
  styleUrl: './afpsdlg.component.scss'
})
export class AfpsdlgComponent {
  formulario?: FormGroup | any = null;
  planes?: Afp[];
  funcion: any;
  fnc: boolean = true;

  private destroy$ = new Subject<void>();
  private readonly TABLA: Tablas = 'AFP'; // Mismo tipo que en el componente principal
  datosRecibidos: any;

  constructor(public dialogRef: MatDialogRef<AfpsdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private mensajeService: TipoTablaService
  ) {

    // Suscripción temprana en el constructor
    this.mensajeService.obtenerCanal(this.TABLA)
      .pipe(
        takeUntil(this.destroy$),
        filter(datos => datos !== null) // Filtramos el valor inicial null
      )
      .subscribe(datos => {
        console.log('Datos recibidos en diálogo:', datos);
        this.datosRecibidos = datos;
        // Aquí puedes hacer lo que necesites con los datos
      });

  }
  poner_datos() {
    console.log(this.data);

    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,

    });
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {

    //this.recibirMensaje();

    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
    });
    this.cgdepr.ponerurl("afps");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.planes = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.fnc = true;
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    let body = {
      id: this.formulario.value?.id,
      nombre: this.formulario.value.nombre,

    }
    this.cgdepr.ponerurl("afps")
    if (this.formulario?.valid) {
      if (this.fnc == true) {
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      } else {
        this.cgdepr.update(body.id, body).subscribe(data => {
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


}
