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
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { Aux1Service } from '../../../../services/aux1.service';
import { Aux2Service } from '../../../../services/aux2.service';
import { Aux3Service } from '../../../../services/aux3.service';
import { Column } from '../../../modelos/column';
import { Grado } from '../../../modelos/grado';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastValueFrom } from 'rxjs';
import { ConversiontablaService } from '../../../../services/conversiontabla.service';
import { CargatablaService } from '../../../../services/cargatabla.service';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { Tabla2Component } from "../../../objetos/tabla2/tabla2.component";
import { Saux4Service } from '../../../../services/saux4.service';
import { GradoComponent } from "../../../docente/grado/grado.component";
import { Banco } from '../../../modelos/banco';
import { Afp } from '../../../modelos/afp';
import Swal from 'sweetalert2';
import { Nacionalidad } from '../../../modelos/nacionalidad';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
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

@Component({
  selector: 'app-personaldlg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personaldlg.component.html',
  styleUrl: './personaldlg.component.scss',
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
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    Tabla2Component,
    GradoComponent,
    MatCheckboxModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' }, // Opcional: configura localidad
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },

  ]
})
export class PersonaldlgComponent {

  formulario1?: FormGroup | any = null;
  formulario2?: FormGroup | any = null;
  fechaNacimientoControl?: FormControl;
  fechaFallecimientoControl?: FormControl;

  formularioLaboral?: FormGroup | any = null;
  formularioCategoria?: FormGroup | any = null;
  formularioGrado?: FormGroup | any = null;
  formularioInvestigador?: FormGroup | any = null;

  condiciones?: Condiciones[];
  departamentos?: Departamento[];
  provincias?: Provincia[];
  distritos?: Distrito[];

  bancosarr?: Banco[];
  afpsarr?: Afp[];
  nacionalidades?: Nacionalidad[];

  funcion: any;
  fnc: boolean = true;
  estadosc = ["Soltero(a)", "Conviviente", "Unión de hecho", "Casado(a)", "Divorciado(a)", "Separado(a)", "Viudo(a)", "Otro(a)"];
  bancos = ["BCP", "BBVA", "Scotiabank", "Interbank"];
  afps = ["integra", "Buena vista", "ONP", "otra"];
  sexos = ["Masculino", "Femenino"];

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
  public selectedIndex = 0;

  selectedValue?: string;
  @ViewChild('picker2') picker2?: MatDatepicker<Date>;

