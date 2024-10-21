import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Column } from '../../modelos/column';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [MatPaginatorModule, MatTableModule, CommonModule, MatIconModule, MatInputModule, MatCheckboxModule, MatSelectModule, MatButtonModule,FormsModule],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {
  @Output() filterg = new EventEmitter<any>();
  @Input() columns: Column[] = [];
  filters: { column: string, filter: string }[] = [];

  addFilter() {
    this.filters.push({ column: '', filter: '' });
  }
  aceptarFiltro() {
    const formattedFilters = this.filters.map(filter => {
      return { [filter.column]: filter.filter };
    });
    const filtersJson = JSON.stringify(formattedFilters);
    console.log(filtersJson);
    this.filterg.emit(filtersJson);

  }
  cancelarrFiltro() {
    this.filterg.emit(0);
  }
}


