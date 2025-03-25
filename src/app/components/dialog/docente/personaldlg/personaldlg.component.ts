import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Condiciones } from '../../../modelos/condiciones';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
    GradoComponent
  ]
})
export class PersonaldlgComponent {

  formulario1?: FormGroup | any = null;
  formulario2?: FormGroup | any = null;

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
  nacionalidades?:Nacionalidad[];

  funcion: any;
  fnc: boolean = true;
  estadosc = ["Soltero(a)","Conviviente", "Unión de hecho", "Casado(a)", "Divorciado(a)", "Separado(a)","Viudo(a)", "Otro(a)"];
  bancos = ["BCP", "BBVA", "Scotiabank", "Interbank"];
  afps = ["integra", "Buena vista", "ONP", "otra"];
  sexos = ["Masculino", "Femenino"];
  
  public selectedIndex = 0;

  selectedValue?: string;

  constructor(public dialogRef: MatDialogRef<PersonaldlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr: MaestrosserviceService,
    private saux1: Aux1Service,
    private saux2: Aux2Service,
    private saux3: Aux3Service,
    private saux4: Saux4Service,) {



  }
  poner_datos() {
    console.log(this.data);
    this.selectedValue = JSON.parse(this.data.valores.lugar_nacimiento).departamento;
    this.onSelectChangeDepartamento(this.selectedValue);
    this.formulario1.setValue({
      codigo: this.data.valores.codigo,
      digito: this.data.valores.digito,
      dni: this.data.valores.dni,
      pasaporte: this.data.valores.pasaporte,
      nombres: this.data.valores.nombres,
      apellidos: this.data.valores.apellidos,
      fecha_nacimiento: this.data.valores.fecha_nacimiento,
      departamento: JSON.parse(this.data.valores.lugar_nacimiento).departamento,
      provincia: JSON.parse(this.data.valores.lugar_nacimiento).provincia,
      distrito: JSON.parse(this.data.valores.lugar_nacimiento).distrito,
      sexo: this.data.valores.sexo,
      domicilio: this.data.valores.domicilio,
      telefono: this.data.valores.telefono,
      celular: this.data.valores.celular,
      estado_civil: this.data.valores.estado_civil,
      numero_hijos: this.data.valores.numero_hijos,
      nacionalidad: this.data.valores.nacionalidad,
      fecha_cv: this.data.valores.fecha_cv,
      especialidad:this.data.valores.especialidad,
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
  }

  ngOnInit(): void {
    this.formulario1 = this.formBuilder.group({
      codigo: ['', Validators.required],
      digito: ['', Validators.required],
      dni: ['', Validators.required],
      pasaporte: [''],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
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
      fecha_cv: ['', Validators.required],
      especialidad:['', Validators.required],
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
      sexo: this.formulario1.value.sexo,
      domicilio: this.formulario1.value.domicilio,
      telefono: this.formulario1.value.telefono,
      celular: this.formulario1.value.celular,
      estado_civil: this.formulario1.value.estado_civil,
      numero_hijos: this.formulario1.value.numero_hijos,
      nacionalidad: this.formulario1.value.nacionalidad,
      banco: this.formulario2.value.banco,
      cuenta: this.formulario2.value.cuenta,
      afp: this.formulario2.value.afp,
      cussp: this.formulario2.value.cussp,
      afiliacion: this.formulario2.value.afiliacion,
      fecha_cv: this.formulario1.value.fecha_cv,
      ruc: this.formulario2.value.ruc,
      observaciones: this.formulario2.value.observaciones,
      idDepartamento:this.formulario1.value.departamento,
      idProvincia:this.formulario1.value.provincia,
      idDistrito:this.formulario1.value.distrito,
      especialidad:this.formulario1.value.especialidad,
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
        this.onSelectChangeProvincia(data);
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
      this.saux3.getid(event[0].Distritos[0].provincia_id).subscribe(data => {
        this.distritos = data;
      });
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
