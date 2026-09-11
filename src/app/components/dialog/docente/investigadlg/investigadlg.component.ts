import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Investigador, ReconocimientoInvestigador } from '../../../modelos/investigador';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocenteInvestigacionApiService, detalleDeErrorHttp, tituloDeErrorHttp } from '../../../../core/api';
import Swal from 'sweetalert2';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ordenarPorAnioDescendente,
  parsearReconocimientos,
  reconocimientoVacio,
  serializarReconocimientos,
} from './reconocimientos.util';

@Component({
  selector: 'app-investigadlg',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './investigadlg.component.html',
  styleUrl: './investigadlg.component.scss'
})
export class InvestigadlgComponent {
  formulario?: FormGroup | any = null;
  departamentos?: Investigador[];
  funcion: any;
  fnc: boolean = true;
  grupo = ["Carlos Monge Medrano", "María Rostworowski", "No aplica"];
  nivel = ["I", "II", "III", "IV", "V", "VI", "VII", "No aplica"];
  condiciones=["Activo","Inactivo","No aplica"];
  constructor(public dialogRef: MatDialogRef<InvestigadlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private readonly docenteInvestigacionApi: DocenteInvestigacionApiService) {



  }
  poner_datos() {
    this.formulario.patchValue({
      id: this.data.valores.id || '',
      orcid: this.data.valores.orcid || '',
      renacyt: this.data.valores.renacyt || '',
      grupo: this.data.valores.grupo || '',
      nivel: this.data.valores.nivel || '',
      registro: this.data.valores.registro || '',
      rol: this.data.valores.rol || '',
      reconocimiento: this.data.valores.reconocimiento || '',
      contenido: this.data.valores.contenido || '',
      codigoDocente: this.data.valores.codigoDocente || '',

      condicion: this.data.valores.condicion || '',
      semestresInvestigacion: this.data.valores.semestresInvestigacion || ''

    });

    // Historial: la lista guardada + los 7 campos antiguos convertidos en filas.
    this.cargarReconocimientos();
    //this.form.value.id=this.data.valores.id;
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      id: [''],
      orcid: [''],
      renacyt: [''],
      grupo: [''],
      nivel: [''],
      registro: [''],
      rol: [''],
      reconocimiento: [''],
      // ✅ AHORA SON CAMPOS DE TEXTO (Strings vacíos)
      contenido: [''],      
      codigoDocente: [''],
      
      condicion: [''],
      semestresInvestigacion: [''],
      // Historial de reconocimientos: cada fila es
      // { año, nombre, categoría, unidad, observaciones }.
      reconocimientosTabla: this.formBuilder.array([])
    });
    this.docenteInvestigacionApi.listar().subscribe(data => {
      this.departamentos = data;
    });
    if (this.data.modo == 1) {
      this.funcion = "Editar";
      this.fnc = false;
      this.poner_datos();

    } else {
      this.funcion = "Añadir"
      this.poner_codigo();
      this.fnc = true;
    }

  }
  poner_codigo() {
    if (this.data.valores?.laboral?.length > 0) {
      this.formulario.get('codigoDocente').setValue(this.data.valores.laboral[0].codigo);
    }
  }
  // ─── Historial de reconocimientos ────────────────────────────────────────────

  get reconocimientosArray(): FormArray {
    return this.formulario.get('reconocimientosTabla') as FormArray;
  }

  /** Agrega una fila ARRIBA: el reconocimiento más reciente queda primero. */
  agregarFilaReconocimiento(): void {
    this.reconocimientosArray.insert(0, this.crearGrupoFila(reconocimientoVacio()));
  }

  eliminarFilaReconocimiento(index: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el reconocimiento de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reconocimientosArray.removeAt(index);
      }
    });
  }

  private crearGrupoFila(fila: ReconocimientoInvestigador): FormGroup {
    return this.formBuilder.group({
      anio: [fila.anio],
      nombre: [fila.nombre],
      categoria: [fila.categoria],
      unidad: [fila.unidad],
      observaciones: [fila.observaciones],
    });
  }

  /** Las filas del formulario como objetos simples. */
  private filasReconocimientos(): ReconocimientoInvestigador[] {
    return this.reconocimientosArray.controls.map(control => ({
      anio: control.get('anio')?.value ?? '',
      nombre: control.get('nombre')?.value ?? '',
      categoria: control.get('categoria')?.value ?? '',
      unidad: control.get('unidad')?.value ?? '',
      observaciones: control.get('observaciones')?.value ?? '',
    }));
  }

  /**
   * Rellena el historial al abrir el diálogo.
   *
   * La lista guardada en `reconocimientos` es la única fuente de verdad. Los
   * 7 campos fijos que usaba antes la pantalla (ri, pibpdu, gadi, sei, gadd,
   * gadit, dfi) ya no existen: sus datos se pasaron al historial con el script
   * `sql/migracion_reconocimientos_datos_y_limpieza.sql`.
   */
  private cargarReconocimientos(): void {
    while (this.reconocimientosArray.length > 0) {
      this.reconocimientosArray.removeAt(0);
    }

    ordenarPorAnioDescendente(parsearReconocimientos(this.data.valores?.reconocimientos))
      .forEach(fila => this.reconocimientosArray.push(this.crearGrupoFila(fila)));
  }

  onSubmit() {
    let body: Record<string, unknown> = {
      orcid: this.formulario.value?.orcid,
      renacyt: this.formulario.value?.renacyt,
      grupo: this.formulario.value?.grupo,
      nivel: this.formulario.value?.nivel,
      registro: this.formulario.value?.registro,
      rol: this.formulario.value?.rol,
      reconocimiento: this.formulario.value?.reconocimiento,
      contenido: this.formulario.value?.contenido,
      codigoDocente: this.formulario.value?.codigoDocente,

      condicion: this.formulario.value?.condicion,
      semestresInvestigacion: this.formulario.value?.semestresInvestigacion,
      // Historial de reconocimientos (columna `reconocimientos`), ordenado de
      // más reciente a más antiguo.
      //
      // Los 7 campos antiguos (ri, pibpdu, gadi, sei, gadd, gadit, dfi) NO se
      // envían: así no se sobrescriben y su contenido sigue a salvo en la base
      // de datos por si hubiera que volver atrás. El diálogo los convierte en
      // filas del historial al abrirlos.
      reconocimientos: serializarReconocimientos(this.filasReconocimientos())
    }

    // El `id` sólo se envía si tiene valor. La API hace `update(req.body, ...)`,
    // así que un id vacío provocaba un 500 ("Incorrect integer value: '' for
    // column 'id'"): con eso fallaban todas las actualizaciones y agregados.
    const id = this.formulario.value?.id;
    if (id !== undefined && id !== null && `${id}`.trim() !== '') {
      body['id'] = id;
    }

    if (this.formulario?.valid) {
      // Cierre SÓLO tras la respuesta: cerrar antes hacía que el listado
      // recargara sin ver todavía el registro guardado.
      if (this.fnc == true) {
        this.docenteInvestigacionApi.crear(body).subscribe({
          next: () => {
            Swal.fire({
              title: "Agregado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      } else {
        this.docenteInvestigacionApi.actualizar(this.formulario.value?.codigoDocente, body).subscribe({
          next: () => {
            Swal.fire({
              title: "Actualizado",
              text: "Continuar",
              icon: "info"
            });
            this.dialogRef.close(this.formulario.value);
          },
          error: (error) => this.mostrarErrorAlGuardar(error)
        })
      }
    } else {
      // Marcar campos como tocados para mostrar errores de validación
      this.formulario?.markAllAsTouched();
    }
  }
  /**
   * Aviso si el guardado falla: el diálogo se queda abierto para reintentar y se
   * muestra el código y el mensaje del servidor para poder diagnosticar sin
   * abrir la consola del navegador.
   */
  private mostrarErrorAlGuardar(error: unknown): void {
    console.error('Error al guardar:', error);

    Swal.fire({
      title: tituloDeErrorHttp('Error al guardar', error),
      text: detalleDeErrorHttp(error).mensaje ?? 'No se pudo guardar. Inténtalo de nuevo.',
      icon: 'error'
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  verificarInfo(data: any) {
    //console.log(data);
    if (data != undefined) {
      return `${data.nombres} ${data.apellidos}`
    }
    else {
      return "";
    }

  }
}
