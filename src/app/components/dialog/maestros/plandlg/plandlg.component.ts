import { CommonModule } from '@angular/common';
import { Component, computed, inject, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Plan } from '../../../modelos/plan';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
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

@Component({
  selector: 'app-plandlg',
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
  templateUrl: './plandlg.component.html',
  styleUrl: './plandlg.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' }, // Opcional: configura localidad
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    
  ]
})
export class PlandlgComponent {
  formulario?: FormGroup| any= null;
  planes?:Plan[] ;
  funcion:any;
  fnc:boolean=true;
  nivelesacad:any[]=["Pregrado", "Maestria", "Doctorado"]
  constructor(public dialogRef: MatDialogRef<PlandlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private cgdepr:MaestrosserviceService){
      
      
      
  }
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
  poner_datos(){
    console.log(this.data);
    
    this.formulario.setValue({
      id: this.data.valores.id,
      nombre: this.data.valores.nombre,
      nivel_academico: this.data.valores.nivel_academico,
      vigencia: this.data.valores.vigencia,
    });
    //this.form.value.id=this.data.valores.id;
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
        const fechaControl = this.formulario.get('vigencia');
        fechaControl?.patchValue(formattedDate);
        
        // Forzar la actualización del datepicker si es necesario
        setTimeout(() => {
            fechaControl?.updateValueAndValidity();
        });
    }
    
    // Si no es válido, marca error
  //  this.fechaControl.setErrors({ invalidDate: true });
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      nivel_academico: ['', Validators.required],
      vigencia: ['', Validators.required],
    });
    this.cgdepr.ponerurl("plan");
    this.cgdepr.get().subscribe(data=>{
      console.log(data);
      this.planes=data;
    });
    if(this.data.modo==1){
      this.funcion="Editar";
      this.fnc=false;
      this.poner_datos();

    }else{
      this.funcion="Añadir"
      this.fnc=true;
    }

  }
  onSubmit() {
    let body={
      id:this.formulario.value?.id,
      nombre:this.formulario.value.nombre,
      nivel_academico:this.formulario.value.nivel_academico,
      vigencia:this.formulario.value.vigencia
    }
    this.cgdepr.ponerurl("plan")
    if (this.formulario?.valid) {
      if(this.fnc==true){
        this.cgdepr.add(body).subscribe(data=>{
          console.log("agregado");
          Swal.fire({
            title: "Agregado",
            text: "Continuar",
            icon: "info"
          });
          this.dialogRef.close(this.formulario.value);
        })
      }else{
        this.cgdepr.update(body.id,body).subscribe(data=>{
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
