import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaestrosserviceService } from '../../../../services/maestrosservice.service';
import { Aux1Service } from '../../../../services/aux1.service';
import Swal from 'sweetalert2';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith, of } from 'rxjs';

@Component({
  selector: 'app-cursosdlg',
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
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatAutocompleteModule
  ],
  templateUrl: './cursosdlg.component.html',
  styleUrl: './cursosdlg.component.scss'
})
export class CursosdlgComponent {
  formularioGrado?: FormGroup | any = null;
  funcion: any;
  fnc: boolean = true;
  
  // Datos para selects
  planes: any[] = [];
  areas: any[] = [];
  
  // Datos para autocomplete
  facultades: any[] = [];
  escuelas: any[] = [];
  programas: any[] = [];
  
  // Observables para filtrado
  facultadesFiltradas!: Observable<any[]>;
  escuelasFiltradas!: Observable<any[]>;
  programasFiltrados!: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<CursosdlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private service: MaestrosserviceService,
    private auxService: Aux1Service
  ) { }

  ngOnInit(): void {
  console.log("Datos recibidos:", this.data);
  
  // Inicializar formulario
  this.formularioGrado = this.formBuilder.group({
    id: [''],
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    semestre: ['', Validators.required],
    nivel: ['', Validators.required],
    creditos: ['', Validators.required],
    plan: ['', Validators.required],
    areas: ['', Validators.required],
    facultad: ['', Validators.required],
    facultadId: [''],
    escuela: ['', Validators.required],
    escuelaId: [''],
    programa: ['', Validators.required],
    programaId: ['']
  });

  // Cargar planes
  this.auxService.ponerurl("plan");
  this.auxService.get().subscribe(data => {
    console.log("Planes cargados: ", data);
    this.planes = data;
  });

  // Cargar áreas
  this.auxService.ponerurl("area");
  this.auxService.get().subscribe(data => {
    console.log("Áreas cargadas: ", data);
    this.areas = data;
  });

  // Cargar FACULTADES
  this.auxService.ponerurl("facultad");
  this.auxService.get().subscribe(data => {
    console.log("Facultades cargadas: ", data);
    this.facultades = data;
    this.facultadesFiltradas = of(this.facultades);
    
    // Si es modo edición, cargar datos DESPUÉS de que carguen las facultades
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
  });
}
  
  // Cuando el usuario escribe en facultad
  onFacultadInput(event: any) {
    const value = event.target.value;
    this.facultadesFiltradas = of(this._filterFacultades(value));
  }
  
  // Cuando el usuario hace foco en facultad - muestra TODAS las facultades
  onFacultadFocus() {
    this.facultadesFiltradas = of(this.facultades.slice());
  }
  
  // Cuando el usuario escribe en escuela
  onEscuelaInput(event: any) {
    const value = event.target.value;
    this.escuelasFiltradas = of(this._filterEscuelas(value));
  }
  
  // Cuando el usuario hace foco en escuela
  onEscuelaFocus() {
    this.escuelasFiltradas = of(this.escuelas.slice());
  }
  
  // Cuando el usuario escribe en programa
  onProgramaInput(event: any) {
    const value = event.target.value;
    this.programasFiltrados = of(this._filterProgramas(value));
  }
  
  // Cuando el usuario hace foco en programa
  onProgramaFocus() {
    this.programasFiltrados = of(this.programas.slice());
  }
  
  private _filterFacultades(value: string): any[] {
    if (!this.facultades || this.facultades.length === 0) return [];
    const filterValue = value.toLowerCase();
    return this.facultades.filter(f => f.nombre.toLowerCase().includes(filterValue));
  }
  
  private _filterEscuelas(value: string): any[] {
    if (!this.escuelas || this.escuelas.length === 0) return [];
    const filterValue = value.toLowerCase();
    return this.escuelas.filter(e => e.nombre.toLowerCase().includes(filterValue));
  }
  
  private _filterProgramas(value: string): any[] {
    if (!this.programas || this.programas.length === 0) return [];
    const filterValue = value.toLowerCase();
    return this.programas.filter(p => (p.programa || p.nombre).toLowerCase().includes(filterValue));
  }
  
  onFacultadSeleccionado(event: any): void {
    const facultad = event.option.value;
    console.log("Facultad seleccionada:", facultad);
    
    this.formularioGrado.patchValue({
      facultad: facultad,
      facultadId: facultad.id
    });
    
    // Limpiar escuela y programa
    this.formularioGrado.patchValue({ escuela: '', escuelaId: '', programa: '', programaId: '' });
    this.escuelas = [];
    this.programas = [];
    this.escuelasFiltradas = of([]);
    this.programasFiltrados = of([]);
    
    // Cargar escuelas de esta facultad - Ruta CORRECTA: /escuela?facultadId=xxx
    if (facultad && facultad.id) {
      this.auxService.ponerurl(`escuela?facultadId=${facultad.id}`);
      this.auxService.get().subscribe(escuelas => {
        console.log("Escuelas cargadas:", escuelas);
        this.escuelas = escuelas;
        this.escuelasFiltradas = of(this.escuelas);
      });
    }
  }
  
  onEscuelaSeleccionado(event: any): void {
    const escuela = event.option.value;
    console.log("Escuela seleccionada:", escuela);
    
    this.formularioGrado.patchValue({
      escuela: escuela,
      escuelaId: escuela.id
    });
    
    // Limpiar programa
    this.formularioGrado.patchValue({ programa: '', programaId: '' });
    this.programas = [];
    this.programasFiltrados = of([]);
    
    // Cargar programas de esta escuela - Ruta CORRECTA: /programa?escuelaId=xxx
    if (escuela && escuela.id) {
      this.auxService.ponerurl(`programa?escuelaId=${escuela.id}`);
      this.auxService.get().subscribe(programas => {
        console.log("Programas cargados:", programas);
        this.programas = programas;
        this.programasFiltrados = of(this.programas);
      });
    }
  }
  
  displayFn(item: any): string {
    return item && item.nombre ? item.nombre : '';
  }
  
  displayProgFn(item: any): string {
    return item && (item.programa || item.nombre) ? (item.programa || item.nombre) : '';
  }
  
  poner_datos() {
    if (this.data.valores) {
      console.log("Datos a cargar en edición:", this.data.valores);
      
      let facultadEncontrada = null;
      let escuelaEncontrada = null;
      let programaEncontrado = null;
      
      // Buscar facultad
      if (this.data.valores.facultadId && this.facultades.length > 0) {
        facultadEncontrada = this.facultades.find(f => f.id === this.data.valores.facultadId);
      }
      
      this.formularioGrado.patchValue({
        id: this.data.valores.id || '',
        codigo: this.data.valores.codigo || '',
        nombre: this.data.valores.nombre || '',
        semestre: this.data.valores.semestre || '',
        nivel: this.data.valores.nivel || '',
        creditos: this.data.valores.creditos || '',
        plan: this.data.valores.plan || '',
        areas: this.data.valores.areas || '',
        facultadId: this.data.valores.facultadId || '',
        escuelaId: this.data.valores.escuelaId || '',
        programaId: this.data.valores.programaId || ''
      });
      
      // Cargar datos anidados si existen
      if (facultadEncontrada) {
        this.formularioGrado.patchValue({ facultad: facultadEncontrada });
        this.cargarEscuelasPorFacultad(facultadEncontrada.id, this.data.valores.escuelaId);
      }
    }
  }
  
  cargarEscuelasPorFacultad(facultadId: number, escuelaIdSeleccionada?: number): void {
    this.auxService.ponerurl(`escuela?facultadId=${facultadId}`);
    this.auxService.get().subscribe(escuelas => {
      this.escuelas = escuelas;
      this.escuelasFiltradas = of(this.escuelas);
      
      if (escuelaIdSeleccionada) {
        const escuelaEncontrada = this.escuelas.find(e => e.id === escuelaIdSeleccionada);
        if (escuelaEncontrada) {
          this.formularioGrado.patchValue({ 
            escuela: escuelaEncontrada,
            escuelaId: escuelaEncontrada.id
          });
          this.cargarProgramasPorEscuela(escuelaEncontrada.id, this.data.valores?.programaId);
        }
      }
    });
  }
  
  cargarProgramasPorEscuela(escuelaId: number, programaIdSeleccionado?: number): void {
    this.auxService.ponerurl(`programa?escuelaId=${escuelaId}`);
    this.auxService.get().subscribe(programas => {
      this.programas = programas;
      this.programasFiltrados = of(this.programas);
      
      if (programaIdSeleccionado) {
        const programaEncontrado = this.programas.find(p => p.id === programaIdSeleccionado);
        if (programaEncontrado) {
          this.formularioGrado.patchValue({ 
            programa: programaEncontrado,
            programaId: programaEncontrado.id
          });
        }
      }
    });
  }
  
  onSubmit(): void {
    if (this.formularioGrado?.valid) {
      const body = {
        id: this.formularioGrado.value.id,
        codigo: this.formularioGrado.value.codigo,
        nombre: this.formularioGrado.value.nombre,
        semestre: this.formularioGrado.value.semestre,
        nivel: this.formularioGrado.value.nivel,
        creditos: this.formularioGrado.value.creditos,
        plan: this.formularioGrado.value.plan,
        areas: this.formularioGrado.value.areas,
        facultadId: this.formularioGrado.value.facultad?.id || this.formularioGrado.value.facultadId,
        facultadNombre: this.formularioGrado.value.facultad?.nombre,
        escuelaId: this.formularioGrado.value.escuela?.id || this.formularioGrado.value.escuelaId,
        escuelaNombre: this.formularioGrado.value.escuela?.nombre,
        programaId: this.formularioGrado.value.programa?.id || this.formularioGrado.value.programaId,
        programaNombre: this.formularioGrado.value.programa?.programa || this.formularioGrado.value.programa?.nombre
      };
      
      console.log("Body a enviar:", body);
      
      this.service.ponerurl("curso");
      
      if (this.fnc) {
        this.service.add(body).subscribe(() => {
          Swal.fire("Agregado", "Curso agregado correctamente", "success");
          this.dialogRef.close(body);
        });
      } else {
        this.service.update(body.codigo, body).subscribe(() => {
          Swal.fire("Actualizado", "Curso actualizado correctamente", "success");
          this.dialogRef.close(body);
        });
      }
    } else {
      this.formularioGrado?.markAllAsTouched();
    }
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}