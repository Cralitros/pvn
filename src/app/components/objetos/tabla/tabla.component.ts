import { Component, EventEmitter, HostListener, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';
import { ConversiontablaService } from '../../../services/conversiontabla.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FiltroComponent } from "../filtro/filtro.component";
import { InputsComponent } from "../inputs/inputs.component";
import { MatButtonModule } from '@angular/material/button';
import { log } from 'console';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Personal } from '../../modelos/personal';


@Component({
  selector: 'app-tabla',
  standalone: true,
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [MatPaginatorModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FiltroComponent,
    InputsComponent,
    MatFormFieldModule,
    MatButtonModule],
  
})
export class TablaComponent {
  @Input() columns: Column[] = [];
  @Input() fila: any;
  @Input() dataSource = new MatTableDataSource<any>([]);
  @Input() tipo: any;

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
  ELEMENT_DATA?: any[];
  dataSrc2: any;

  filterMenuVisible: boolean = false;  // Add this line
  filters: any;

  isFilterEnabled = false;
  inputText: string = '';
  isRowExpanded(row: any): boolean {
    return this.expandedElement === row;
  }

  constructor(private sctabla: CargatablaService,
    private das: ConversiontablaService,
    private router: Router
  ) {

  }
  ngOnInit(): void {
    console.log(this.fila, "fila");

    this.displayedColumns = this.columns.map(c => c.columnDef);

    this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expandedDetail'];

    this.sctabla.data$.subscribe(data => {
      this.dataSource.data = data;
      this.dataSrc2 = data;
    });

  }
  toggleFilter(event: any) {
    console.log(event);
    this.isFilterEnabled = event.checked;
    //this.isFilterEnabled = (event.target as any).checked;
    if (!this.isFilterEnabled) {
      this.resetFilter();
    }
  }
  resetFilter(): void {
    this.dataSource.filter = '';
  }

  toggleFilterMenu(event: MouseEvent) {
    console.log(this.filterMenuVisible);
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    this.filterMenuVisible = !this.filterMenuVisible;  // Add this method

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
  dpintar = false;
  dataClickedData(row: any) {
    this.cerrar();
    if (this.filterMenuVisible) {
      this.filterMenuVisible = false;
    }
    this.dpintar = true;
    this.selectedRow = row;
    console.log(row, "doble");
    this.rowEmittedDbl.emit(row);
  }
  dataCliked(row: any, event: MouseEvent): void {
    this.cerrar();
    if (this.filterMenuVisible) {
      this.filterMenuVisible = false;
    }
    this.dpintar = false;
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    this.selectedRow = row;
    console.log(row);
    this.rowEmitted.emit(row);

  }
  clkderecho(row: any, event: MouseEvent) {
    event.preventDefault(); // Prevenir el menú contextual por defecto del navegador
    this.selectedRow = row;
    if (this.filterMenuVisible) {
      this.filterMenuVisible = false;
    }
    this.dpintar = true;
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    console.log('Clicked row:', row);
    console.log('Menu position:', this.menuPosition);
    this.selectedRow = row;
    this.rowEmitted.emit(row);

  }
  dataClick(row: any, event: MouseEvent): void {
    this.expandedElement = this.expandedElement === row ? null : row;
    this.selectedRow = row;

    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    console.log('Clicked row:', row);
    console.log('Menu position:', this.menuPosition);
    console.log(row);
    this.rowEmitted.emit(row);
  }

  cerrar() {
    this.selectedRow = null;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest('.menu') && !targetElement.closest('table')) {
      this.cerrar();
    }
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
   // Debounce function using arrow function to retain 'this' context
   debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Debounced version of the filter with explicit typing
  applyFilterDebounced: (filterValue: any) => void = this.debounce((filterValue: any) => {
    this.applyFilter(filterValue);
  }, 300); // 300ms delay for debouncing

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      // Indexación simple del objeto a una cadena para búsqueda rápida
      const flattenObject = (obj: any): string => {
        let flatString = '';
        for (const key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object') {
            flatString += flattenObject(obj[key]); // Llamada recursiva para concatenar strings
          } else if (obj[key] !== null) {
            flatString += obj[key].toString().toLowerCase() + ' '; // Convertir todo a string y concatenar
          }
        }
        return flatString;
      };
  
