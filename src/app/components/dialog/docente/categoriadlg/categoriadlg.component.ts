import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Categoria } from '../../../modelos/categoria';
import {MatRadioModule} from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Condiciones } from '../../../modelos/condiciones';
import { Aux1Service } from '../../../../services/aux1.service';


@Component({
  selector: 'app-categoriadlg',
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
  templateUrl: './categoriadlg.component.html',
  styleUrl: './categoriadlg.component.scss'
})
export class CategoriadlgComponent {
  formularioCategoria?: FormGroup| any= null;
  departamentos?:Categoria[] ;
  condiciones?: Condiciones[];
  funcion:any;
  fnc:boolean=true;
  categorias = ["Principal", "Asociado","Auxiliar","Contratado","Profesor visitante","Instructor","Jefe de prácticas"];
  tipos = ["Nuevo", "Reincorporado","Regular","Otro departamento"];
  dedicacion = ["TC", "TPA","TPC"];
  lab = ["Si", "No"];
  categoriasdap = ["Ordinario", "Contratado", "Extraordinario","Honoris Causa","Honorarios"];
  condicionesdap = ["Activo", "Inactivo"];
  extraordinarios: string[] = ['Emérito', 'Tenure Track', 'Visitante'];
  inactivos: string[] = ['Jubildado', 'Fallecido', 'Renuncia'];
  ratificado: string[] = ['Ratificado', 'No ratificado'];
  tipoRatificado: string[] = ['Desempeño Academico', 'Investigación','Desempeño administrativo','Capacitación continua'];
  bloqueadorg1=true;
  bloqueadorg2=true;
  
  constructor(public dialogRef: MatDialogRef<CategoriadlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService,
    private saux1:Aux1Service){
      
      //this.selectedCategory2=true;
      
  }
  poner_datos(){
    console.log(this.data);
    let g1="";
    let d1="";
    let g2="";
    let d2="";
    let arr1=this.data.valores.categoriadap.split('-');
    let arr2=this.data.valores.condiciondap.split('-');
    if(arr1.length>1){
      d1=arr1[0];
      g1=arr1[1];
     
    }else{
      d1=this.data.valores.categoriadap;
      g1="";
    }

    if(arr2.length>1){
      d2=arr2[0];
      g2=arr2[1];
     
    }else{
      d2=this.data.valores.condiciondap;
      g2="";
    }
    let ratificado=JSON.parse(this.data.valores.ratificado);
    this.formularioCategoria.setValue({
      id:this.data.valores.id,
      tipo: this.data.valores.tipo,
      fecha: this.data.valores.fecha,
      categoria: this.data.valores.categoria,
      condiciondap:  d2,
      codigoDocente:  this.data.valores.codigoDocente,
      dedicacion:  this.data.valores.dedicacion,
      labor:  this.data.valores.labor,
      categoriadap:  d1,
      rg1:g1,
      rg2:g2,
      ratificado:ratificado.ratificado,
      chk1: ratificado.chk1,
      chk2: ratificado.chk2,
      chk3: ratificado.chk3,
      chk4: ratificado.chk4,
    });
    let event={value:ratificado.ratificado}
    this.onCategoryChangeRatificado(event);
    //this.form.value.id=this.data.valores.id;
    
  }

  get selectedOptions() {
    return Object.keys(this.formularioCategoria.get('ratificadobx')?.value || {}).filter(key => this.formularioCategoria.get('ratificadobx')?.value[key]);
  }

