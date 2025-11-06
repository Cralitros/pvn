import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MaestrosserviceService } from '../../services/maestrosservice.service';
import { lastValueFrom } from 'rxjs';

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
    CommonModule
  ]
})
export class DashboardComponent {
  afps?: any;
  
  constructor(
    private mservice: MaestrosserviceService,
  ) { }

  maestros = ["afps", "departamentos", "provincias", "distritos",
    "facultad", "escuela", "programa", "login", "bancos", "nacionalidad",
    "area", "plan", "firma", "curso"
  ]
  // 👇 Nuevo arreglo: solo rutas de docentes
  docentesRutas = [
    'docentes', 'docenteslaboral', 'docentesgrado', 'docentescategoria',
    'docentesinvestiga', 'docentescurso', 'docentesinfo'
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
    //this.afps = await this.cargartabla("afps/total");
    this.valores = await Promise.all(
      this.maestros.map(entidad => this.cargartabla(`${entidad}/total`))
    );
    this.valoresDocentes = await Promise.all(
      this.docentesRutas.map(entidad => this.cargartabla(`${entidad}/total`))
    );
  }

  async cargartabla(entidad: string): Promise<number> {
    this.mservice.ponerurl(entidad);
    const source$ = this.mservice.get();
    try {
      const finalNumber: any = await lastValueFrom(source$);
      console.log('Respuesta completa:', finalNumber);
      return finalNumber.total || 0;
    } catch (error) {
      console.error(`Error al cargar ${entidad}:`, error);
      return 0;
    }
  }

}
