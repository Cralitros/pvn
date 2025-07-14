import { Routes } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { DepartamentoComponent } from './components/maestros/departamento/departamento.component';
import { ProvinciaComponent } from './components/maestros/provincia/provincia.component';
import { DistritoComponent } from './components/maestros/distrito/distrito.component';
import { CondicionesComponent } from './components/maestros/condiciones/condiciones.component';
import { PersonalComponent } from './components/docente/personal/personal.component';
import { LaboralComponent } from './components/docente/laboral/laboral.component';
import { GradoComponent } from './components/docente/grado/grado.component';
import { CategoriaComponent } from './components/docente/categoria/categoria.component';
import { InvestigadorComponent } from './components/docente/investigador/investigador.component';
import { CursosComponent } from './components/maestros/cursos/cursos.component';
import { DocentecursoComponent } from './components/docente/docentecurso/docentecurso.component';
import { FacultadComponent } from './components/maestros/facultad/facultad.component';
import { EscuelaComponent } from './components/maestros/escuela/escuela.component';
import { LoginComponent } from './components/login/login.component';
import { logueoGuard } from './logueo.guard';
import { deslogueoGuard } from './deslogueo.guard';
import { ProgramaComponent } from './components/maestros/programa/programa.component';
import { UsuariosComponent } from './components/maestros/usuarios/usuarios.component';
import { BancosComponent } from './components/maestros/bancos/bancos.component';
import { AfpsComponent } from './components/maestros/afps/afps.component';
import { PlanComponent } from './components/maestros/plan/plan.component';
import { NacionalidadComponent } from './components/maestros/nacionalidad/nacionalidad.component';
import { AreasComponent } from './components/maestros/areas/areas.component';
import { InfoDocenciaComponent } from './components/docente/info-docencia/info-docencia.component';


export const routes: Routes = [
    { path: 'login', component: LoginComponent,title: "Login", canActivate:[logueoGuard]}, // Ruta por defecto
    {
        path: 'dashboard', component: NavigationComponent,title: "Dashboard Gestion Docente",
        children: [
            { path: 'usuarios', component: UsuariosComponent,title: "Usuarios", canActivate:[deslogueoGuard]},
            { path: 'departamento', component: DepartamentoComponent,title: "Departamentos", canActivate:[deslogueoGuard]},
            { path: 'provincia', component: ProvinciaComponent,title: "Provincias" , canActivate:[deslogueoGuard]},
            { path: 'distrito', component: DistritoComponent ,title: "Distritos", canActivate:[deslogueoGuard]},
            { path: 'condicion', component: CondicionesComponent,title: "Condiciones", canActivate:[deslogueoGuard] },
            { path: 'personal', component: PersonalComponent,title: "Docente" , canActivate:[deslogueoGuard]},
            { path: 'laboral', component: LaboralComponent,title: "Info. Laboral" , canActivate:[deslogueoGuard]},
            { path: 'grado', component: GradoComponent,title: "Info. Grado" , canActivate:[deslogueoGuard]},
            { path: 'categoria', component: CategoriaComponent,title: "Info. Categoria", canActivate:[deslogueoGuard] },
            { path: 'investigador', component: InvestigadorComponent,title: "Info. Investigador", canActivate:[deslogueoGuard] },
            { path: 'curso', component: CursosComponent,title: "Cursos", canActivate:[deslogueoGuard] },
            { path: 'cursoDocentes', component: DocentecursoComponent,title: "Cursos asignados", canActivate:[deslogueoGuard] },
            { path: 'facultad', component: FacultadComponent,title: "Facultad", canActivate:[deslogueoGuard] },
            { path: 'escuela', component: EscuelaComponent,title: "Escuela" , canActivate:[deslogueoGuard]},
            { path: 'programa', component: ProgramaComponent,title: "Programa" , canActivate:[deslogueoGuard]},
            { path: 'bancos', component: BancosComponent,title: "Bancos" , canActivate:[deslogueoGuard]},
            { path: 'nacionalidad', component: NacionalidadComponent,title: "Nacionalidades" , canActivate:[deslogueoGuard]},
            { path: 'afps', component: AfpsComponent,title: "AFP" , canActivate:[deslogueoGuard]},
            { path: 'plan', component: PlanComponent,title: "Plan Académico" , canActivate:[deslogueoGuard]},
            { path: 'area', component: AreasComponent,title: "Áreas" , canActivate:[deslogueoGuard]},
            { path: 'infoDocentes', component: InfoDocenciaComponent,title: "Informacion Docentes" , canActivate:[deslogueoGuard]},
           
        ],canActivate:[deslogueoGuard]
    },
    { path: '**', redirectTo: '/login', pathMatch: 'full' } // Ruta por defecto
];
