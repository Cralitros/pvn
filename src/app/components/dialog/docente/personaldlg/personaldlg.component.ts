import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

// Angular Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepicker, MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';

// Modelos
import { Condiciones } from '../../../modelos/condiciones';
import { Departamento } from '../../../modelos/departamento';
import { Provincia } from '../../../modelos/provincia';
import { Distrito } from '../../../modelos/distrito';
import { Column } from '../../../modelos/column';
import { Grado } from '../../../modelos/grado';
import { Banco } from '../../../modelos/banco';
import { Afp } from '../../../modelos/afp';
import { Nacionalidad } from '../../../modelos/nacionalidad';

// Servicios
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Aux1Service } from '../../../../services/aux1.service';
import { Aux2Service } from '../../../../services/aux2.service';
import { Aux3Service } from '../../../../services/aux3.service';
import { Saux4Service } from '../../../../services/saux4.service';

// Componentes
import { Tabla2Component } from '../../../objetos/tabla2/tabla2.component';
import { GradoComponent } from '../../../docente/grado/grado.component';

import Swal from 'sweetalert2';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
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
    MatFormField,
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
    MatCheckboxModule,
    Tabla2Component,
    GradoComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class PersonaldlgComponent {

  // ─── Formularios ────────────────────────────────────────────────────────────
  formulario1!: FormGroup;
  formulario2!: FormGroup;
  fechaNacimientoControl!: FormControl;
  fechaFallecimientoControl!: FormControl;

  // Formularios adicionales (laboral, grado, etc.)
  formularioLaboral?: FormGroup;
  formularioCategoria?: FormGroup;
  formularioGrado?: FormGroup;
  formularioInvestigador?: FormGroup;

  // ─── Datos de catálogos ─────────────────────────────────────────────────────
  condiciones: Condiciones[] = [];
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];
  bancosarr: Banco[] = [];
  afpsarr: Afp[] = [];
  nacionalidades: Nacionalidad[] = [];

  // ─── Estado del componente ──────────────────────────────────────────────────
  funcion = '';
  fnc = true;
  selectedIndex = 0;
  item = 0;
  selectedValue?: string;
  paisSeleccionado: Nacionalidad | null = null;
  nacionalidadSeleccionada: Nacionalidad[] = [];
  mensajeLaboral = 'guardar';

  // ─── Constantes de opciones ─────────────────────────────────────────────────
  readonly estadosc = [
    'Soltero(a)', 'Conviviente', 'Unión de hecho', 'Casado(a)',
    'Divorciado(a)', 'Separado(a)', 'Viudo(a)', 'Otro(a)',
  ];
  readonly sexos = ['Masculino', 'Femenino'];

  // ─── Tabla Grado ────────────────────────────────────────────────────────────
  tablaGrado: Grado[] = [];
  dataSourceg = new MatTableDataSource<any>([]);
  columnsg: Column[] = [
    { columnDef: 'grado', header: 'Grado', cell: (e: Grado) => `${e.grado}` },
    { columnDef: 'revalidado', header: 'Revalidado', cell: (e: Grado) => `${e.revalidado}` },
    { columnDef: 'lugar_obtencion', header: 'Lugar obtención', cell: (e: Grado) => `${e.lugar_obtencion}` },
    { columnDef: 'fecha_obtencion', header: 'Fecha obtención', cell: (e: Grado) => `${e.fecha_obtencion}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true },
  ];

  // ─── Date locale ────────────────────────────────────────────────────────────
  private readonly _adapter = inject<DateAdapter<unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    if (this._locale() === 'ja-JP') return 'YYYY/MM/DD';
    if (this._locale() === 'es-ES') return 'DD/MM/YYYY';
    return '';
  });

  @ViewChild('picker2') picker2?: MatDatepicker<Date>;

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

  // ─── Ciclo de vida ──────────────────────────────────────────────────────────

  async ngOnInit() {
    this.initForms();
    await this.loadDependencies();

    // ✅ Suscribirse PRIMERO para que los cambios se detecten
    this.subscribeToFormChanges();

    if (this.data.modo === 1) {
      this.funcion = 'Editar';
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = 'Añadir';
      this.fnc = true;
      // ✅ CORRECCIÓN: Inicializar manualmente el país y nacionalidad por defecto 
      // para que se dispare la lógica de llenado y habilitación de campos.
      const paisDefault = 'Perú';
      const nacDefault = this.nacionalidades.find(n => n.pais === paisDefault);

      if (nacDefault) {
        this.paisSeleccionado = nacDefault; // ✅ Clave para que se guarde el ID correcto al enviar
        this.formulario1.get('pais')?.setValue(nacDefault.pais);
        this.formulario1.get('nacionalidad')?.setValue(nacDefault.nombre);
        this.actualizarNacionalidad(paisDefault, false);
      }
    }


  }

  // ─── Inicialización ─────────────────────────────────────────────────────────

  private initForms(): void {
    this.fechaNacimientoControl = new FormControl('', [
      Validators.required,
      this.dateFormatValidator('DD/MM/YYYY'),
    ]);
    this.fechaFallecimientoControl = new FormControl(
      { value: null, disabled: true },
      [this.dateFormatValidator('DD/MM/YYYY')]
    );

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
      edad: [''],
    });

    this.formulario2 = this.formBuilder.group({
      banco: [''],
      cuenta: [''],
      afp: [''],
      cussp: [''],
      afiliacion: [''],
      ruc: [''],
      observaciones: [''],
    });
  }

  private async loadDependencies(): Promise<void> {
    this.saux1.ponerurl('departamentos');
    this.departamentos = await lastValueFrom(this.saux1.get());

    this.saux2.ponerurl('bancos');
    this.bancosarr = await lastValueFrom(this.saux2.get());

    this.saux3.ponerurl('afps');
    this.afpsarr = await lastValueFrom(this.saux3.get());

    this.saux4.ponerurl('nacionalidad');
    this.nacionalidades = await lastValueFrom(this.saux4.get());

    this.cgdepr.ponerurl('docentes');
    this.condiciones = await lastValueFrom(this.cgdepr.get());
  }

  private subscribeToFormChanges(): void {
    this.formulario2.get('banco')?.valueChanges.subscribe((banco: string) =>
      this.actualizarValidacionCuenta(banco, this.data.modo === 1)
    );

    this.formulario1.get('pais')?.valueChanges.subscribe((pais: string) =>
      this.actualizarNacionalidad(pais, this.data.modo === 1)
    );

    this.formulario1.get('fallecimiento')?.valueChanges.subscribe((checked: boolean) => {
      const ctrl = this.formulario1.get('fecha_fallecimiento');
      if (checked) {
        ctrl?.enable();
      } else {
        ctrl?.disable();
        ctrl?.reset();
      }
    });
    // ✅ NUEVO: Calcular edad automáticamente al cambiar fecha de nacimiento
    this.formulario1.get('fecha_nacimiento')?.valueChanges.subscribe((fecha: Date | string | null) => {
      this.formulario1.get('edad')?.setValue(this.calcularEdadDetallada(fecha));
    });
  }

  calcularEdadDetallada(fechaNacimiento: Date | string | null): string {
    if (!fechaNacimiento) return '';

    const fecha = fechaNacimiento instanceof Date ? fechaNacimiento : new Date(fechaNacimiento);
    if (isNaN(fecha.getTime())) return '';

    const hoy = new Date();
    let años = hoy.getFullYear() - fecha.getFullYear();
    let meses = hoy.getMonth() - fecha.getMonth();
    let dias = hoy.getDate() - fecha.getDate();

    // Ajuste por días negativos (mes incompleto)
    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += ultimoDiaMesAnterior;
    }
    // Ajuste por meses negativos (año incompleto)
    if (meses < 0) {
      años--;
      meses += 12;
    }

    return `${años} años, ${meses} meses, ${dias} días`;
  }
  // ─── Datos iniciales (modo edición) ─────────────────────────────────────────

  poner_datos(): void {
    const valores = this.data.valores;
    const lugarNacimiento = JSON.parse(valores.lugar_nacimiento || '{}');
    this.selectedValue = lugarNacimiento.departamento;

    const nacData = valores.nacionalidad;
    let paisVal = 'Perú';
    let nacNombre = '';

    if (nacData && typeof nacData === 'object') {
      // Si viene como objeto { id, pais, nombre }
      paisVal = nacData.pais || 'Perú';
      nacNombre = nacData.nombre || '';
      this.paisSeleccionado = nacData; // ✅ Clave: guarda el objeto para recuperar el ID al editar
    } else {
      // Si viene como string directo
      nacNombre = nacData || '';
      const encontrada = this.nacionalidades.find(n => n.nombre === nacNombre);
      if (encontrada) {
        paisVal = encontrada.pais;
        this.paisSeleccionado = encontrada;
      }
    }

    this.formulario1.patchValue({
      codigo: this.validar_dato(valores.codigo),
      digito: this.validar_dato(valores.digito),
      dni: this.validar_dato(valores.dni),
      pasaporte: this.validar_dato(valores.pasaporte),
      nombres: this.validar_dato(valores.nombres),
      apellidos: this.validar_dato(valores.apellidos),
      fallecimiento: !!valores.fallecimiento,
      fecha_fallecimiento: valores.fecha_fallecimiento
        ? new Date(valores.fecha_fallecimiento + 'T00:00:00') : null,
      fecha_nacimiento: valores.fecha_nacimiento
        ? new Date(valores.fecha_nacimiento + 'T00:00:00') : null,
      departamento: this.validar_dato(lugarNacimiento.departamento),
      provincia: this.validar_dato(lugarNacimiento.provincia),
      distrito: this.validar_dato(lugarNacimiento.distrito),
      sexo: this.validar_dato(valores.sexo),
      domicilio: this.validar_dato(valores.domicilio),
      telefono: this.validar_dato(valores.telefono),
      celular: this.validar_dato(valores.celular),
      estado_civil: this.validar_dato(valores.estado_civil),
      numero_hijos: this.validar_dato(valores.numero_hijos),
      nacionalidad: nacNombre,
      pais: paisVal,
      fecha_cv: valores.fecha_cv
        ? new Date(valores.fecha_cv + 'T00:00:00') : null,
      especialidad: this.validar_dato(valores.especialidad),
      edad: valores.fecha_nacimiento
        ? this.calcularEdadDetallada(new Date(valores.fecha_nacimiento + 'T00:00:00'))
        : '',
    });

    this.formulario2.patchValue({
      banco: this.bancosarr.find(b => b.nombre === valores.banco)?.id || this.validar_dato(valores.banco),
      afp: this.afpsarr.find(a => a.nombre === valores.afp)?.id || this.validar_dato(valores.afp),

      cuenta: this.validar_dato(valores.cuenta),

      cussp: this.validar_dato(valores.cussp),
      afiliacion: this.validar_dato(valores.afiliacion),
      ruc: this.validar_dato(valores.ruc),
      observaciones: this.validar_dato(valores.observaciones),
    });

    this.actualizarValidacionCuenta(valores.banco, true);

    // ─── En poner_datos(), después del patchValue ───────────────────────────────
    // ✅ CORRECCIÓN: Buscar y asignar el objeto completo de nacionalidad
    if (valores.nacionalidad) {
      let nacObj: Nacionalidad | null = null;

      // Si viene como objeto con id
      if (typeof valores.nacionalidad === 'object' && valores.nacionalidad.id) {
        nacObj = valores.nacionalidad;
      }
      // Si viene como string (nombre del país)
      else if (typeof valores.nacionalidad === 'string') {
        nacObj = this.nacionalidades.find(n => n.pais === valores.nacionalidad) || null;
      }
      // Si viene como objeto con pais
      else if (valores.nacionalidad.pais) {
        nacObj = this.nacionalidades.find(n => n.pais === valores.nacionalidad.pais) || null;
      }

      if (nacObj) {
        this.paisSeleccionado = nacObj;
        this.formulario1.get('pais')?.setValue(nacObj.pais);
        this.formulario1.get('nacionalidad')?.setValue(nacObj.nombre);
      }

      this.actualizarNacionalidad(this.paisSeleccionado?.pais || 'Perú', true);
    }

    if (lugarNacimiento.departamento) {
      const deptObj = this.departamentos.find(
        d => d.valor === String(lugarNacimiento.departamento)
      );
      if (deptObj) {
        this.formulario1.get('departamento')?.setValue(deptObj.id);
        this.onSelectChangeDepartamento(deptObj.id);

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

    // ✅ Agregar esto al final para habilitar el campo si fallecimiento=true
    if (valores.fallecimiento) {
      this.formulario1.get('fecha_fallecimiento')?.enable();
    } else {
      this.formulario1.get('fecha_fallecimiento')?.disable();
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  validar_dato(dato: any): string {
    return dato == null ? '' : dato;
  }

  obtener_edad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  // ─── Validación de fechas ───────────────────────────────────────────────────

  dateFormatValidator(format: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value instanceof Date) return null;

      const matches = control.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!matches) return { invalidFormat: true };

      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const year = parseInt(matches[3], 10);
      const date = new Date(year, month, day);

      return date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day
        ? { invalidDate: true }
        : null;
    };
  }

  onDateInput(event: any, fieldName: string): void {
    const value = event.target.value;
    const matches = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!matches) return;

    const date = new Date(+matches[3], +matches[2] - 1, +matches[1]);
    if (date.getFullYear() === +matches[3] &&
      date.getMonth() === +matches[2] - 1 &&
      date.getDate() === +matches[1]) {
      this.formulario1.get(fieldName)?.setValue(date);
    }
  }

  onPaste(event: ClipboardEvent, campo: string): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const cleanText = pastedText.replace(/[^\d]/g, '');
    let fecha: Date | null = null;

    if (cleanText.length === 8) {
      fecha = new Date(
        +cleanText.substring(4, 8),
        +cleanText.substring(2, 4) - 1,
        +cleanText.substring(0, 2)
      );
    } else if (pastedText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [d, m, y] = pastedText.split('/');
      fecha = new Date(+y, +m - 1, +d);
    }

    if (fecha && !isNaN(fecha.getTime())) {
      this.formulario1.get(campo)?.patchValue(fecha);
      setTimeout(() => this.formulario1.get(campo)?.updateValueAndValidity());
    }
  }

  // ─── Lógica de selects dependientes ─────────────────────────────────────────

  onSelectChangeDepartamento(event: any): void {
    const value = event?.value ?? event;
    if (!value) return;

    this.saux2.ponerurl('provincias');
    this.saux2.getid(value).subscribe(data => {
      this.provincias = data;
      if (this.data.modo === 1) {
        const provNombre = JSON.parse(this.data.valores.lugar_nacimiento)?.provincia;
        const provincia = this.provincias.find(p => Number(p.id) === Number(provNombre));
        this.formulario1.get('provincia')?.setValue(provincia?.id);
        if (provincia) this.onSelectChangeProvincia(provincia);
      }
    });
  }

  onSelectChangeProvincia(event: any): void {
    const value = event?.value ?? (event?.id ?? null);
    if (!value) return;

    this.saux3.ponerurl('distritos');
    this.saux3.getid(value).subscribe(data => {
      this.distritos = data;
      const provNombre = JSON.parse(this.data.valores.lugar_nacimiento)?.distrito;
      const distrito = this.distritos.find(p => Number(p.id) === Number(provNombre));
      this.formulario1.get('distrito')?.setValue(distrito?.id);
    });
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
  }

  // ─── Lógica de validación de cuenta ─────────────────────────────────────────
  actualizarValidacionCuenta(selectedBancoId: any, isEditMode = false): void {
    const cuentaControl = this.formulario2.get('cuenta');
    if (!cuentaControl) return;

    // 1. Identificar si la selección es "No registrado" o "No aplica"
    // Buscamos tanto por el ID/valor directo como por el nombre en el arreglo
    const bancoObj = this.bancosarr.find(b => String(b.id) === String(selectedBancoId));
    const nombreBanco = bancoObj ? bancoObj.nombre : String(selectedBancoId);

    const esSinBanco =
      nombreBanco === 'No registrado' ||
      nombreBanco === 'No aplica' ||
      selectedBancoId === 'no_registrado' ||
      selectedBancoId === 'no_aplica';

    // 2. Aplicar lógica según la selección
    if (esSinBanco) {
      // Quitar validación de requerido y poner el valor por defecto
      cuentaControl.clearValidators();
      cuentaControl.patchValue('000-0000');
    } else {
      // Volver a hacer el campo obligatorio
      cuentaControl.setValidators([Validators.required]);

      // Si estamos en modo 'Añadir' y el campo tenía el valor por defecto, lo limpiamos 
      // para que el usuario pueda escribir la cuenta real del nuevo banco.
      if (!isEditMode && cuentaControl.value === '000-0000') {
        cuentaControl.patchValue('');
      }
    }

    // 3. Actualizar el estado del control
    cuentaControl.updateValueAndValidity();
  }
  // ─── Tabs ───────────────────────────────────────────────────────────────────

  tabActive(event: any): void {
    this.item = event.index;
    this.siguiente(event.index);
    this.selectedIndex = event.index;
  }

  siguiente(num: number): void {
    this.selectedIndex = num;
  }

  // ─── Envío del formulario ───────────────────────────────────────────────────

  // ─── Envío del formulario ───────────────────────────────────────────────────
  // ─── Envío del formulario ───────────────────────────────────────────────────
  onSubmit(): void {
    if (this.formulario1.invalid || this.formulario2.invalid) {
      this.formulario1.markAllAsTouched();
      this.formulario2.markAllAsTouched();
      const camposFaltantes: string[] = [];
      [this.formulario1, this.formulario2].forEach(form => {
        Object.keys(form.controls).forEach(key => {
          if (form.get(key)?.invalid && form.get(key)?.errors?.['required']) {
            camposFaltantes.push(key);
          }
        });
      });

      if (camposFaltantes.length) {
        Swal.fire({
          title: 'Campos obligatorios incompletos',
          html: `<ul style="text-align:left">${camposFaltantes.map(c => `<li>${c}</li>`).join('')}</ul>`,
          icon: 'warning',
        });
      }
      return;
    }

    const lugarNacimiento = {
      departamento: this.formulario1.value.departamento,
      provincia: this.formulario1.value.provincia,
      distrito: this.formulario1.value.distrito,
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
      nacionalidad: this.formulario1.value.nacionalidad,

      banco: this.bancosarr.find(b => b.id === this.formulario2.value.banco)?.nombre || this.formulario2.value.banco,
      cuenta: this.formulario2.value.cuenta,
      afp: this.afpsarr.find(a => a.id === this.formulario2.value.afp)?.nombre || this.formulario2.value.afp,
      cussp: this.formulario2.value.cussp,
      afiliacion: this.formulario2.value.afiliacion,
      fecha_cv: this.formulario1.value.fecha_cv,
      ruc: this.formulario2.value.ruc,
      observaciones: this.formulario2.value.observaciones,

      // ✅ AQUI ESTA EL CAMBIO: Se usa || 0 para enviar cero si está vacío
      idDepartamento: this.formulario1.value.departamento || 0,
      idProvincia: this.formulario1.value.provincia || 0,
      idDistrito: this.formulario1.value.distrito || 0,
      idNacionalidad: this.paisSeleccionado?.id || 0,

      especialidad: this.formulario1.value.especialidad,
    };

    this.cgdepr.ponerurl('docentes');

    if (this.fnc) {
      this.cgdepr.add(body).subscribe(() => {
        Swal.fire({ title: 'Agregado', text: 'Continuar', icon: 'info' });
        this.dialogRef.close(body);
      });
    } else {
      this.cgdepr.update(body.codigo, body).subscribe(() => {
        Swal.fire({ title: 'Actualizado', text: 'Continuar', icon: 'info' });
        this.dialogRef.close(body);
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // ─── Laboral ────────────────────────────────────────────────────────────────

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

  guardar_laboral(): void {
    this.saux2.ponerurl('docenteslaboral');
    if (this.mensajeLaboral === 'guardar') {
      this.saux2.add(this.formularioLaboral?.value).subscribe();
    } else {
      this.saux2.update(
        this.formularioLaboral?.value.codigoDocente,
        this.formularioLaboral?.value
      ).subscribe();
    }
  }

  // ─── Grado ──────────────────────────────────────────────────────────────────

  add_grado(): void { }

  editar(element: any): void {
    console.log('Editar:', element);
  }

  eliminar(element: any): void {
    console.log('Eliminar:', element);
  }

  onPaisChange(event: any): void {
    const paisSeleccionadoStr = event?.value ?? event;
    const nacObj = this.nacionalidades.find(n => n.pais === paisSeleccionadoStr);

    if (nacObj) {
      this.formulario1.get('nacionalidad')?.setValue(nacObj.nombre);
      this.paisSeleccionado = nacObj;  // ✅ Esto es clave para que se guarde el ID
      this.actualizarNacionalidad(paisSeleccionadoStr);
    }
  }

  // ─── Navegación entre Tabs ──────────────────────────────────────────────────
  // Ajusta este número si tu dialog tiene más de 2 pestañas
  readonly totalTabs =3;

  siguienteTab(): void {
    // ✅ Opcional: No permite avanzar si el tab actual tiene campos inválidos
    if (this.selectedIndex === 0 && this.formulario1.invalid) {
      this.formulario1.markAllAsTouched();
      return;
    }

    if (this.selectedIndex < this.totalTabs - 1) {
      this.selectedIndex++;
    }
  }

  anteriorTab(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  // Helper para deshabilitar automáticamente el botón en el último tab
  esUltimoTab(): boolean {
    return this.selectedIndex === this.totalTabs - 1;
  }
}
