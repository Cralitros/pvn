import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OrgNode } from '../../modelos/organigrama.model';

@Component({
  selector: 'app-organigrama',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organigrama.component.html',
  styleUrl: './organigrama.component.scss'
})
export class OrganigramaComponent {
  @Input() nodo!: OrgNode;
}
