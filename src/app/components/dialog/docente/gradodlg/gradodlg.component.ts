import { CommonModule } from '@angular/common';
import { Component, computed, inject, Inject, signal, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { Nacionalidad } from '../../../modelos/nacionalidad';
import { Aux1Service } from '../../../../services/aux1.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

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

// Orden de grados para determinar el superior
const ORDEN_GRADOS: { [key: string]: number } = {
  'Bachiller': 1,
  'Licenciatura': 2,
  'Segunda Especialidad': 3,
  'Segunda Especialidad (PSE)': 3,
  'Maestro': 4,
  'Doctor': 5,
  'Post Doctorado': 6,
  'PHD.': 5
};

@Component({
  selector: 'app-gradodlg',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './gradodlg.component.html',
  styleUrl: './gradodlg.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class GradodlgComponent {
  formularioGrado?: FormGroup | any = null;
  grado_obt?: Grado[];
  paises?: Nacionalidad[];
  funcion: any;
  fnc: boolean = true;

  opcionesSelect = [
    { value: '', label: 'Seleccione', disabled: false },
    { value: 'Bachiller', label: 'Bachiller', disabled: false },
    { value: 'Licenciatura', label: 'Licenciatura', disabled: false },
    { value: 'Maestro', label: 'Maestro', disabled: false },
    { value: 'Doctor', label: 'Doctor', disabled: false },
    { value: 'Post Doctorado', label: 'Post Doctorado', disabled: false },
    { value: 'PHD.', label: 'PHD.', disabled: false },
    { value: 'Segunda Especialidad', label: 'Segunda Especialidad', disabled: false },
    { value: 'Segunda Especialidad (PSE)', label: 'Segunda Especialidad (PSE)', disabled: false }
  ];

  opcionesPais = [
    { value: 'Perú', label: 'Perú' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Brasil', label: 'Brasil' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Uruguay', label: 'Uruguay' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'España', label: 'España' },
    { value: 'México', label: 'México' },
    { value: 'Estados Unidos', label: 'Estados Unidos' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    public dialogRef: MatDialogRef<GradodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private aux12: Aux1Service
  ) { }

  ngOnInit(): void {
    console.log(this.data);

    this.formularioGrado = this.formBuilder.group({
      id: [''],
      gradosTabla: this.formBuilder.array([]),
      codigoDocente: [''],
      maximo_grado: [{ value: '', disabled: true }], // Deshabilitado, se calcula automáticamente
      bgac: [false],
      bga: [{ value: '', disabled: true }],
      prestamoc: [false],
      prestamo: [{ value: '', disabled: true }],
    });

    this.cargarPaises();

    this.cgdepr.ponerurl("docentesgrado");
    this.cgdepr.get().subscribe(data => {
      this.grado_obt = data;
    });

    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
      this.poner_codigo();
    }

    // Suscribirse a cambios en el FormArray para actualizar el grado superior
    this.filasArray.valueChanges.subscribe(() => {
      this.actualizarGradoSuperior();
    });

    this.formularioGrado.get('bgac')?.valueChanges.subscribe((checked: boolean) => {
      const checkControl = this.formularioGrado.get('bga');
      if (checked) {
        checkControl.enable();
      } else {
        checkControl.disable();
        checkControl.reset();
      }
    });

    this.formularioGrado.get('prestamoc')?.valueChanges.subscribe((checked: boolean) => {
      const checkControl = this.formularioGrado.get('prestamo');
      if (checked) {
        checkControl.enable();
      } else {
        checkControl.disable();
        checkControl.reset();
      }
    });
  }

  // Actualizar el grado superior automáticamente
  actualizarGradoSuperior() {
    const grados = this.filasArray.controls
      .filter(control => control.get('conservar')?.value === true)
      .map(control => control.get('grade')?.value)
      .filter(grado => grado && grado !== '');

    if (grados.length === 0) {
      this.formularioGrado.get('maximo_grado')?.setValue('');
      return;
    }

    // Encontrar el grado con mayor jerarquía
    let gradoSuperior = '';
    let maxOrden = 0;

    for (const grado of grados) {
      const orden = ORDEN_GRADOS[grado] || 0;
      if (orden > maxOrden) {
        maxOrden = orden;
        gradoSuperior = grado;
      }
    }

    this.formularioGrado.get('maximo_grado')?.setValue(gradoSuperior);
  }

  cargarPaises() {
    this.aux12.ponerurl("nacionalidad");
    this.aux12.get().subscribe(data => {
      this.paises = data;
    });
  }

  get filasArray(): FormArray {
    return this.formularioGrado.get('gradosTabla') as FormArray;
  }

  agregarFilaTabla(manual: boolean, datos?: any) {
    let fila: FormGroup;

    if (!this.fnc && !manual && datos) {
      fila = this.formBuilder.group({
        grade: [datos.grade || ''],
        titulo: [datos.titulo || ''],
        fecha: [datos.fecha ? new Date(datos.fecha) : ''],
        lugar: [datos.lugar || ''],
        pais: [datos.pais || ''],
        revalidado: [Boolean(datos.revalidado)],
        fechaRevalidado: [datos.fechaRevalidado ? new Date(datos.fechaRevalidado) : ''],
        conservar: [Boolean(datos.conservar !== undefined ? datos.conservar : true)],
      });
    } else {
      fila = this.formBuilder.group({
        grade: [''],
        titulo: [''],
        fecha: [''],
        lugar: [''],
        pais: [''],
        revalidado: [false],
        fechaRevalidado: [''],
        conservar: [true],
      });
    }

    this.filasArray.push(fila);

    const revalidadoControl = fila.get('revalidado');
    const fechaRevalidadoControl = fila.get('fechaRevalidado');

    if (!revalidadoControl?.value) {
      fechaRevalidadoControl?.disable();
    }

    revalidadoControl?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        fechaRevalidadoControl?.enable();
      } else {
        fechaRevalidadoControl?.disable();
        fechaRevalidadoControl?.reset();
      }
    });
  }

  eliminarFila(index: number) {
    // Mostrar confirmación antes de eliminar
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el grado de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.filasArray.removeAt(index);
        Swal.fire('Eliminado', 'El grado ha sido eliminado', 'success');
      }
    });
  }

  poner_datos() {
    let gradosArray = [];
    try {
      gradosArray = typeof this.data.valores.grado === 'string'
        ? JSON.parse(this.data.valores.grado)
        : this.data.valores.grado || [];
    } catch (e) {
      console.error('Error parsing grados:', e);
      gradosArray = [];
    }

    while (this.filasArray.length !== 0) {
      this.filasArray.removeAt(0);
    }

    if (gradosArray.length > 0) {
      for (let i = 0; i < gradosArray.length; i++) {
        const grado = gradosArray[i];
        this.agregarFilaTabla(false, {
          grade: grado.grade || '',
          titulo: grado.titulo || '',
          fecha: grado.fecha || '',
          lugar: grado.lugar || '',
          pais: grado.pais || '',  // ← Asegurar que se carga el país
          revalidado: grado.revalidado || false,
          fechaRevalidado: grado.fechaRevalidado || '',
          conservar: grado.conservar !== undefined ? grado.conservar : true,
        });
      }
    }

    this.formularioGrado.patchValue({
      id: this.data.valores.id || '',
      codigoDocente: this.data.valores.codigoDocente || '',
      bgac: this.data.valores.bgac === true,
      bga: this.data.valores.bga || '',
      prestamoc: this.data.valores.prestamoc === true,
      prestamo: this.data.valores.prestamo || '',
    });

    // Actualizar grado superior automáticamente después de cargar
    setTimeout(() => {
      this.actualizarGradoSuperior();
    }, 100);

    if (this.data.valores.bgac === true) {
      this.formularioGrado.get('bga')?.enable();
    } else {
      this.formularioGrado.get('bga')?.disable();
    }

    if (this.data.valores.prestamoc === true) {
      this.formularioGrado.get('prestamo')?.enable();
    } else {
      this.formularioGrado.get('prestamo')?.disable();
    }
  }

  poner_codigo() {
    if (this.data.valores?.laboral?.[0]?.codigo) {
      this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
    }
  }

  add_grado() {
    // Filtrar solo las filas marcadas como "conservar"
    const gradosGuardar = this.filasArray.controls
      .filter(control => control.get('conservar')?.value === true)
      .map(control => ({
        grade: control.get('grade')?.value,
        titulo: control.get('titulo')?.value,
        fecha: control.get('fecha')?.value,
        lugar: control.get('lugar')?.value,
        pais: control.get('pais')?.value,
        revalidado: control.get('revalidado')?.value,
        fechaRevalidado: control.get('fechaRevalidado')?.value,
        conservar: control.get('conservar')?.value,
      }));

    let body = {
      id: this.formularioGrado.value?.id,
      grado: JSON.parse(JSON.stringify(gradosGuardar)),
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      maximo_grado: this.formularioGrado.get('maximo_grado')?.value,
      bgac: this.formularioGrado.value?.bgac || false,
      bga: this.formularioGrado.value?.bga || '',
      prestamoc: this.formularioGrado.value?.prestamoc || false,
      prestamo: this.formularioGrado.value?.prestamo || '',
    };

    this.cgdepr.ponerurl("docentesgrado");

    if (this.fnc == true) {
      this.cgdepr.add(body).subscribe({
        next: (data) => {
          console.log("agregado", data);
          Swal.fire({
            title: "Agregado",
            text: "Los datos se han guardado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
          this.dialogRef.close(this.formularioGrado.value);
        },
        error: (error) => {
          console.error("Error al agregar:", error);
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al guardar los datos",
            icon: "error"
          });
        }
      });
    } else {
      this.cgdepr.update(body.codigoDocente, body).subscribe({
        next: (data) => {
          console.log("actualizado", data);
          Swal.fire({
            title: "Actualizado",
            text: "Los datos se han actualizado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
          this.dialogRef.close(this.formularioGrado.value);
        },
        error: (error) => {
          console.error("Error al actualizar:", error);
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al actualizar los datos",
            icon: "error"
          });
        }
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  verificarInfo(data: any): string {
    if (data && data !== undefined) {
      return `${data.nombres || ''} ${data.apellidos || ''}`.trim();
    }
    return "";
  }
}


