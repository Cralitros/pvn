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
import { Observable, of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

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

  // ✅ MÉTODO COMBOS AGREGADO
  async combos(): Promise<void> {
    // Cargar planes
    this.auxService.ponerurl("plan");
    this.planes = await firstValueFrom(this.auxService.get());
    console.log("Planes cargados: ", this.planes);

    // Cargar áreas
    this.auxService.ponerurl("area");
    this.areas = await firstValueFrom(this.auxService.get());
    console.log("Áreas cargadas: ", this.areas);

    // Cargar FACULTADES
    this.auxService.ponerurl("facultad");
    this.facultades = await firstValueFrom(this.auxService.get());
    console.log("Facultades cargadas: ", this.facultades);
    this.facultadesFiltradas = of(this.facultades);
  }

  async ngOnInit(): Promise<void> {
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

    // Cargar combos primero
    await this.combos();

    // Si es modo edición, cargar datos
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      await this.poner_datos();
    } else {
      this.funcion = "Añadir";
      this.fnc = true;
    }
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

  async onFacultadSeleccionado(event: any): Promise<void> {
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

    // Cargar escuelas de esta facultad
    if (facultad && facultad.id) {
      this.auxService.ponerurl(`escuela?facultadId=${facultad.id}`);
      this.escuelas = await firstValueFrom(this.auxService.get());
      console.log("Escuelas cargadas:", this.escuelas);
      this.escuelasFiltradas = of(this.escuelas);
    }
  }

  async onEscuelaSeleccionado(event: any): Promise<void> {
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

    // Cargar programas de esta escuela
    if (escuela && escuela.id) {
      this.auxService.ponerurl(`programa?escuelaId=${escuela.id}`);
      this.programas = await firstValueFrom(this.auxService.get());
      console.log("Programas cargados:", this.programas);
      this.programasFiltrados = of(this.programas);
    }
  }

  displayFn(item: any): string {
    return item && item.nombre ? item.nombre : '';
  }

  displayProgFn(item: any): string {
    return item && (item.programa || item.nombre) ? (item.programa || item.nombre) : '';
  }

  async poner_datos(): Promise<void> {
    if (this.data.valores) {
      console.log("Datos a cargar en edición:", this.data.valores);
      
      // 1. Extraer los IDs de la estructura anidada
      const facultadId = this.data.valores.programa?.Escuela?.Facultad?.id;
      const escuelaId = this.data.valores.programa?.Escuela?.id;
      const programaId = this.data.valores.programa?.id;
      
      console.log("IDs extraídos:", { facultadId, escuelaId, programaId });
      
      // 2. Establecer valores básicos del formulario
      this.formularioGrado.patchValue({
        id: this.data.valores.id || '',
        codigo: this.data.valores.codigo || '',
        nombre: this.data.valores.nombre || '',
        semestre: this.data.valores.semestre || '',
        nivel: this.data.valores.nivel || '',
        creditos: this.data.valores.creditos || '',
        plan: this.data.valores.plan?.id || '',
        areas: this.data.valores.areas || '',
        facultadId: facultadId || '',
        escuelaId: escuelaId || '',
        programaId: programaId || ''
      });
      
      // 3. Buscar y cargar facultad
      if (facultadId && this.facultades.length > 0) {
        const facultadEncontrada = this.facultades.find(f => f.id === facultadId);
        console.log("Facultad encontrada:", facultadEncontrada);
        
        if (facultadEncontrada) {
          // Asignar el objeto completo de la facultad
          this.formularioGrado.patchValue({ 
            facultad: facultadEncontrada 
          });
          
          // Cargar escuelas de esta facultad y buscar la escuela seleccionada
          await this.cargarEscuelasPorFacultad(facultadId, escuelaId);
        }
      }
    }
  }

  async cargarEscuelasPorFacultad(facultadId: number, escuelaIdSeleccionada?: number): Promise<void> {
    console.log("Cargando escuelas para facultad:", facultadId);
    
    this.auxService.ponerurl(`escuela?facultadId=${facultadId}`);
    this.escuelas = await firstValueFrom(this.auxService.get());
    this.escuelasFiltradas = of(this.escuelas);
    console.log("Escuelas cargadas:", this.escuelas);
    
    // Si hay una escuela seleccionada, buscarla y cargar programas
    if (escuelaIdSeleccionada) {
      const escuelaEncontrada = this.escuelas.find(e => e.id === escuelaIdSeleccionada);
      console.log("Escuela encontrada:", escuelaEncontrada);
      
      if (escuelaEncontrada) {
        // Asignar el objeto completo de la escuela
        this.formularioGrado.patchValue({ 
          escuela: escuelaEncontrada,
          escuelaId: escuelaEncontrada.id
        });
        
        // Cargar programas de esta escuela y buscar el programa seleccionado
        await this.cargarProgramasPorEscuela(escuelaEncontrada.id, this.data.valores?.programa?.id);
      }
    }
  }

  async cargarProgramasPorEscuela(escuelaId: number, programaIdSeleccionado?: number): Promise<void> {
    console.log("Cargando programas para escuela:", escuelaId);
    
    this.auxService.ponerurl(`programa?escuelaId=${escuelaId}`);
    this.programas = await firstValueFrom(this.auxService.get());
    this.programasFiltrados = of(this.programas);
    console.log("Programas cargados:", this.programas);
    
    // Si hay un programa seleccionado, buscarlo
    if (programaIdSeleccionado) {
      const programaEncontrado = this.programas.find(p => p.id === programaIdSeleccionado);
      console.log("Programa encontrado:", programaEncontrado);
      
      if (programaEncontrado) {
        // Asignar el objeto completo del programa
        this.formularioGrado.patchValue({ 
          programa: programaEncontrado,
          programaId: programaEncontrado.id
        });
      }
    }
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
      
      console.log( "Body a enviar: ", body);
      
      this.service.ponerurl( "curso");
      
      if (this.fnc) {
        this.service.add(body).subscribe({
          next: () => {
            Swal.fire({
              title: "Agregado",
              text: "Curso agregado correctamente",
              icon: "success"
            });
            this.dialogRef.close(body);
          },
          error: (err) => {
            console.error("Error al agregar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo agregar el curso",
              icon: "error"
            });
          }
        });
      } else {
        this.service.update(body.codigo, body).subscribe({
          next: () => {
            Swal.fire({
              title: "Actualizado",
              text: "Curso actualizado correctamente",
              icon: "success"
            });
            this.dialogRef.close(body);
          },
          error: (err) => {
            console.error("Error al actualizar:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo actualizar el curso",
              icon: "error"
            });
          }
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