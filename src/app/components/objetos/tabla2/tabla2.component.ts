import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Column } from '../../modelos/column';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tabla2',
  standalone: true,
  imports: [MatPaginatorModule, MatTableModule, CommonModule, MatIconModule],
  templateUrl: './tabla2.component.html',
  styleUrl: './tabla2.component.scss'
})
export class Tabla2Component {
  @Input() columns: Column[] = [];
  @Input() fila: any;
  @Input() dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowEmitted = new EventEmitter<any>();
  @Output() rowEmittedDbl = new EventEmitter<any>();

  selectedRow: any;

  //displayedColumns?: string[] = ['column1', 'column2', 'actions'];
  columnsToDisplayWithExpand?: string[];

  expandedElement: any | null;

  isRowExpanded(row: any): boolean {
    return this.expandedElement === row;
  }

  constructor(private sctabla: CargatablaService,
    private das: ConversiontablaService
  ) {

  }
  ngOnInit(): void {
    console.log(this.fila, "fila");

    this.displayedColumns = this.columns.map(c => c.columnDef);
    
    this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expandedDetail'];

    this.sctabla.data$.subscribe(data => {
      this.dataSource.data = data;
    });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  editElement(element: any): void {
    // Lógica para editar el elemento
    console.log('Edit', element);
    this.das.data(element);
    this.edit.emit(element);

  }

  deleteElement(element: any): void {
    // Lógica para eliminar el elemento
    console.log('Delete', element);
    this.delete.emit(element);
  }
  dataClickedData(row: any) {
    this.selectedRow = row;
    console.log(row, "doble");
    this.rowEmittedDbl.emit(row);
  }
  dataCliked(row: any): void {
    this.selectedRow = row;
    console.log(row);
    this.rowEmitted.emit(row);

  }
  dataClick(row: any): void {
    this.expandedElement = this.expandedElement === row ? null : row;
    this.selectedRow = row;
    console.log(row);
    this.rowEmitted.emit(row);
  }
  isRowSelected(row: any) {
    let columnas = ['id', 'dni', 'month'];
    return this.selectedRow === row;
    /* if(row){
       return true;
     }
     return false;*/
  }
  isRowHighlighted(row: any) {
    const rowIndex = this.dataSource.data.indexOf(row);
    return rowIndex === this.fila;

  }

}
