import { CommonModule } from '@angular/common';
import { Component, computed, inject, Inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Grado } from '../../../modelos/grado';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface Fila {
  grado: string;
  fecha: Date;
  titulo:string;
}

@Component({
  selector: 'app-gradodlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
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
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    FormsModule 

  ],
  templateUrl: './gradodlg.component.html',
  styleUrl: './gradodlg.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' }, // Opcional: configura localidad
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },

  ]
})

export class GradodlgComponent {
  formularioGrado?: FormGroup | any = null;
  departamentos?: Grado[];
  funcion: any;
  fnc: boolean = true;
  grados = ["Bachiller", "Licenciatura", "Maestro", "Doctor"];

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    if (this._locale() === 'ja-JP') {
      return 'YYYY/MM/DD';
    } else if (this._locale() === 'es-Es') {
      return 'DD/MM/YYYY';
    }
    return '';
  });

  constructor(public dialogRef: MatDialogRef<GradodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService) {



  }
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';

    // Limpiar el texto pegado (eliminar espacios, caracteres no numéricos)
    const cleanText = pastedText.replace(/[^\d]/g, '');

    // Formatear según diferentes patrones de entrada
    let formattedDate = '';

    // Caso 1: DDMMYYYY (8 dígitos)
    if (cleanText.length === 8) {
      const day = String(Number(cleanText.substring(0, 2)) + 1).padStart(2, '0');
      const month = cleanText.substring(2, 4);
      const year = cleanText.substring(4, 8);
      formattedDate = `${year}-${month}-${day}`; // Formato YYYY-MM-DD que entiende el datepicker
    }
    // Caso 2: DD/MM/YYYY (con separadores)
    else if (pastedText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = pastedText.split('/');
      formattedDate = `${year}-${month}-${day}`;
    }

    console.log(formattedDate);
    console.log(Date.parse(formattedDate));


    // Caso 3: Otros formatos podrían agregarse aquí

    if (formattedDate) {
      const fechaControl = this.formularioGrado.get('fecha_obtencion');
      fechaControl?.patchValue(formattedDate);

      // Forzar la actualización del datepicker si es necesario
      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }

    // Si no es válido, marca error
    //  this.fechaControl.setErrors({ invalidDate: true });
  }
  poner_datos() {
    console.log(this.data);

    this.formularioGrado.setValue({
      id: this.data.valores.id,
      gradosTabla: this.data.valores.gradosTabla,
      revalidado: this.data.valores.revalidado,
      lugar_obtencion: this.data.valores.lugar_obtencion,
      fecha_obtencion: this.data.valores.fecha_obtencion,
      codigoDocente: this.data.valores.codigoDocente,
      profesion: this.data.valores.profesion,
    });
    //this.form.value.id=this.data.valores.id;
  }

  get filasArray(): FormArray {
    return this.formularioGrado.get('gradosTabla') as FormArray;
  }
  
  agregarFilaTabla() {
    const fila:any = this.formBuilder.group({
      grade: [''],
      titulo: [''],
      fecha: ['']
    });
    this.filasArray.push(fila);
    console.log(this.filasArray);
    this.dataSource.data = [...this.dataSource.data, fila];
    //this.dataSource.data = [...this.dataSource.data, nuevaFila];
    
    //this.dataSource.data = [...this.dataSource.data, fila];
  }
  
  eliminarFila(index: number) {
    this.filasArray.removeAt(index);
  }

  ngOnInit(): void {
    console.log(this.data);
    this.formularioGrado = this.formBuilder.group({
      id: [''],
      gradosTabla: this.formBuilder.array([]),
      revalidado: [''],
      lugar_obtencion: [''],
      fecha_obtencion: [''],
      codigoDocente: [''],
      profesion: [''],
    });
    this.cgdepr.ponerurl("docentesgrado");
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
      gradosTabla: this.formularioGrado.value?.gradosTabla,
      revalidado: this.formularioGrado.value?.revalidado,
      lugar_obtencion: this.formularioGrado.value?.lugar_obtencion,
      fecha_obtencion: this.formularioGrado.value?.fecha_obtencion,
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      profesion: this.formularioGrado.value?.profesion,
    }
    this.cgdepr.ponerurl("docentesgrado")
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


  // Columnas a mostrar
  columnas: string[] = ['grado','titulo', 'fecha', 'acciones'];

  // Datos de la tabla (usando MatTableDataSource)
  dataSource = new MatTableDataSource<Fila>([]);
  // En tu componente:
  opcionesSelect = [
    { value: '', label: 'Seleccione', disabled: false },
    { value: 'Bachiller', label: 'Bachiller', disabled: false },
    { value: 'Licenciatura', label: 'Licenciatura', disabled: false },
    { value: 'Maestro', label: 'Maestro', disabled: false },
    { value: 'Doctor', label: 'Doctor', disabled: false }
  ];
//grados = ["Bachiller", "Licenciatura", "Maestro", "Doctor"];
  // Método para agregar una fila
  agregarFila() {
    const nuevaFila: Fila = {
      grado: '1',
      fecha: new Date(), // Edad aleatoria entre 18 y 67
      titulo:'d'
    };

    // Actualiza el dataSource con la nueva fila
    this.dataSource.data = [...this.dataSource.data, nuevaFila];
  }

  eliminar(element: any) {
    console.log(element);

  }

}