  ngOnInit(): void {
    console.log(this.data);
    this.formularioCategoria = this.formBuilder.group({
      id:[''],
      tipo: [''],
      fecha: [''],
      categoria: [''],
      condiciondap:  [''],
      codigoDocente:  [''],
      dedicacion:  [''],
      labor: [''],
      categoriadap:  [''],
      rg1:[''],
      rg2:[''],
      ratificado:[''],
      chk1:[''],
      chk2:[''],
      chk3:[''],
      chk4:[''],
      
    });

    /*this.saux1.ponerurl("categoria");
    this.saux1.get().subscribe(data => {
      this.condiciones = data;
    })*/

    this.cgdepr.ponerurl("docentescategoria");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.departamentos=data;
    });
    if(this.data.modo==1){
      this.funcion="Editar";
      this.fnc=false;
      this.poner_datos();

    }else{
      this.funcion="Añadir"
      this.poner_codigo();
      this.fnc=true;
    }

    if(this.data.valores.categoriadap=="Extraordinario"){
      this.formularioCategoria.get('rg1')?.enable();
      this.selectedCategory="Extraordinario";
    }else{
      this.selectedCategory=this.data.valores.categoriadap;
      this.formularioCategoria.get('rg1')?.disable();

    }

    if(this.data.valores.condiciondap=="Inactivo"){
      this.formularioCategoria.get('rg2')?.enable();
      this.selectedCategory2="Inactivo";
    }else{
      this.formularioCategoria.get('rg2')?.disable();
      this.selectedCategory2=this.data.valores.condiciondap;
    }

  }
  poner_codigo(){
    this.formularioCategoria.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
  }
  add_grado() {   
    console.log(this.formularioCategoria.value);
    let ratificado= {ratificado:this.formularioCategoria.value?.ratificado, 
      chk1:this.formularioCategoria.value?.chk1==undefined ||this.formularioCategoria.value?.chk1==""?false:this.formularioCategoria.value?.chk1,
      chk2:this.formularioCategoria.value?.chk2==undefined||this.formularioCategoria.value?.chk2==""?false:this.formularioCategoria.value?.chk2,
      chk3:this.formularioCategoria.value?.chk3==undefined||this.formularioCategoria.value?.chk3==""?false:this.formularioCategoria.value?.chk3,
      chk4:this.formularioCategoria.value?.chk4==undefined||this.formularioCategoria.value?.chk4==""?false:this.formularioCategoria.value?.chk4,
    }
    let ratificadoString = JSON.stringify(ratificado);

    let body={
      id:this.formularioCategoria.value?.id,
      tipo: this.formularioCategoria.value?.tipo,
      fecha: this.formularioCategoria.value?.fecha,
      categoria: this.formularioCategoria.value?.categoria,
      condiciondap:  this.formularioCategoria.value?.condiciondap,
      codigoDocente:  this.formularioCategoria.value?.codigoDocente,
      dedicacion:  this.formularioCategoria.value?.dedicacion,
      labor:  this.formularioCategoria.value?.labor,
      categoriadap:  this.formularioCategoria.value?.categoriadap,
      ratificado: ratificadoString,
    }
    console.log(body);
    if(body.categoriadap=='Extraordinario'){
      body.categoriadap=`Extraordinario-${this.formularioCategoria.value?.rg1}`
    }
    if(body.condiciondap=='Inactivo'){
      body.condiciondap=`Inactivo-${this.formularioCategoria.value?.rg2}`
    }
    console.log(body);
    
    this.cgdepr.ponerurl("docentescategoria")
    if (this.formularioCategoria?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
        })
      }else{
        this.cgdepr.update(body.codigoDocente,body).subscribe(data=>{
          console.log("actualizado");
        })
      }

      this.dialogRef.close(this.formularioCategoria.value);
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formularioCategoria?.markAllAsTouched();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  selectedCategory = '';
  selectedCategory2 = '';
  onCategoryChange(event: any) {
    this.selectedCategory = event.value;   
    if(this.selectedCategory=="Extraordinario"){
      this.formularioCategoria.get('rg1')?.enable();
      this.selectedCategory="Extraordinario";
    }else{
      this.selectedCategory=this.data.valores.categoriadap;
      this.formularioCategoria.get('rg1')?.disable();

    }
    
  }
  onCategoryChange2(event: any) {
    this.selectedCategory2 = event.value;   
    console.log(this.selectedCategory2);
    
    if(this.selectedCategory2=="Inactivo"){
      this.formularioCategoria.get('rg2')?.enable();
      this.selectedCategory2="Inactivo";
    }else{
      this.formularioCategoria.get('rg2')?.disable();
      this.selectedCategory2=this.data.valores.condiciondap;
    }
    
  }
  selectedCategory3:any;
  onCategoryChangeRatificado(event: any){
    this.selectedCategory3 = event.value;  
    if(this.selectedCategory3=="Ratificado"){
      this.formularioCategoria.get('chk1')?.enable();
      this.formularioCategoria.get('chk2')?.enable();
      this.formularioCategoria.get('chk3')?.enable();
      this.formularioCategoria.get('chk4')?.enable();
      //this.selectedCategory3="Inactivo";
    }else{
      this.formularioCategoria.get('chk1')?.disable();
      this.formularioCategoria.get('chk2')?.disable();
      this.formularioCategoria.get('chk3')?.disable();
      this.formularioCategoria.get('chk4')?.disable();

    }

  }

}
