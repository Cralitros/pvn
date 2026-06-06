import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaestrosserviceService } from '../../../services/maestrosservice.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import * as XLSX from 'xlsx-js-style';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PdfviewComponent } from '../../dialog/pdfview/pdfview.component';
import Swal from 'sweetalert2';
import { FirmaComponent } from '../../dialog/docente/firma/firma.component';
import { PdfDocenteComponent } from '../pdf-docente/pdf-docente.component';

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
  imports: [
    MatPaginatorModule,
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
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule // Añadido para evitar errores con dialog.open
  ],
})
export class TablaComponent {
  @Input() columns: Column[] = [];
  @Input() fila: any;
  @Input() dataSource = new MatTableDataSource<any>([]);
  @Input() tipo: any;
  @Input() report: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort | any;

  displayedColumns: string[] = [];
  columnsToDisplayWithExpand?: string[];
  expandedElement: any | null;
  dataSrc2: any;
  filterMenuVisible: boolean = false;
  filters: any;
  isFilterEnabled = false;
  inputText: string = '';
  dpintar = false;
  menuPosition = { x: 0, y: 0 };
  selectedRow: any;
  arreglo?: any[] = [];
  fitro2?: any[];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowEmitted = new EventEmitter<any>();
  @Output() rowEmittedDbl = new EventEmitter<any>();
  // Agrega este Output junto a los demás
  @Output() refreshTable = new EventEmitter<void>();
  constructor(
    private sctabla: CargatablaService,
    private das: ConversiontablaService,
    private router: Router,
    private mservice: MaestrosserviceService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.tabla();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  tabla() {
    this.displayedColumns = this.columns.map(c => c.columnDef);
    this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expandedDetail'];

    this.sctabla.data$.subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
      this.dataSrc2 = data;
    });
  }

  refresh() {
    // En lugar de llamar a this.tabla(), emitimos el evento al componente padre
    this.refreshTable.emit();
  }

  // ===== FILTROS =====
  toggleFilter(event: any) {
    this.isFilterEnabled = event.checked;
    if (!this.isFilterEnabled) {
      this.resetFilter();
    }
  }

  resetFilter(): void {
    this.dataSource.filter = '';
  }

  toggleFilterMenu(event: MouseEvent) {
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    this.filterMenuVisible = !this.filterMenuVisible;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const flattenObject = (obj: any): string => {
        let flatString = '';
        for (const key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object') {
            flatString += flattenObject(obj[key]);
          } else if (obj[key] !== null) {
            flatString += obj[key].toString().toLowerCase() + ' ';
          }
        }
        return flatString;
      };

      const flattenedData = flattenObject(data);
      return flattenedData.includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  applyFilterDebounced: (filterValue: any) => void = this.debounce((filterValue: any) => {
    this.applyFilter(filterValue);
  }, 300);

  dataGenerada(filters: any) {
    this.filters = filters;
    this.applyFilters();
    this.filterMenuVisible = false;
  }

  // ✅ CORREGIDO: Se arreglaron todos los errores de sintaxis (= >, normalizedFil ter, o bject, & &)
  // Método applyFilters corregido (sin errores de sintaxis)
  applyFilters() {
    this.dataSource.filterPredicate = (data: any, filter: any): boolean => {
      // Si no hay filtro, mostrar todos los datos
      if (filter === '0' || !filter) {
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
    };

    this.dataSource.filter = this.filters;
  }

  // Método para limpiar el filtro cuando se cancela
  limpiarFiltro() {
    this.filters = '0';
    this.arreglo = [];
    this.fitro2 = undefined;
    this.dataSource.filter = '';
    this.filterMenuVisible = false;
    this.isFilterEnabled = false;
  }

  filtroinput(element: any) {
    let eli = this.processInstruction(element);
    if (!eli) {
      if (this.arreglo?.length == 0) {
        this.arreglo.push({ [element.campo.columnDef]: element.valor });
      } else {
        this.updateOrAdd(element.campo.columnDef, element.valor);
      }
    }
    this.fitro2 = this.convertArrayToObject(this.arreglo!);
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

  // ===== ACCIONES DE FILA =====
  editElement(element: any): void {
    this.das.data(element);
    this.edit.emit(element);
  }

  // ✅ CORREGIDO: Bug del "undefined" al eliminar
  deleteElement(element: any): void {
    const nombreElemento = element.nombre || element.nombres || element.descripcion || element.id || 'este elemento';

    Swal.fire({
      title: `¿Deseas eliminar a ${nombreElemento}?`,
      text: "Sí eliminas, no se podrá revertir el cambio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, Eliminar!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete.emit(element);
      }
    });
  }

  dataClickedData(row: any) {
    this.cerrar();
    if (this.filterMenuVisible) {
      this.filterMenuVisible = false;
    }
    this.dpintar = true;
    this.selectedRow = row;
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
    this.rowEmitted.emit(row);
  }

  clkderecho(row: any, event: MouseEvent) {
    event.preventDefault();
    this.selectedRow = row;
    if (this.filterMenuVisible) {
      this.filterMenuVisible = false;
    }
    this.dpintar = true;
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    this.rowEmitted.emit(row);
  }

  dataClick(row: any, event: MouseEvent): void {
    this.expandedElement = this.expandedElement === row ? null : row;
    this.selectedRow = row;
    this.menuPosition.x = event.clientX;
    this.menuPosition.y = event.clientY;
    this.rowEmitted.emit(row);
  }

  isRowSelected(row: any) {
    return this.selectedRow === row;
  }

  isRowHighlighted(row: any) {
    const rowIndex = this.dataSource.data.indexOf(row);
    return rowIndex === this.fila;
  }

  isRowExpanded(row: any): boolean {
    return this.expandedElement === row;
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

  // ===== UTILIDADES =====
  debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // ✅ TU LÓGICA DE REDIRECCIÓN INTACTA
  mover(selectedRow: any, tip: any) {
    const targetUrl = `/dashboard/${tip}`;
    const queryParams = { selectedRow };
    const currentUrl = this.router.url.split('?')[0];

    if (currentUrl === targetUrl) {
      this.router.navigate([], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([targetUrl], { queryParams });
    }
  }

  reporte() {
    this.mservice.reporte();
  }

  exportToExcel() {
    let dataToExport: any[] = [];
    let sheetName = 'Hoja1';
    let fileName = 'reporte.xlsx';

    // Helper para formatear fechas
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // ✅ Mapeo según tipo de tabla departamento
    if (this.tipo === 'nacionalidad') {
      sheetName = 'Nacionalidades';
      fileName = 'Nacionalidades.xlsx';
      dataToExport = this.dataSource.data.map(item => ({
        'ID': item.id,
        'Nacionalidad': item.nombre,
        'País': item.pais,
        'Fecha de creación': formatDate(item.createdAt),
        'Fecha de actualización': formatDate(item.updatedAt)
      }));
    } else if (this.tipo === 'departamento') {
      sheetName = 'Departamentos';
      fileName = 'Departamentos.xlsx';
      dataToExport = this.dataSource.data.map(item => ({
        'ID': item.id,
        'Departamento': item.nombre,
        'Código telefónico': item.valor,
        'Fecha de creación': formatDate(item.createdAt),
        'Fecha de actualización': formatDate(item.updatedAt)
      }));
    }else if (this.tipo === 'provincia') {
      sheetName = 'Provincias';
      fileName = 'Provincias.xlsx';
      dataToExport = this.dataSource.data.map(item => ({
        'ID': item.id,
        'Provincia': item.nombre,
        'Departamento': item.Departamento.nombre,
        'Valor': item.valor,
        'Fecha de creación': formatDate(item.createdAt),
        'Fecha de actualización': formatDate(item.updatedAt)
      }));
    }else {
      dataToExport = this.dataSource.data;
    }

    // ✅ Crear hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // ✅ ANCHOS DE COLUMNA AUTOAJUSTADOS
    const colWidths = Object.keys(dataToExport[0] || {}).map(key => {
      const maxDataLength = dataToExport.reduce((max, row) => {
        const val = row[key] ? String(row[key]).length : 0;
        return val > max ? val : max;
      }, 0);
      const headerLength = key.length;
      return { wch: Math.max(maxDataLength, headerLength) + 4 };
    });
    worksheet['!cols'] = colWidths;

    // ✅ ESTILOS DE CELDAS
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        if (R === 0) {
          // 🎨 **CABECERA**: Fondo azul oscuro, texto blanco, negrita
          cell.s = {
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' },
              sz: 11,
              name: 'Calibri'
            },
            fill: {
              fgColor: { rgb: '2E75B6' } // Azul profesional
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: true
            },
            border: {
              top: { style: 'medium', color: { rgb: '1F4E79' } },
              bottom: { style: 'medium', color: { rgb: '1F4E79' } },
              left: { style: 'medium', color: { rgb: '1F4E79' } },
              right: { style: 'medium', color: { rgb: '1F4E79' } },
            },
          };
        } else {
          // 📄 **CONTENIDO**: Fondo alternado (zebra), bordes suaves
          const isEvenRow = R % 2 === 0;
          cell.s = {
            font: { sz: 10, name: 'Calibri' },
            alignment: {
              horizontal: C === 0 ? 'center' : 'left',
              vertical: 'center'
            },
            border: {
              top: { style: 'thin', color: { rgb: 'D9D9D9' } },
              bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
              left: { style: 'thin', color: { rgb: 'D9D9D9' } },
              right: { style: 'thin', color: { rgb: 'D9D9D9' } },
            },
            fill: {
              fgColor: { rgb: isEvenRow ? 'F2F2F2' : 'FFFFFF' } // Gris claro / Blanco
            },
          };
        }
      }
    }

    // ✅ ALTURA DE FILAS
    worksheet['!rows'] = [{ hpt: 28 }]; // Cabecera más alta

    // ✅ CONGELAR PANELES (cabecera fija)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // ✅ Generar libro y descargar
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  }
  // ─── Helper para formatear fechas en Excel ──────────────────────────────────
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Si no es válida, devuelve el original

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  llamarPDF(element: any) {
    const dialogRef = this.dialog.open(PdfDocenteComponent, {
      width: '800px',
      height: '950px',
      data: { persona: element }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  contrato(element: any) {
    const dialogRef = this.dialog.open(PdfviewComponent, {
      width: '700px',
      height: '950px',
      data: { persona: element }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  firma(element: any) {
    const dialogRef = this.dialog.open(FirmaComponent, {
      width: '700px',
      height: '950px',
      data: { persona: element }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  datos(element: any, title: any) {
    let cadena = '';
    if (title.columnDef == 'categoria') {
      let parseElement = JSON.parse(element);
      parseElement.forEach((el: any) => {
        if (el.seleccionada) {
          cadena += el.nombre + " - Asignado:" + this.fechaformat(el.fecha) + "\n";
        }
      });
      return cadena;
    }
    return element;
  }

  fechaformat(fechaParam?: Date | string) {
    const fecha = fechaParam ? new Date(fechaParam) : new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}