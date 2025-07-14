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
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { Nacionalidad } from '../../../modelos/nacionalidad';
import { Aux1Service } from '../../../../services/aux1.service';


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
  grade: string;
  titulo: string;
  fecha: string;
  lugar: string;
  revalidado: boolean;
  fechaRevalidado: string;
}

@Component({
  selector: 'app-gradodlg',
  standalone: true,
  imports: [
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
    MatAutocompleteModule,
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
  grado_obt?: Grado[];
  paises?:Nacionalidad[];
  funcion: any;
  fnc: boolean = true;
  grados = ["Bachiller", "Licenciatura", "Maestro", "Doctor","Segunda Especialidad","Otros"];

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
    private cgdepr: MaestrosserviceService,
    private aux12:Aux1Service) {

    this.opcionesSelect = [
      { value: '', label: 'Seleccione', disabled: false },
      { value: 'Bachiller', label: 'Bachiller', disabled: false },
      { value: 'Licenciatura', label: 'Licenciatura', disabled: false },
      { value: 'Maestro', label: 'Maestro', disabled: false },
      { value: 'Doctor', label: 'Doctor', disabled: false },
      { value: 'Post Doctorado', label: 'Doctor', disabled: false },
      { value: 'PHD.', label: 'Doctor', disabled: false }
    ];

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
    // Parsear el string JSON a un array de objetos
    const gradosArray = JSON.parse(this.data.valores.grado);

    // Limpiar el FormArray existente
    while (this.filasArray.length !== 0) {
      this.filasArray.removeAt(0);
    }
    if (gradosArray.length > 0) {
      for (let i = 0; i < gradosArray.length; i++) {
        this.agregarFilaTabla(false, gradosArray[i]);
      }

    }

    // Establecer los otros valores del formulario
    this.formularioGrado.patchValue({
      id: this.data.valores.id,
      codigoDocente: this.data.valores.codigoDocente,
      maximo_grado:this.data.valores.maximo_grado,
      pais_grado:this.data.valores.pais_grado,
    });
  }

  get filasArray(): FormArray {
    return this.formularioGrado.get('gradosTabla') as FormArray;
  }

  no_add_fila = true;
  agregarFilaTabla(manual: boolean, datos?: any) {
    let fila: any;

    if (!this.fnc && !manual) {
      console.log("da");
      console.log(datos);


      fila = this.formBuilder.group({
        grade: [datos.grade],
        titulo: [datos.titulo],
        fecha: [datos.fecha],
        lugar: [datos.lugar],
        revalidado: [Boolean(datos.revalidado)],
        fechaRevalidado: [datos.fechaRevalidado],
        conservar: [Boolean(datos.conservar)],
      });
      

    } else {
      fila = this.formBuilder.group({
        grade: [''],
        titulo: [''],
        fecha: [''],
        lugar: [''],
        fechaRevalidado: [''],
        revalidado: [false],
        conservar: [true],
      });

    }

    this.filasArray.push(fila);
    // Deshabilitar o habilitar fechaRevalidado según el valor inicial de revalidado
    const revalidadoControl = fila.get('revalidado');
    const fechaRevalidadoControl = fila.get('fechaRevalidado');

    // Establecer estado inicial
    if (!revalidadoControl?.value) {
      fechaRevalidadoControl?.disable();
    }

    // Suscribirse a los cambios del checkbox
    revalidadoControl?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        fechaRevalidadoControl?.enable();
      } else {
        fechaRevalidadoControl?.disable();
        fechaRevalidadoControl?.reset(); // Opcional: limpia la fecha si se desmarca
      }
    });
    console.log(this.filasArray);
    this.dataSource.data = [...this.dataSource.data, fila];
    //this.dataSource.data = [...this.dataSource.data, nuevaFila];

    //this.dataSource.data = [...this.dataSource.data, fila];
  }
  elemento(datos: any) {
    console.log(datos);
    return datos;
  }

  eliminarFila(index: number) {
    this.filasArray.removeAt(index);
    // 2. Actualizar el dataSource
    for (let i = 0; i < this.filasArray.length; i++) {
      this.agregarFilaTabla(false, this.filasArray.value[i])
      //this.dataSource.data = [...this.dataSource.data, fila];
    }
    // this.dataSource.data = this.filasArray.controls.map(control => control.value);
  }

  private sincronizarDataSource() {
    const datosActuales = [];

    // Recorremos el FormArray manualmente
    for (let i = 0; i < this.filasArray.length; i++) {
      const control = this.filasArray.at(i);
      datosActuales.push({
        grade: control.get('grade')?.value,
        titulo: control.get('titulo')?.value,
        fecha: control.get('fecha')?.value,
        lugar: control.get('lugar')?.value,
        revalidado: control.get('revalidado')?.value,
        fechaRevalidado: control.get('fechaRevalidado')?.value,
        conservar: control.get('conservar')?.value,
      });
    }

    this.dataSource.data = datosActuales;
  }
  ngOnInit(): void {
    this.opcionesSelect = [
      { value: '', label: 'Seleccione', disabled: false },
      { value: 'Bachiller', label: 'Bachiller', disabled: false },
      { value: 'Licenciatura', label: 'Licenciatura', disabled: false },
      { value: 'Maestro', label: 'Maestro', disabled: false },
      { value: 'Doctor', label: 'Doctor', disabled: false },
      { value: 'Post Doctorado', label: 'Post Doctor', disabled: false },
      { value: 'PHD.', label: 'PHD.', disabled: false },
      { value: '2da. Especialidad', label: '2da. Especialidad', disabled: false },
    ];

    console.log(this.data);
    this.formularioGrado = this.formBuilder.group({
      id: [''],
      gradosTabla: this.formBuilder.array([]),      
      codigoDocente: [''],
      maximo_grado:[''],
      pais_grado:[''],
    });

    this.cgdepr.ponerurl("docentesgrado");
    this.cgdepr.get().subscribe(data => {
      this.grado_obt = data;
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

    this.pais();

  }
  pais(){
     //ponerurl();
    this.aux12.ponerurl("nacionalidad");
    this.aux12.get().subscribe(data=>{
      console.log(data);
      this.paises=data;
    });
  }

  ngAfterViewInit() {

  }
  poner_codigo() {
    this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {
    let body = {
      id: this.formularioGrado.value?.id,
      grado: this.filasArray.value.filter((item: any) => item.conservar),
      /* revalidado: this.formularioGrado.value?.revalidado,
       lugar_obtencion: this.formularioGrado.value?.lugar_obtencion,
       fecha_obtencion: this.formularioGrado.value?.fecha_obtencion,*/
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      maximo_grado:this.formularioGrado.value?.maximo_grado,
      pais_grado:this.formularioGrado.value?.pais_grado,
      //      profesion: this.formularioGrado.value?.profesion,
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
  columnas: string[] = ['conservar', 'grado', 'titulo', 'fecha', 'lugar', 'revalidado', 'fechaRevalidado'];

  // Datos de la tabla (usando MatTableDataSource)
  dataSource = new MatTableDataSource<Fila>([]);

  // En tu componente:
  opcionesSelect = [
    { value: '', label: 'Seleccione', disabled: false },
    { value: 'Bachiller', label: 'Bachiller', disabled: false },
    { value: 'Licenciatura', label: 'Licenciatura', disabled: false },
    { value: 'Maestro', label: 'Maestro', disabled: false },
    { value: 'Doctor', label: 'Doctor', disabled: false },
    { value: 'Doctor', label: 'Doctor', disabled: false },
    { value: 'Post Doctorado', label: 'Doctor', disabled: false },
    { value: 'PHD.', label: 'Doctor', disabled: false }
  ];




}


