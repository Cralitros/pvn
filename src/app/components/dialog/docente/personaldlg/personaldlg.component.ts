import { ChangeDetectionStrategy, Component, computed, inject, Inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Condiciones } from '../../../modelos/condiciones';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepicker, MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { Departamento } from '../../../modelos/departamento';
import { Provincia } from '../../../modelos/provincia';
import { Distrito } from '../../../modelos/distrito';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { Aux1Service } from '../../../../services/aux1.service';
import { Aux2Service } from '../../../../services/aux2.service';
import { Aux3Service } from '../../../../services/aux3.service';
import { Column } from '../../../modelos/column';
import { Grado } from '../../../modelos/grado';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Saux4Service } from '../../../../services/saux4.service';
import { Banco } from '../../../modelos/banco';
import { Afp } from '../../../modelos/afp';
import Swal from 'sweetalert2';
import { Nacionalidad } from '../../../modelos/nacionalidad';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Tabla2Component } from "../../../objetos/tabla2/tabla2.component";
import { GradoComponent } from "../../../docente/grado/grado.component";
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { lastValueFrom } from 'rxjs';

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

@Component({
  selector: 'app-personaldlg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personaldlg.component.html',
  styleUrl: './personaldlg.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
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
    Tabla2Component,
    GradoComponent,
    MatCheckboxModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class PersonaldlgComponent {

  formulario1!: FormGroup;
  formulario2!: FormGroup;
  fechaNacimientoControl!: FormControl;
  fechaFallecimientoControl!: FormControl;

  condiciones: Condiciones[] = [];
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];
  bancosarr: Banco[] = [];
  afpsarr: Afp[] = [];
  nacionalidades: Nacionalidad[] = [];

  funcion: string = '';
  fnc: boolean = true;
  estadosc = ["Soltero(a)", "Conviviente", "Unión de hecho", "Casado(a)", "Divorciado(a)", "Separado(a)", "Viudo(a)", "Otro(a)"];
  sexos = ["Masculino", "Femenino"];

  private readonly _adapter = inject<DateAdapter<unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    if (this._locale() === 'ja-JP') {
      return 'YYYY/MM/DD';
    } else if (this._locale() === 'es-ES') {
      return 'DD/MM/YYYY';
    }
    return '';
  });

  public selectedIndex = 0;
  selectedValue?: string;
  @ViewChild('picker2') picker2?: MatDatepicker<Date>;
  nacionalidadSeleccionada: Nacionalidad[] = [];
  paisSeleccionado: Nacionalidad | null = null;

  constructor(
    public dialogRef: MatDialogRef<PersonaldlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service,
    private saux2: Aux2Service,
    private saux3: Aux3Service,
    private saux4: Saux4Service,
  ) { }

  validar_dato(dato: any): string {
    return dato == null ? '' : dato;
  }

  poner_datos(): void {
    const valores = this.data.valores;
    const lugarNacimiento = JSON.parse(valores.lugar_nacimiento || '{}');
    this.selectedValue = lugarNacimiento.departamento;

    this.formulario1.patchValue({
      codigo: this.validar_dato(valores.codigo),
      digito: this.validar_dato(valores.digito),
      dni: this.validar_dato(valores.dni),
      pasaporte: this.validar_dato(valores.pasaporte),
      nombres: this.validar_dato(valores.nombres),
      apellidos: this.validar_dato(valores.apellidos),
      fallecimiento: !!valores.fallecimiento,
      fecha_fallecimiento: valores.fecha_fallecimiento ? new Date(valores.fecha_fallecimiento + 'T00:00:00') : null,
      fecha_nacimiento: valores.fecha_nacimiento ? new Date(valores.fecha_nacimiento + 'T00:00:00') : null,
      departamento: this.validar_dato(lugarNacimiento.departamento),
      provincia: this.validar_dato(lugarNacimiento.provincia),
      distrito: this.validar_dato(lugarNacimiento.distrito),
      sexo: this.validar_dato(valores.sexo),
      domicilio: this.validar_dato(valores.domicilio),
      telefono: this.validar_dato(valores.telefono),
      celular: this.validar_dato(valores.celular),
      estado_civil: this.validar_dato(valores.estado_civil),
      numero_hijos: this.validar_dato(valores.numero_hijos),
      nacionalidad: this.validar_dato(valores.nacionalidad?.nombre),
      pais: this.validar_dato(valores.nacionalidad?.pais),
      fecha_cv: valores.fecha_cv ? new Date(valores.fecha_cv + 'T00:00:00') : null,
      especialidad: this.validar_dato(valores.especialidad),
      edad: valores.fecha_nacimiento ? this.obtener_edad(new Date(valores.fecha_nacimiento + 'T00:00:00')) : '',
    });

    this.formulario2.patchValue({
      banco: this.validar_dato(valores.banco),
      cuenta: this.validar_dato(valores.cuenta),
      afp: this.validar_dato(valores.afp),
      cussp: this.validar_dato(valores.cussp),
      afiliacion: this.validar_dato(valores.afiliacion),
      ruc: this.validar_dato(valores.ruc),
      observaciones: this.validar_dato(valores.observaciones)
    });

    this.actualizarValidacionCuenta(valores.banco, true);
    if (valores.nacionalidad?.pais) {
      this.actualizarNacionalidad(valores.nacionalidad.pais, true);
    }

    if (lugarNacimiento.departamento) {
      const deptObj = this.departamentos.find(d => d.valor === String(lugarNacimiento.departamento));
      if (deptObj) {
        this.formulario1.get('departamento')?.setValue(deptObj.id);
        this.onSelectChangeDepartamento(deptObj.id);

        // Cargar provincia después de que las provincias estén disponibles
        setTimeout(() => {
          if (lugarNacimiento.provincia && this.provincias.length > 0) {
            const provObj = this.provincias.find(p => p.nombre === lugarNacimiento.provincia);
            if (provObj) {
              this.formulario1.get('provincia')?.setValue(provObj.id);
              this.onSelectChangeProvincia(provObj);
            }
          }
        }, 200);
      }
    }
  }

  obtener_edad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  dateFormatValidator(format: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (control.value instanceof Date) return null;

      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const matches = control.value.match(datePattern);
      if (!matches) return { invalidFormat: true };

      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const year = parseInt(matches[3], 10);

      const date = new Date(year, month, day);
      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return { invalidDate: true };
      }
      return null;
    };
  }

  onDateInput(event: any, fieldName: string): void {
    const value = event.target.value;
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const matches = value.match(datePattern);

    if (matches) {
      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const year = parseInt(matches[3], 10);
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        this.formulario1.get(fieldName)?.setValue(date);
      }
    }
  }

  async ngOnInit() {
    this.initForms();

    await this.loadDependencies();

    if (this.data.modo === 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }

    this.subscribeToFormChanges();
  }

  private initForms(): void {
    this.fechaNacimientoControl = new FormControl('', [Validators.required, this.dateFormatValidator('DD/MM/YYYY')]);
    this.fechaFallecimientoControl = new FormControl({ value: null, disabled: true }, [this.dateFormatValidator('DD/MM/YYYY')]);

    this.formulario1 = this.formBuilder.group({
      codigo: [''],
      digito: [''],
      dni: [''],
      pasaporte: [''],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fallecimiento: [false],
      fecha_fallecimiento: this.fechaFallecimientoControl,
      fecha_nacimiento: this.fechaNacimientoControl,
      departamento: [''],
      provincia: [''],
      distrito: [''],
      sexo: [''],
      domicilio: [''],
      telefono: [''],
      celular: [''],
      estado_civil: [''],
      numero_hijos: [''],
      nacionalidad: [''],
      pais: ['Perú'],
      fecha_cv: [''],
      especialidad: [''],
      edad: ['']
    });

    this.formulario2 = this.formBuilder.group({
      banco: [''],
      cuenta: [''],
      afp: [''],
      cussp: [''],
      afiliacion: [''],
      ruc: [''],
      observaciones: ['']
    });
  }

  private async loadDependencies() {
    /*this.saux1.ponerurl("departamentos");
    this.saux1.get().subscribe(data => this.departamentos = data);*/

    this.saux1.ponerurl("departamentos");
    const source$ = this.saux1.get();
    this.departamentos = await lastValueFrom(source$);

    this.saux2.ponerurl("bancos");
    this.saux2.get().subscribe(data => this.bancosarr = data);

    this.saux3.ponerurl("afps");
    this.saux3.get().subscribe(data => this.afpsarr = data);

    this.saux4.ponerurl("nacionalidad");
    this.saux4.get().subscribe(data => this.nacionalidades = data);

    this.cgdepr.ponerurl("docentes");
    this.cgdepr.get().subscribe(data => this.condiciones = data);
  }

  private subscribeToFormChanges(): void {
    this.formulario2.get('banco')?.valueChanges.subscribe((banco: string) => {
      this.actualizarValidacionCuenta(banco, this.data.modo === 1);
    });

    this.formulario1.get('pais')?.valueChanges.subscribe((pais: string) => {
      this.actualizarNacionalidad(pais, this.data.modo === 1);
    });

    this.formulario1.get('fallecimiento')?.valueChanges.subscribe((checked: boolean) => {
      const ctrl = this.formulario1.get('fecha_fallecimiento');
      if (checked) {
        ctrl?.enable();
      } else {
        ctrl?.disable();
        ctrl?.reset();
      }
    });
  }

  onPaste(event: ClipboardEvent, campo: string): void {
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
      const [d, m, y] = pastedText.split('/');
      fecha = new Date(+y, +m - 1, +d);
    }

    if (fecha && !isNaN(fecha.getTime())) {
      this.formulario1.get(campo)?.patchValue(fecha);
      setTimeout(() => this.formulario1.get(campo)?.updateValueAndValidity());
    }
  }

  naciona(datos: Nacionalidad): string {
    this.nacionalidadSeleccionada = [datos];
    return datos.pais;
  }

  actualizarNacionalidad(selectedPais: string, isEditMode = false): void {
    const deptCtrl = this.formulario1.get('departamento');
    const provCtrl = this.formulario1.get('provincia');
    const distCtrl = this.formulario1.get('distrito');

    if (selectedPais !== 'Perú') {
      [deptCtrl, provCtrl, distCtrl].forEach(ctrl => {
        ctrl?.clearValidators();
        ctrl?.disable();
        ctrl?.setValue('');
      });
    } else {
      [deptCtrl, provCtrl, distCtrl].forEach(ctrl => ctrl?.enable());
    }

    /*const nacionalidad = this.nacionalidades.find(n => n.pais === selectedPais);
    this.paisSeleccionado = nacionalidad || null;
    this.formulario1.get('nacionalidad')?.setValue(nacionalidad?.nombre || '');*/

    //  [deptCtrl, provCtrl, distCtrl].forEach(ctrl => ctrl?.updateValueAndValidity());
  }

  actualizarValidacionCuenta(selectedBanco: string, isEditMode = false): void {
    const cuentaControl: any = this.formulario2.get('cuenta');
    if (selectedBanco === 'No registrado') {
      cuentaControl?.clearValidators();
      if (cuentaControl?.value === '' || cuentaControl?.value == null) {
        cuentaControl.patchValue('0000000000');
      }
    } else {
      cuentaControl?.setValidators([Validators.required]);
    }
    cuentaControl?.updateValueAndValidity();
  }

  tabActive(event: any): void {
    this.item = event.index;
    this.siguiente(event.index);
    this.selectedIndex = event.index;
  }

  item = 0;

  siguiente(num: number): void {
    this.selectedIndex = num;
  }

  onSubmit(): void {
    if (this.formulario1.invalid || this.formulario2.invalid) {
      this.formulario1.markAllAsTouched();
      this.formulario2.markAllAsTouched();

      const camposFaltantes: string[] = [];
      [this.formulario1, this.formulario2].forEach(form => {
        Object.keys(form.controls).forEach(key => {
          const ctrl = form.get(key);
          if (ctrl?.invalid && ctrl?.errors?.['required']) {
            camposFaltantes.push(key);
          }
        });
      });

      if (camposFaltantes.length) {
        Swal.fire({
          title: "Campos obligatorios incompletos",
          html: `<ul style="text-align: left">${camposFaltantes.map(c => `<li>${c}</li>`).join('')}</ul>`,
          icon: "warning"
        });
      }
      return;
    }

    const lugarNacimiento = {
      departamento: this.formulario1.value.departamento,
      provincia: this.formulario1.value.provincia,
      distrito: this.formulario1.value.distrito
    };

    const body = {
      codigo: this.formulario1.value.codigo,
      digito: this.formulario1.value.digito,
      dni: this.formulario1.value.dni,
      pasaporte: this.formulario1.value.pasaporte,
      nombres: this.formulario1.value.nombres,
      apellidos: this.formulario1.value.apellidos,
      fecha_nacimiento: this.formulario1.value.fecha_nacimiento,
      lugar_nacimiento: JSON.stringify(lugarNacimiento),
      fallecimiento: this.formulario1.value.fallecimiento,
      fecha_fallecimiento: this.formulario1.value.fecha_fallecimiento,
      sexo: this.formulario1.value.sexo,
      domicilio: this.formulario1.value.domicilio,
      telefono: this.formulario1.value.telefono,
      celular: this.formulario1.value.celular,
      estado_civil: this.formulario1.value.estado_civil,
      numero_hijos: this.formulario1.value.numero_hijos,
      pais: this.formulario1.value.pais,
      banco: this.formulario2.value.banco,
      cuenta: this.formulario2.value.cuenta,
      afp: this.formulario2.value.afp,
      cussp: this.formulario2.value.cussp,
      afiliacion: this.formulario2.value.afiliacion,
      fecha_cv: this.formulario1.value.fecha_cv,
      ruc: this.formulario2.value.ruc,
      observaciones: this.formulario2.value.observaciones,
      idDepartamento: this.formulario1.value.departamento || undefined,
      idProvincia: this.formulario1.value.provincia || undefined,
      idDistrito: this.formulario1.value.distrito || undefined,
      idNacionalidad: this.paisSeleccionado?.id,
      especialidad: this.formulario1.value.especialidad,
    };

    this.cgdepr.ponerurl("docentes");
    if (this.fnc) {
      this.cgdepr.add(body).subscribe(() => {
        Swal.fire({ title: "Agregado", text: "Continuar", icon: "info" });
        this.dialogRef.close(body);
      });
    } else {
      this.cgdepr.update(body.codigo, body).subscribe(() => {
        Swal.fire({ title: "Actualizado", text: "Continuar", icon: "info" });
        this.dialogRef.close(body);
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSelectChangeDepartamento(event: any): void {
    const value = event?.value || event;
    if (!value) return;

    this.saux2.ponerurl("provincias");
    if (this.data.modo === 1) {
      this.saux2.getid(value).subscribe(data => {
        this.provincias = data;
        const provNombre = JSON.parse(this.data.valores.lugar_nacimiento)?.provincia;
        const provincia = this.provincias.find(p => Number(p.id) === Number(provNombre));
        this.formulario1.get('provincia')?.setValue(provincia?.id);

        if (provincia) this.onSelectChangeProvincia(provincia);
      });
    } else {
      this.saux2.getid(value).subscribe(data => this.provincias = data);
    }
  }

  onSelectChangeProvincia(event: any): void {
    const value = event?.value || (event?.id ? event.id : null);
    if (!value) return;

    this.saux3.ponerurl("distritos");
    this.saux3.getid(value).subscribe(data => {
      this.distritos = data;
      const provNombre = JSON.parse(this.data.valores.lugar_nacimiento)?.distrito;
      const distrito = this.distritos.find(p => Number(p.id) === Number(provNombre));
      this.formulario1.get('distrito')?.setValue(distrito?.id);
    });
  }

  // --- Métodos de formularios adicionales (laboral, grado, etc.) ---
  // (mantenidos tal como estaban, solo eliminando comentarios innecesarios)
  formularioLaboral?: FormGroup;
  formularioCategoria?: FormGroup;
  formularioGrado?: FormGroup;
  formularioInvestigador?: FormGroup;

  poner_laboral(data: any): void {
    this.formularioLaboral?.setValue({
      trabajo: data.trabajo,
      cargo_actual: data.cargo_actual,
      tipo_empresa: data.tipo_empresa,
      direccion_empresa: data.direccion_empresa,
      telefono_empresa: data.telefono_empresa,
      correo_corporativo: data.correo_corporativo,
      correo_personal: data.correo_personal,
      correo_alternativo: data.correo_alternativo,
      contacto: data.contacto,
      codigoDocente: data.codigoDocente,
    });
  }

  mensajeLaboral = "guardar";

  guardar_laboral(): void {
    this.saux2.ponerurl("docenteslaboral");
    if (this.mensajeLaboral === "guardar") {
      this.saux2.add(this.formularioLaboral?.value).subscribe();
    } else {
      this.saux2.update(this.formularioLaboral?.value.codigoDocente, this.formularioLaboral?.value).subscribe();
    }
  }

  tablaGrado: Grado[] = [];
  columnsg: Column[] = [
    { columnDef: 'grado', header: 'Grado', cell: (e: Grado) => `${e.grado}` },
    { columnDef: 'revalidado', header: 'Revalidado', cell: (e: Grado) => `${e.revalidado}` },
    { columnDef: 'lugar_obtencion', header: 'Lugar obtencion', cell: (e: Grado) => `${e.lugar_obtencion}` },
    { columnDef: 'fecha_obtencion', header: 'Fecha obtencion', cell: (e: Grado) => `${e.fecha_obtencion}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }
  ];
  dataSourceg = new MatTableDataSource<any>([]);

  add_grado(): void { }

  editar(element: any): void {
    console.log('Editar:', element);
  }

  eliminar(element: any): void {
    console.log('Eliminar:', element);
  }
}