  constructor(public dialogRef: MatDialogRef<PersonaldlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service,
    private saux2: Aux2Service,
    private saux3: Aux3Service,
    private saux4: Saux4Service,) {



  }
  validar_dato(dato: any) {
    if (dato == undefined)
      return "";
    return dato;
  }
  poner_datos() {
    console.log(this.data);
    this.selectedValue = JSON.parse(this.data.valores.lugar_nacimiento).departamento;
    this.onSelectChangeDepartamento(this.selectedValue);
    this.formulario1.setValue({
      codigo: this.validar_dato(this.data.valores.codigo),
      digito: this.validar_dato(this.data.valores.digito),
      dni: this.validar_dato(this.data.valores.dni),
      pasaporte: this.validar_dato(this.data.valores.pasaporte),
      nombres: this.validar_dato(this.data.valores.nombres),
      apellidos: this.validar_dato(this.data.valores.apellidos),
      fallecimiento: this.validar_dato(this.data.valores.fallecimiento),
      fecha_fallecimiento: new Date(this.data.valores.fecha_fallecimiento + 'T00:00:00'),
      fecha_nacimiento: new Date(this.data.valores.fecha_nacimiento + 'T00:00:00'),
      departamento: JSON.parse(this.data.valores.lugar_nacimiento).departamento,
      provincia: JSON.parse(this.data.valores.lugar_nacimiento).provincia,
      distrito: JSON.parse(this.data.valores.lugar_nacimiento).distrito,
      sexo: this.data.valores.sexo,
      domicilio: this.validar_dato(this.data.valores.domicilio),
      telefono: this.validar_dato(this.data.valores.telefono),
      celular: this.validar_dato(this.data.valores.celular),
      estado_civil: this.validar_dato(this.data.valores.estado_civil),
      numero_hijos: this.validar_dato(this.data.valores.numero_hijos),
      nacionalidad: this.validar_dato(this.data.valores.nacionalidad.nombre),
      pais: this.validar_dato(this.data.valores.nacionalidad.pais),
      fecha_cv: new Date(this.data.valores.fecha_cv + 'T00:00:00'),
      especialidad: this.validar_dato(this.data.valores.especialidad),
      edad: this.obtener_edad(new Date(this.data.valores.fecha_nacimiento + 'T00:00:00')),
    });

    this.formulario2 = this.formBuilder.group({
      banco: this.data.valores.banco,
      cuenta: this.data.valores.cuenta,
      afp: this.data.valores.afp,
      cussp: this.data.valores.cussp,
      afiliacion: this.data.valores.afiliacion,
      ruc: this.data.valores.ruc,
      observaciones: this.data.valores.observaciones
    });
    //this.form.value.id=this.data.valores.id;

    // Aplicar validación según el banco seleccionado
    // Aplica validación sin resetear el valor (porque estamos en edición)
    this.actualizarValidacionCuenta(this.data.valores.banco, true);
  }
  obtener_edad(fechaNacimiento: any) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }
  // Agrega esta función en tu componente o en un archivo de utilidades
  dateFormatValidator(format: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // No validar si está vacío (usar Validators.required si es obligatorio)
      }

      // Verificar si ya es un objeto Date (cuando se selecciona del datepicker)
      if (control.value instanceof Date) {
        return null;
      }

      // Validar el formato manual ingresado
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const matches = control.value.match(datePattern);

      if (!matches) {
        return { invalidFormat: true };
      }

      const day = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1; // Los meses en JS son 0-11
      const year = parseInt(matches[3], 10);

      // Validar que la fecha sea válida
      const date = new Date(year, month, day);
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
      ) {
        return { invalidDate: true };
      }

      return null;
    };
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
        this.formulario1.get(fieldName)?.setValue(date);
      }
    }
  }
  ngOnInit(): void {

    this.fechaNacimientoControl = new FormControl('',
      [
        Validators.required,
        this.dateFormatValidator('DD/MM/YYYY'),
      ]);


    this.fechaFallecimientoControl = new FormControl(
      { value: '', disabled: true },
      [this.dateFormatValidator('DD/MM/YYYY')]
    );
    this.formulario1 = this.formBuilder.group({
      codigo: ['', Validators.required],
      digito: ['', Validators.required],
      dni: ['', Validators.required],
      pasaporte: [''],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fallecimiento: [''],
      fecha_fallecimiento: this.fechaFallecimientoControl,
      fecha_nacimiento: this.fechaNacimientoControl,
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      sexo: ['', Validators.required],
      domicilio: ['', Validators.required],
      telefono: [''],
      celular: [''],
      estado_civil: ['', Validators.required],
      numero_hijos: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      pais: ['', Validators.required],
      fecha_cv: ['', Validators.required],
      especialidad: ['', Validators.required],
      edad: ['']
    });

    this.formulario2 = this.formBuilder.group({
      banco: ['', Validators.required],
      cuenta: ['', Validators.required],
      afp: ['', Validators.required],
      cussp: ['', Validators.required],
      afiliacion: ['', Validators.required],
      ruc: [''],
      observaciones: ['']
    });

    this.saux1.ponerurl("departamentos");
    this.saux1.get().subscribe(data => {
      this.departamentos = data;
    })

    this.saux2.ponerurl("bancos");
    this.saux2.get().subscribe(data => {
      this.bancosarr = data;
    })

    this.saux3.ponerurl("afps");
    this.saux3.get().subscribe(data => {
      this.afpsarr = data;
    })

    this.saux4.ponerurl("nacionalidad");
    this.saux4.get().subscribe(data => {
      this.nacionalidades = data;
    })


    this.cgdepr.ponerurl("docentes");
    this.cgdepr.get().subscribe(data => {
      console.log(data);
      this.condiciones = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.fnc = true;
    }
    this.formulario2.get('banco')?.valueChanges.subscribe((selectedBanco: any) => {
      this.actualizarValidacionCuenta(selectedBanco, this.data.modo === 1);
    });

    this.formulario1.get('pais')?.valueChanges.subscribe((selectedPais: any) => {
      this.actualizarNacionalidad(selectedPais, this.data.modo === 1);
    });

    this.formulario1.get('fallecimiento')?.valueChanges.subscribe((checked: boolean) => {
      const checkControl = this.formulario1.get('fecha_fallecimiento');
      if (checked) {
        checkControl.enable(); // Habilitar si está marcado
      } else {
        checkControl.disable(); // Deshabilitar si se desmarca
        checkControl.reset();   // (Opcional) limpiar el campo
      }
    });


  }

  onPaste(event: ClipboardEvent, campo: string) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';

    // Limpiar el texto pegado (eliminar espacios, caracteres no numéricos)
    const cleanText = pastedText.replace(/[^\d]/g, '');

    let fecha: Date | null = null;

    // Caso 1: DDMMYYYY (8 dígitos)
    if (cleanText.length === 8) {
      const day = parseInt(cleanText.substring(0, 2), 10);
      const month = parseInt(cleanText.substring(2, 4), 10) - 1; // mesIndex: 0-11
      const year = parseInt(cleanText.substring(4, 8), 10);
      fecha = new Date(year, month, day);
    }
    // Caso 2: DD/MM/YYYY
    else if (pastedText.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dayStr, monthStr, yearStr] = pastedText.split('/');
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);
      fecha = new Date(year, month, day);
    }

    console.log(fecha); // Para verificar en consola

    if (fecha) {
      const fechaControl = this.formulario1.get(campo);
      fechaControl?.patchValue(fecha);

      // Forzar la actualización del datepicker si es necesario
      setTimeout(() => {
        fechaControl?.updateValueAndValidity();
      });
    }
  }

  nacionalidadSeleccionada = [];
  naciona(datos: any) {
    //console.log(datos);
    this.nacionalidadSeleccionada = datos;
    return datos.pais;


  }
  paisSeleccionado: any = "";
  actualizarNacionalidad(selectedPais: any, isEditMode: boolean = false) {
    const departamentoControl = this.formulario1.get('departamento');
    const provinciaControl = this.formulario1.get('provincia');
    const distritoControl = this.formulario1.get('distrito');
    const nombres = this.nacionalidades?.map(n => {
      if (selectedPais == n.pais) {
        return n;
      }
      return "";
    });

    if (selectedPais !== 'Perú') {
      departamentoControl?.clearValidators();
      provinciaControl?.clearValidators();
      distritoControl?.clearValidators();

      departamentoControl?.patchValue('');
      provinciaControl?.patchValue('');
      distritoControl?.patchValue('');
      // Deshabilitar los controles
      departamentoControl?.disable();
      provinciaControl?.disable();
      distritoControl?.disable();
    } else {
      // Deshabilitar los controles
      departamentoControl?.enable();
      provinciaControl?.enable();
      distritoControl?.enable();
    }
    //console.log(nombres);
    const valor: any = nombres?.find(item => item && typeof item === 'object');
    console.log(valor);
    this.paisSeleccionado = valor;
    /*const pais = nombres?.find(p => p.trim() !== "");
    console.log(pais);*/
    this.formulario1.get('nacionalidad')?.patchValue(valor.nombre);
    departamentoControl?.updateValueAndValidity();
    provinciaControl?.updateValueAndValidity();
    distritoControl?.updateValueAndValidity();

  }
  // Agrega este método a la clase:
  actualizarValidacionCuenta(selectedBanco: string, isEditMode: boolean = false) {
    const cuentaControl = this.formulario2.get('cuenta');
    console.log("seleccionado");
    if (selectedBanco === 'No registrado') {
      cuentaControl?.clearValidators();
      console.log("seleccionado");

      // if (cuentaControl?.value === '') {  // Solo asigna '0000000000' si estaba vacío
      cuentaControl?.patchValue('0000000000');
      // }
    } else {
      //  cuentaControl?.patchValue('');
      cuentaControl?.setValidators([Validators.required]);
      // No forzamos setValue('') para no perder datos al editar
    }
    cuentaControl?.updateValueAndValidity();
  }
  anterior(num: any) {

  }

  item = 0;

  tabActive(event: any) {
    // obtenemos el index del tab
    console.log(event.index);
    // if(this.item>event.index){
    //this.siguiente()
    this.item = event.index;
    /*}else{
      
    }*/
    this.siguiente(event.index)
    // actualizamos el index seleccionado
    this.selectedIndex = event.index;
    /*if(this.selectedIndex==3){
      this.cargartabla();   
      this.sctablag.setData(this.tablaGrado);
    }*/
  }
  onSubmit() {
    /*					
            	
            lugar_nacimiento		
                	
     */
    const data = {
      departamento: this.formulario1.value.departamento,
      provincia: this.formulario1.value.provincia,
      distrito: this.formulario1.value.distrito
    };

    let body = {

      codigo: this.formulario1.value.codigo,
      digito: this.formulario1.value.digito,
      dni: this.formulario1.value.dni,
      pasaporte: this.formulario1.value.pasaporte,
      nombres: this.formulario1.value.nombres,
      apellidos: this.formulario1.value.apellidos,
      fecha_nacimiento: this.formulario1.value.fecha_nacimiento,
      lugar_nacimiento: JSON.stringify(data),
      fallecimiento: this.formulario1.value.fallecimiento,
      fecha_fallecimiento: this.formulario1.value.fecha_fallecimiento,
      sexo: this.formulario1.value.sexo,
      domicilio: this.formulario1.value.domicilio,
      telefono: this.formulario1.value.telefono,
      celular: this.formulario1.value.celular,
      estado_civil: this.formulario1.value.estado_civil,
      numero_hijos: this.formulario1.value.numero_hijos,
      //nacionalidad: this.formulario1.value.nacionalidad,
      pais: this.formulario1.value.pais,
      banco: this.formulario2.value.banco,
      cuenta: this.formulario2.value.cuenta,
      afp: this.formulario2.value.afp,
      cussp: this.formulario2.value.cussp,
      afiliacion: this.formulario2.value.afiliacion,
      fecha_cv: this.formulario1.value.fecha_cv,
      ruc: this.formulario2.value.ruc,
      observaciones: this.formulario2.value.observaciones,
      idDepartamento: this.formulario1.value.departamento,
      idProvincia: this.formulario1.value.provincia,
      idDistrito: this.formulario1.value.distrito,
      idNacionalidad: this.paisSeleccionado.id,
      especialidad: this.formulario1.value.especialidad,
    }
    this.cgdepr.ponerurl("docentes")
    if (this.formulario2?.valid && this.formulario1?.valid) {
      if (this.fnc == true) {
        // body.codigo = `D${body.dni}`;
        //  body.digito = body.codigo.length;
        this.cgdepr.add(body).subscribe(data => {
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(body);
        })
      } else {
        this.cgdepr.update(body.codigo, body).subscribe(data => {
          console.log("actualizado");
          Swal.fire({
            title: "Actualizado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(body);
        })
      }

      this.dialogRef.close(body);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario1?.markAllAsTouched();
      this.formulario2?.markAllAsTouched();
      const camposFaltantes: string[] = [];

      const formularios = [
        { grupo: this.formulario1, nombre: 'Formulario 1' },
        { grupo: this.formulario2, nombre: 'Formulario 2' }
      ];

      formularios.forEach(form => {
        Object.keys(form.grupo.controls).forEach(campo => {
          const control = form.grupo.get(campo);
          if (control?.invalid && control?.errors?.['required']) {
            camposFaltantes.push(campo);
          }
        });
      });

      if (camposFaltantes.length > 0) {
        console.warn("Campos obligatorios faltantes:", camposFaltantes);
        Swal.fire({
          title: "Campos obligatorios incompletos",
          html: `<ul style="text-align: left">${camposFaltantes.map(c => `<li>${c}</li>`).join('')}</ul>`,
          icon: "warning"
        });
      }


    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSelectChangeDepartamento(event: any) {
    //console.log(this.selectedValue);
    //console.log(event.value);
    this.saux2.ponerurl("provincias");
    if (this.data.modo == 1) {
      this.saux2.getid(event).subscribe(data => {
        console.log(data);
        this.provincias = data;
        const provincia = this.provincias.find(p => p.nombre === this.data.valores.lugarNacimiento.provincia);
        this.onSelectChangeProvincia(provincia);
      });
    } else {
      this.saux2.getid(event.value).subscribe(data => {
        console.log(data);
        this.provincias = data;
      });
    }

  }
  onSelectChangeProvincia(event: any) {
    this.saux3.ponerurl("distritos");
    console.log(event);

    if (this.data.modo == 1 && !event.value) {

      //const nombresDistritos = event.Distritos.map((distrito:any) => distrito.nombre);
      this.distritos = event.Distritos;
      /*this.saux3.getid(event[0].Distritos[0].provincia_id).subscribe(data => {
        this.distritos = data;
      });*/
    } else {
      this.saux3.getid(event.value).subscribe(data => {
        this.distritos = data;
      });
    }
  }

  siguiente(num: any) {
    this.selectedIndex = num;

    //this.formulario1?.markAllAsTouched();
  }
  poner_laboral(data: any) {

    this.formularioLaboral.setValue({
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
  guardar_laboral() {
    this.saux2.ponerurl("docenteslaboral");
    console.log(this.formularioLaboral.value);
    console.log(this.formularioLaboral.value.codigoDocente);
    // console.log(this.data);
    if (this.mensajeLaboral == "guardar") {
      this.saux2.add(this.formularioLaboral.value).subscribe(data => {
        console.log(data);

      })
    } else {
      this.saux2.update(this.formularioLaboral.value.codigoDocente, this.formularioLaboral.value).subscribe(data => {
        console.log(data);

      })
    }
    /* this.saux2.getid(this.formularioLaboral.value.codigoDocente).subscribe(data=>{
       console.log(data);
       if(data.length==0){
         this.mensajeLaboral="guardar";
       }else{
         this.mensajeLaboral="Actualizar";
       }
     })*/
    /*this.saux2.add(this.formularioLaboral.value).subscribe(data=>{
      console.log(data);
      
    })*/
  }
  //grado	revalidado	lugar_obtencion	fecha_obtencion	codigoDocente	
  tablaDepartamento: Grado[] = [];
  columnsg: Column[] = [
    { columnDef: 'grado', header: 'Grado', cell: (element: Grado) => `${element.grado}` },
    { columnDef: 'revalidado', header: 'Revalidado', cell: (element: Grado) => `${element.revalidado}` },
    { columnDef: 'lugar_obtencion', header: 'Lugar obtencion', cell: (element: Grado) => `${element.lugar_obtencion}` },
    { columnDef: 'fecha_obtencion', header: 'Fecha obtencion', cell: (element: Grado) => `${element.fecha_obtencion}` },
    { columnDef: 'actions', header: 'Acciones', cell: () => '', isAction: true }  // Columna de acciones
  ];
  tablaGrado: Grado[] = [];
  dataSourceg = new MatTableDataSource<any>([]);

  add_grado() {
    /* this.saux4.ponerurl("docentesgrado");
     this.saux4.add(this.formularioGrado.value).subscribe(data=>{
       console.log(data);
       
     });
     this.cargartabla();*/
  }/*
  async cargartabla(){
    this.saux4.ponerurl("docentesgrado");
    const source2$ = this.saux4.get();
    const finalNumber2:any = await lastValueFrom(source2$);
  
    this.cartablag.ponerdata(finalNumber2);
    this.tablaGrado=this.cartablag.array;
    console.log(this.tablaGrado);
    
    this.sctablag.setData(this.tablaGrado);
  }*/
  editar(element: any) {
    console.log(element);

    /* const dialogRef = this.dialog.open(ProvdlgComponent, {
       width: '250px',
       height:'450px',
       data: {
         title: `Editar ${this.titulo}`,
         valores:{ 
           id: this.cartabla.dataSeleccionada.id,
           nombre:this.cartabla.dataSeleccionada.nombre,
           valor:this.cartabla.dataSeleccionada.valor,
           departamento_id:this.cartabla.dataSeleccionada.departamento_id,
         },
         modo:1     
       }
     });
     dialogRef.afterClosed().subscribe(result => {
      // if (result) {
         this.cargartabla();
     //  }
     });*/

  }
  eliminar(element: any) {
    console.log("dep", element);
    /* this.mservice.delete(element.id).subscribe(data=>{
       console.log("Eliminado");
       this.cargartabla();
     })*/
  }
}
