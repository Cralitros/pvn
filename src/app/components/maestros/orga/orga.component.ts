import { Component } from '@angular/core';
import { OrgNode } from '../../modelos/organigrama.model';
import { OrganigramaComponent } from "../../objetos/organigrama/organigrama.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orga',
  standalone: true,
  imports: [OrganigramaComponent, CommonModule],
  templateUrl: './orga.component.html',
  styleUrl: './orga.component.scss'
})
export class OrgaComponent {

  raiz: OrgNode = {
    id: '1',
    name: 'Ana López',
    title: 'CEO',
    children: [
      {
        id: '2',
        name: 'Carlos Ruiz',
        title: 'CTO',
        children: [
          { id: '3', name: 'María Gómez', title: 'Lead Developer' },
          { id: '4', name: 'Jorge Pérez', title: 'DevOps Engineer' }
        ]
      },
      {
        id: '5',
        name: 'Lucía Fernández',
        title: 'CFO',
        children: [
          { id: '6', name: 'Roberto Díaz', title: 'Accountant' }
        ]
      }
    ]
  };
}
