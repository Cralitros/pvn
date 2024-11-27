import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { DepartamentoComponent } from '../maestros/departamento/departamento.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    MatExpansionModule,
    RouterLink
  ]
})
export class NavigationComponent {
  nivel:any;
  private breakpointObserver = inject(BreakpointObserver);

  constructor(private route:Router){
    if (typeof window !== 'undefined' && window.localStorage) {
      this.nivel = localStorage.getItem('nivel');
    }

  }
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  
  cerrar_sesion() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem("token");
    }
    this.route.navigate(['login']);
    //inject(Router).navigate(['login']);
  }
}
