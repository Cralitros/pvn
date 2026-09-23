import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { TablaComponent } from './tabla.component';
import { Column } from '../../modelos/column';
import { CargatablaService } from '../../../services/cargatabla.service';

/** Valor con saltos de línea, como el que devuelve `separar_data` en grado. */
const GRADO = '🎓 Grado: Maestría\n📜 Título: Ingeniero\n✅ SUNEDU: Sí';

/** Columnas de ejemplo: tres de datos (una con clase propia) y una de acciones. */
const COLUMNAS: Column[] = [
  { columnDef: 'codigo', header: 'Código', cell: (e: any) => e.codigo },
  { columnDef: 'correo', header: 'Correo', cell: (e: any) => e.correo },
  { columnDef: 'grado', header: 'Grado', cell: (e: any) => e.grado, cssClass: 'pre-formatted' },
  { columnDef: 'acciones', header: 'Acciones', cell: () => '', isAction: true },
];

const FILAS = [
  { codigo: '0001', correo: 'ana.perez@ejemplo.com', grado: GRADO },
  { codigo: '0002', correo: 'luis.gomez@ejemplo.com', grado: GRADO },
];

describe('TablaComponent', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [TablaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TablaComponent);
    const component = fixture.componentInstance;
    component.columns = COLUMNAS;
    fixture.detectChanges();

    // Las filas entran por el servicio compartido, que es el camino real: en
    // `ngOnInit` la tabla se suscribe a `data$` y ese BehaviorSubject emite su
    // valor inicial (vacío), así que asignar `dataSource.data` antes se perdía.
    TestBed.inject(CargatablaService).setData(FILAS);
    fixture.detectChanges();

    return { fixture, component };
  }

  const filasDeDatos = (fixture: any): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row:not(.fila-detalle)')) as HTMLElement[];

  it('should create', async () => {
    const { component } = await crear();
    expect(component).toBeTruthy();
  });

  it('añade el botón de desplegar delante de las columnas de datos', async () => {
    const { component } = await crear();

    // Regresión: el componente calculaba esta lista pero la plantilla seguía
    // usando `displayedColumns`, así que la tabla desplegable no se pintaba.
    expect(component.columnasCabecera).toEqual(['expandir', 'codigo', 'correo', 'grado', 'acciones']);
  });

  it('la fila de datos no incluye la columna de detalle', async () => {
    const { fixture } = await crear();

    // Regresión: al incluir 'expandedDetail' en las columnas de la fila de
    // datos, cada fila renderizaba una copia propia del panel; al desplegar, esa
    // copia se abría también y la fila original crecía con el contenido
    // duplicado (el panel salía dos veces).
    const filas = filasDeDatos(fixture);

    expect(filas.length).toBe(FILAS.length);
    filas.forEach(fila => {
      expect(fila.querySelector('.detalle')).toBeNull();
      expect(fila.querySelectorAll('td').length).toBe(5);
    });

    // Un solo panel por fila en toda la tabla.
    expect(fixture.nativeElement.querySelectorAll('.detalle').length).toBe(FILAS.length);
  });

  it('pinta un botón de desplegar por cada fila', async () => {
    const { fixture } = await crear();

    const botones = fixture.nativeElement.querySelectorAll('.col-expandir button');
    expect(botones.length).toBe(FILAS.length);
  });

  it('despliega el detalle de la fila y lo vuelve a cerrar', async () => {
    const { fixture, component } = await crear();

    expect(component.isRowExpanded(FILAS[0])).toBeFalse();

    const boton = fixture.nativeElement.querySelectorAll('.col-expandir button')[0] as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(component.isRowExpanded(FILAS[0])).toBeTrue();
    expect(component.isRowExpanded(FILAS[1])).toBeFalse();

    boton.click();
    fixture.detectChanges();

    expect(component.isRowExpanded(FILAS[0])).toBeFalse();
  });

  it('solo mantiene abierta una fila a la vez', async () => {
    const { fixture, component } = await crear();

    const botones = fixture.nativeElement.querySelectorAll('.col-expandir button');
    (botones[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    (botones[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.isRowExpanded(FILAS[0])).toBeFalse();
    expect(component.isRowExpanded(FILAS[1])).toBeTrue();
  });

  it('el detalle muestra los campos de datos y no la columna de acciones', async () => {
    const { fixture } = await crear();

    (fixture.nativeElement.querySelectorAll('.col-expandir button')[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    // Se acota a la primera fila de detalle: con `multiTemplateDataRows` cada
    // fila lleva su panel en el DOM y solo se anima la altura del desplegado.
    const detalle = fixture.nativeElement.querySelectorAll('tr.fila-detalle')[0] as HTMLElement;

    const etiquetas = Array.from(detalle.querySelectorAll('.detalle__etiqueta'))
      .map((nodo: any) => nodo.textContent.trim());
    expect(etiquetas).toEqual(['Código', 'Correo', 'Grado']);

    const valores = Array.from(detalle.querySelectorAll('.detalle__valor'))
      .map((nodo: any) => nodo.textContent.trim());
    expect(valores).toEqual(['0001', 'ana.perez@ejemplo.com', GRADO]);
  });

  it('el valor del grado llega al detalle con sus saltos de línea intactos', async () => {
    const { fixture } = await crear();

    (fixture.nativeElement.querySelectorAll('.col-expandir button')[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    const detalle = fixture.nativeElement.querySelectorAll('tr.fila-detalle')[0] as HTMLElement;
    const valores = Array.from(detalle.querySelectorAll('.detalle__valor')) as HTMLElement[];
    const grado = valores[2];

    // Los saltos tienen que sobrevivir al binding: el CSS los muestra con
    // `white-space: pre-wrap`. Si se perdieran aquí, el panel saldría de corrido.
    expect(grado.textContent).toBe(GRADO);
    expect(grado.textContent!.split('\n').length).toBe(3);
  });

  it('aplica la clase cssClass de la columna a la celda', async () => {
    const { fixture } = await crear();

    const celdas = Array.from(filasDeDatos(fixture)[0].querySelectorAll('td')) as HTMLElement[];
    const celdaGrado = celdas.find(celda => celda.textContent?.includes('🎓 Grado'));

    // `cssClass` era una propiedad muerta: la columna de grado declaraba
    // `pre-formatted` y la plantilla no la aplicaba en ningún sitio.
    expect(celdaGrado).toBeDefined();
    expect(celdaGrado!.classList).toContain('pre-formatted');
  });

  it('recorta el contenido de las celdas sin perder el texto completo', async () => {
    const { fixture } = await crear();

    const celdas = Array.from(filasDeDatos(fixture)[0].querySelectorAll('td')) as HTMLElement[];
    const grado = celdas.find(celda => celda.textContent?.includes('🎓 Grado'))!;

    // El recorte a una línea es visual (CSS): el DOM conserva el valor entero,
    // que es el que se lee completo en la fila desplegada.
    const texto = grado.querySelector('.celda-texto') as HTMLElement;
    expect(texto).not.toBeNull();
    expect(texto.textContent).toBe(GRADO);

    // La celda de acciones no se recorta: son botones, no texto.
    const acciones = celdas.find(celda => celda.querySelector('.buttons'))!;
    expect(acciones.querySelector('.celda-texto')).toBeNull();
  });

  it('marca la fila abierta para que se vea a qué registro pertenece el panel', async () => {
    const { fixture } = await crear();

    expect(filasDeDatos(fixture)[1].classList).not.toContain('fila-abierta');

    (fixture.nativeElement.querySelectorAll('.col-expandir button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(filasDeDatos(fixture)[1].classList).toContain('fila-abierta');
    expect(filasDeDatos(fixture)[0].classList).not.toContain('fila-abierta');
  });

  it('el clic en cualquier parte de la fila selecciona y despliega', async () => {
    const { fixture, component } = await crear();

    // El clic sigue seleccionando el registro (de ahí salen el menú contextual,
    // el PDF y la firma) y además abre su detalle.
    const celda = filasDeDatos(fixture)[1].querySelector('td:nth-child(2)') as HTMLElement;
    celda.click();
    fixture.detectChanges();

    expect(component.selectedRow).toBe(FILAS[1]);
    expect(component.isRowExpanded(FILAS[1])).toBeTrue();
    expect(component.isRowExpanded(FILAS[0])).toBeFalse();
  });

  it('el clic en los botones de acción no despliega la fila', async () => {
    const { fixture, component } = await crear();

    // La fila entera despliega, así que un clic en "editar" abriría el panel de
    // paso si no se filtrara.
    const editar = filasDeDatos(fixture)[0].querySelector('.buttons button') as HTMLButtonElement;
    editar.click();
    fixture.detectChanges();

    expect(component.isRowExpanded(FILAS[0])).toBeFalse();
  });

  describe('columna categoria (llega como texto JSON)', () => {
    const columna = { columnDef: 'categoria' } as Column;
    const HISTORIAL = JSON.stringify([
      { nombre: 'Principal', fecha: '2024-03-01', seleccionada: true },
      { nombre: 'Asociado', fecha: '2020-01-15', seleccionada: false },
    ]);

    /** El resumen no depende del render: basta con instanciar el componente. */
    function crearComponente(): TablaComponent {
      TestBed.configureTestingModule({
        imports: [TablaComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideNoopAnimations(),
          provideRouter([]),
        ],
      });

      return TestBed.createComponent(TablaComponent).componentInstance;
    }

    it('resume solo las categorías asignadas, una por línea', () => {
      const component = crearComponente();

      const resumen = component.datos(HISTORIAL, columna);

      // La fecha se comprueba por formato y no por valor: `fechaformat` usa
      // `new Date(...)` sobre la cadena, y una fecha sin hora se interpreta como
      // UTC, así que el día que sale depende de la zona horaria del navegador.
      expect(resumen).toMatch(/^Principal - Asignado: \d{2}\/\d{2}\/\d{4}$/);
      expect(resumen).not.toContain('Asociado');
      expect(resumen.split('\n').length).toBe(1);
    });

    it('no rompe con un valor vacío, nulo o no válido', () => {
      const component = crearComponente();

      // Regresión: `JSON.parse('')` lanzaba una excepción dentro de la
      // plantilla, y eso aborta el change detection a media tabla.
      expect(() => component.datos('', columna)).not.toThrow();
      expect(() => component.datos('undefined', columna)).not.toThrow();
      expect(() => component.datos(null, columna)).not.toThrow();
      expect(() => component.datos('[1,2,3]', columna)).not.toThrow();

      expect(component.datos('', columna)).toBe('');
      expect(component.datos('undefined', columna)).toBe('');
      expect(component.datos(null, columna)).toBe('');
      // Si no es JSON, se muestra el texto tal cual en vez de perderlo.
      expect(component.datos('texto suelto', columna)).toBe('texto suelto');
    });
  });
});
