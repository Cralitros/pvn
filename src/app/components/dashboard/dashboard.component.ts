import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService, Recurso, RECURSOS } from '../../core/api';
import { lastValueFrom } from 'rxjs';
import { OrgaComponent } from "../maestros/orga/orga.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    OrgaComponent
]
})
export class DashboardComponent {
  afps?: any;
  
  constructor(
    private readonly api: ApiService,
  ) { }

  // Se mantienen el orden y los valores originales: la plantilla empareja
  // estos arreglos por índice con `valores` y `valoresDocentes`.
  maestros: Recurso[] = [
    RECURSOS.afps, RECURSOS.departamentos, RECURSOS.provincias, RECURSOS.distritos,
    RECURSOS.facultad, RECURSOS.escuela, RECURSOS.programa, RECURSOS.login,
    RECURSOS.bancos, RECURSOS.nacionalidad, RECURSOS.area, RECURSOS.plan,
    RECURSOS.firma, RECURSOS.curso
  ]
  // 👇 Nuevo arreglo: solo rutas de docentes
  docentesRutas: Recurso[] = [
    RECURSOS.docentes, RECURSOS.docentesLaboral, RECURSOS.docentesGrado,
    RECURSOS.docentesCategoria, RECURSOS.docentesInvestigacion,
    RECURSOS.docentesCurso, RECURSOS.docentesInfo
  ];
  valores: number[] = [];
  valoresDocentes: number[] = [];
  // Dentro de tu componente
  getIcon(entity: string): string {
    const icons: Record<string, string> = {
      'docentes': 'school',
      'cursos': 'menu_book',
      'facultades': 'domain',
      'escuelas': 'account_balance',
      'usuarios': 'people',
      'personal': 'person',
      'laboral': 'work',
      'grado': 'stars',
      'categoria': 'category',
      'investigador': 'science',
      'cursoDocentes': 'class',
      'infoDocentes': 'analytics',
      'firma': 'edit',
      'afps': 'account_balance',
      'departamento': 'location_city',
      'provincia': 'map',
      'distrito': 'location_on',
      'bancos': 'account_balance',
      'nacionalidad': 'flag',
      'plan': 'description',
      'area': 'view_comfy',
      'default': 'storage'
    };
    return icons[entity.toLowerCase()] || icons['default'];
  }

  async ngOnInit() {
    // Cada llamada construye su propia URL: ya no comparten la `apiUrl` mutable
    // del servicio antiguo, que hacía que estas 21 peticiones simultáneas
    // acabaran todas contra el mismo recurso.
    this.valores = await Promise.all(
      this.maestros.map(recurso => this.cargartabla(recurso))
    );
    this.valoresDocentes = await Promise.all(
      this.docentesRutas.map(recurso => this.cargartabla(recurso))
    );
  }

  async cargartabla(recurso: Recurso): Promise<number> {
    try {
      const respuesta = await lastValueFrom(this.api.contar(recurso));
      return respuesta?.total ?? 0;
    } catch (error) {
      console.error(`Error al cargar ${recurso}:`, error);
      return 0;
    }
  }

}
