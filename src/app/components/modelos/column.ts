export interface Column {
    columnDef: string;
    header: string;
    cell: (element: any) => string;
    isAction?: boolean;  // Añadir esta propiedad para identificar columnas de acción
    esPersonal?:boolean;
  }