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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, of, startWith } from 'rxjs';

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
    MatAutocompleteModule
  ],
  templateUrl: './docentecursodlg.component.html',
  styleUrl: './docentecursodlg.component.scss'
})
export class DocentecursodlgComponent {
  formularioGrado?: FormGroup | any = null;
  departamentos?: DocenteCurso[];
  funcion: any;
  fnc: boolean = true;
  cursos: Curso[] = [];
  cursosFiltrados!: Observable<Curso[]>;

  modalidad = ["Presencial", "Semipresencial", "Virtual", "A distancia", "Práctica"];
  tipo = ["Clase", "Asesoría", "Práctica", "Taller"];
  tipo_clase = ["Regular", "Compartida", "Codictado"];
  estado = ["Provisionado", "Provisionado asesoría", "Pendiente", "Falta de V°B° JD",
    "Rechazado", "Duplicado", "Desprovisionado", "No provisionado", "Horario Cerrado", "Curso Cerrado",
    "Cerrado", "Cancelado"];

  constructor(
    public dialogRef: MatDialogRef<DocentecursodlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service
  ) { }

  ngOnInit(): void {
    console.log(this.data);

    // Inicializar formulario PRIMERO
    this.formularioGrado = this.formBuilder.group({
      id: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      codigoCurso: [''],
      cursoNombre: [''],
      codigoDocente: [''],
      modalidad: [''],
      tipo: [''],
      tipo_clase: [''],
      estado: [''],
      horas_semana: [''],
      horario: [''],
    });

    // Cargar cursos primero
    this.saux1.ponerurl("curso");
    this.saux1.get().subscribe(cursosData => {
      console.log("Cursos cargados:", cursosData);
      this.cursos = cursosData;

      // Inicializar el observable de cursos filtrados
      this.cursosFiltrados = this.formularioGrado.get('cursoNombre')!.valueChanges.pipe(
        startWith(''),
        map((value:any) => typeof value === 'string' ? value : (value?.nombre || '')),
        map((name:any) => name ? this._filterCursos(name) : this.cursos || [])
      );

      // AHORA, después de cargar los cursos, poner los datos si es modo edición
      if (this.data.modo == 1) {
        this.funcion = "Editar";
        this.fnc = false;
        this.poner_datos();
      } else {
        this.funcion = "Añadir";
        this.poner_codigo();
        this.fnc = true;
      }
    });

    this.cgdepr.ponerurl("docentescurso");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.departamentos = data;
    });
  }

  poner_datos() {
    console.log("Poner datos - valores recibidos:", this.data.valores);
    console.log("Cursos disponibles:", this.cursos);

    // Buscar el nombre del curso basado en el código
    let nombreCurso = '';
    if (this.cursos && this.data.valores.codigoCurso) {
      const cursoEncontrado = this.cursos.find(c => c.codigo === this.data.valores.codigoCurso);
      console.log("Curso encontrado:", cursoEncontrado);
      if (cursoEncontrado) {
        nombreCurso = cursoEncontrado.nombre;
      }
    }

    // Formatear fechas correctamente
    let fechaInicio = this.data.valores.fecha_inicio ? new Date(this.data.valores.fecha_inicio) : '';
    let fechaFin = this.data.valores.fecha_fin ? new Date(this.data.valores.fecha_fin) : '';

    this.formularioGrado.setValue({
      id: this.data.valores.id || '',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      codigoCurso: this.data.valores.codigoCurso || '',
      cursoNombre: nombreCurso,  // ← Asignar el nombre del curso
      codigoDocente: this.data.valores.codigoDocente || '',
      modalidad: this.data.valores.modalidad || '',
      tipo: this.data.valores.tipo || '',
      tipo_clase: this.data.valores.tipo_clase || '',
      estado: this.data.valores.estado || '',
      horas_semana: this.data.valores.horas_semana || '',
      horario: this.data.valores.horario || '',
    });

    console.log("Formulario después de setValue:", this.formularioGrado.value);
  }

  // Filtrar cursos mientras se escribe
  private _filterCursos(value: string): Curso[] {
    const filterValue = value.toLowerCase();
    if (!this.cursos || this.cursos.length === 0) return [];
    return this.cursos.filter(curso =>
      curso.nombre.toLowerCase().includes(filterValue) ||
      curso.codigo.toLowerCase().includes(filterValue)
    );
  }

  // Cuando el usuario escribe en el campo de curso
  onCursoInput(event: any) {
    const value = event.target.value;
    if (this.cursosFiltrados) {
      this.cursosFiltrados = of(this._filterCursos(value));
    }
  }

  // Cuando se selecciona un curso del autocomplete
  onCursoSeleccionado(event: any) {
    const cursoSeleccionado = this.cursos?.find(c => c.nombre === event.option.value);
    if (cursoSeleccionado) {
      this.formularioGrado.patchValue({
        codigoCurso: cursoSeleccionado.codigo,
        cursoNombre: cursoSeleccionado.nombre
      });
    }
  }

  // Función para mostrar el nombre del curso en el input
  displayCursoFn(curso: Curso): string {
    return curso && curso.nombre ? curso.nombre : '';
  }

  onDateInput(event: any, fieldName: string) {
    const value = event.target.value;
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const matches = value.match(datePattern);
    if (matches) {
      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const year = parseInt(matches[3], 10);
      const date = new Date(year, month, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        this.formularioGrado.get(fieldName)?.setValue(date);
      }
    }
  }

  onPaste(event: ClipboardEvent, campo: string) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const cleanText = pastedText.replace(/[^\d]/g, '');

    let fecha: Date | null = null;

    if (cleanText.length === 8) {
      const day = parseInt(cleanText.substring(0, 2), 10);
      const month = parseInt(cleanText.substring(2, 4), 10) - 1;
      const year = parseInt(cleanText.substring(4, 8), 10);
      fecha = new Date(year, month, day);
    } else if (pastedText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dayStr, monthStr, yearStr] = pastedText.split('/');
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);
      fecha = new Date(year, month, day);
    }

    if (fecha) {
      const fechaControl = this.formularioGrado.get(campo);
      fechaControl?.patchValue(fecha);

      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }
  }

  poner_codigo() {
    this.formularioGrado.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }

  add_grado() {
    let body = {
      id: this.formularioGrado.value?.id,
      fecha_inicio: new Date(this.formularioGrado.value?.fecha_inicio),
      fecha_fin: new Date(this.formularioGrado.value?.fecha_fin),
      codigoCurso: this.formularioGrado.value?.codigoCurso,
      codigoDocente: this.formularioGrado.value?.codigoDocente,
      modalidad: this.formularioGrado.value?.modalidad,
      tipo: this.formularioGrado.value?.tipo,
      tipo_clase: this.formularioGrado.value?.tipo_clase,
      estado: this.formularioGrado.value?.estado,
      horas_semana: this.formularioGrado.value?.horas_semana,
      horario: this.formularioGrado.value?.horario,
    };

    this.cgdepr.ponerurl("docentescurso");

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
        });
      } else {
        this.cgdepr.update(body.codigoDocente, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formularioGrado.value);
        });
      }
      this.dialogRef.close(this.formularioGrado.value);
    } else {
      this.formularioGrado?.markAllAsTouched();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  verificarInfo(data: any) {
    if (data != undefined) {
      console.log(data);
      return `${data.nombres} ${data.apellidos}`;
    } else {
      console.log("data");
      return "";
    }
  }
}