      const flattenedData = flattenObject(data);
      return flattenedData.includes(filter); // Búsqueda rápida en la cadena plana
    };

    this.dataSource.filter = filterValue;
  }
  dataGenerada(filters: any) {
    //console.log(event);
    // this.filterMenuVisible=false;
    console.log(filters);
    this.filters = filters;
    this.applyFilters();
    this.filterMenuVisible = false;

  }

  applyFilters() {

    this.dataSource.filterPredicate = (data: any, filter: any): boolean => {
      // Si no hay filtro, mostrar todos los datos
      if (filter === '0') {
        this.filterMenuVisible = false;
        return true;
      }

      // Parsear el filtro y combinar los objetos en un solo objeto
      let filtro;
      try {
        filtro = JSON.parse(filter);
      } catch (e) {
        console.error('Error parsing filter:', e);
        return false;
      }

      const combinedObject = filtro.reduce((acc: any, item: any) => ({ ...acc, ...item }), {});

      // Normalizar los valores del filtro a minúsculas
      const normalizedFilter = Object.keys(combinedObject).reduce((acc: any, key: string) => {
        acc[key] = combinedObject[key].toString().toLowerCase();
        return acc;
      }, {});

      // Comprobar si los datos coinciden con los filtros
      return Object.keys(normalizedFilter).every((filterKey) => {
        const filterValue = normalizedFilter[filterKey];

        // Verificar si el dato coincide con el filtro
        const dataValue = data[filterKey];

        if (typeof dataValue === 'object' && dataValue !== null) {
          // Si el valor es un objeto, verificar en todas sus propiedades
          return Object.values(dataValue).some(val => val !== null && val?.toString().toLowerCase().includes(filterValue));
        }

        // Verificar el valor primitivo
        return dataValue !== null && dataValue.toString().toLowerCase().includes(filterValue);
      });
    }

    this.dataSource.filter = this.filters;
  }

  menuPosition = { x: 0, y: 0 };

  arreglo?: any[] = [];
  fitro2?: any[];
  filtroinput(element: any) {
    console.log(element);
    let eli = this.processInstruction(element);
    if (!eli) {
      if (this.arreglo?.length == 0) {
        this.arreglo.push({ [element.campo.columnDef]: element.valor });
      } else {
        this.updateOrAdd(element.campo.columnDef, element.valor);
      }
    }
    console.log(this.arreglo);
    this.fitro2 = this.convertArrayToObject(this.arreglo!);
    console.log(this.fitro2);

    this.dataGenerada(JSON.stringify([this.fitro2]));


  }

  updateOrAdd(key: string, value: any) {
    let found = false;

    for (let obj of this.arreglo!) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = value;
        found = true;
        break;
      }
    }

    if (!found) {
      let newObj: any = {};
      newObj[key] = value;
      this.arreglo!.push(newObj);
    }
  }

  convertArrayToObject(arr: any[]): any {
    return arr.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
  }

  processInstruction(instruction: { campo: any, valor: string, accion: string }): any {
    if (instruction.accion === 'eliminar') {
      delete this.fitro2?.[instruction.campo.columnDef];
      this.eliminarPorClave(instruction.campo.columnDef);
      return true;
    }
    return false;
  }

  eliminarPorClave(key: string): void {
    this.arreglo = this.arreglo!.filter(obj => !obj.hasOwnProperty(key));
  }

  mover(selectedRow:any,tip:any){
    console.log(selectedRow);

    this.router.navigate([`/dashboard/${tip}`], { 
      queryParams: { selectedRow }
    });
  }

}
