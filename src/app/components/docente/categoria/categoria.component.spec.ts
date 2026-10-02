import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CategoriaComponent } from './categoria.component';
import { DocumentoArchivoService } from '../../../services/documento-archivo.service';

/** Fila de la API: `categoria` es el histórico de eventos en texto JSON. */
function registro(eventos: unknown[] = []): any {
  return {
    id: '1',
    codigoDocente: '1234',
    tipo: 'Nuevo',
    fecha: '2021-08-01',
    condiciondap: 'Activo',
    dedicacion: 'TC',
    labor: 'Si',
    categoriadap: 'Contratado',
    categoria: JSON.stringify(eventos),
  };
}

/** Evento con el detalle completo, como lo guarda el diálogo. */
const EVENTO = {
  seleccionada: true,
  fechaInicio: '2021-08-01',
  fechaFin: '2024-07-31',
  tipoProceso: 'Promoción',
  linea: 'Docente',
  departamento: 'Derecho',
  categoriaDocente: 'Asociado',
  modalidadIngreso: 'Evaluación',
  dedicacion: 'TC',
  documento: {
    nombre: 'resolucion.pdf',
    tipo: 'application/pdf',
    tamano: 120 * 1024,
    archivo: 'cat-1234-abc.pdf',
  },
};

describe('CategoriaComponent', () => {
  let component: CategoriaComponent;
  let fixture: ComponentFixture<CategoriaComponent>;
  let httpMock: HttpTestingController;
  let archivos: { abrir: jasmine.Spy; desdeBase64: jasmine.Spy };

  beforeEach(async () => {
    // El servicio abre la pestaña o descarga: en la prueba se comprueba que se
    // le llame con el blob correcto, sin abrir nada de verdad.
    archivos = {
      abrir: jasmine.createSpy('abrir'),
      desdeBase64: jasmine.createSpy('desdeBase64').and.returnValue(new Blob(['x'], { type: 'application/pdf' })),
    };

    await TestBed.configureTestingModule({
      imports: [CategoriaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: DocumentoArchivoService, useValue: archivos },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Listado que pide la pantalla al abrirse.
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
  });

  afterEach(() => {
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resume en la celda sólo los eventos asignados, uno por línea', () => {
    const resumen = component.resumenEventos(registro([
      EVENTO,
      { ...EVENTO, seleccionada: false, categoriaDocente: 'Auxiliar' },
    ]));

    // La fecha se comprueba por formato: `new Date('2021-08-01')` se interpreta
    // como UTC, así que el día depende de la zona horaria del navegador.
    expect(resumen).toMatch(/^Asociado - Promoción: \d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}$/);
    expect(resumen).not.toContain('Auxiliar');
  });

  it('reparte la categoría y la fecha de los registros anteriores al detalle', () => {
    const resumen = component.resumenEventos(registro([
      { nombre: 'Jefe de prácticas', fecha: '2019-03-12', seleccionada: true },
    ]));

    expect(resumen).toMatch(/^Jefe de práctica - Asignado: \d{2}\/\d{2}\/\d{4}$/);
  });

  it('no rompe con la columna del histórico vacía, nula o corrupta', () => {
    expect(() => component.resumenEventos(null)).not.toThrow();
    expect(component.resumenEventos(registro())).toBe('');
    expect(component.resumenEventos({ ...registro(), categoria: '' })).toBe('');
    expect(component.resumenEventos({ ...registro(), categoria: '{no es json' })).toBe('');
    expect(component.eventosDe({ ...registro(), categoria: '{"a":1}' })).toEqual([]);
  });

  it('expone el detalle de cada evento para la fila desplegada', () => {
    const [evento] = component.eventosDe(registro([EVENTO]));

    expect(component.categoriaDe(evento)).toBe('Asociado');
    expect(component.fechaCorta(evento.fechaInicio)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(component.fechaCorta(null)).toBe('');
    expect(component.tieneDocumento(evento)).toBeTrue();
    expect(component.tamanoLegible(evento.documento!.tamano)).toBe('120 KB');
  });

  it('pide el documento al servidor antes de abrirlo', () => {
    const [evento] = component.eventosDe(registro([EVENTO]));

    component.verDocumento(evento);

    const descarga = httpMock.expectOne(peticion => peticion.method === 'GET' && peticion.url.includes('/documento/'));
    const blob = new Blob(['pdf'], { type: 'application/pdf' });
    descarga.flush(blob);

    expect(archivos.abrir).toHaveBeenCalledWith(blob, 'resolucion.pdf', 'application/pdf');
  });

  it('abre los documentos del formato antiguo sin pedirlos al servidor', () => {
    const [evento] = component.eventosDe(registro([{
      ...EVENTO,
      documento: {
        nombre: 'viejo.pdf',
        tipo: 'application/pdf',
        tamano: 10,
        dataUrl: 'data:application/pdf;base64,AAAA',
      },
    }]));

    component.verDocumento(evento);

    expect(archivos.desdeBase64).toHaveBeenCalled();
    expect(archivos.abrir).toHaveBeenCalled();
    httpMock.expectNone(peticion => peticion.method === 'GET' && peticion.url.includes('/documento/'));
  });

  it('pinta el detalle de los eventos al desplegar la fila', () => {
    // El hijo comparte el mismo `MatTableDataSource`, así que basta con darle
    // filas para que la tabla y su panel de detalle se pinten.
    component.dataSource.data = [
      registro([
        EVENTO,
        // Evento a medias: sin fechas ni documento, para comprobar los huecos.
        { seleccionada: true, linea: 'Predocente', categoriaPredocente: 'Instructor' },
      ]),
    ];
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelectorAll('.col-expandir button')[0] as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    const detalle = fixture.nativeElement.querySelector('tr.fila-detalle') as HTMLElement;
    // Acotado a la tabla del detalle: `tbody tr` a secas también alcanza a las
    // filas del `tbody` de la tabla principal, que es ancestro de esta fila.
    const filas = Array.from(detalle.querySelectorAll('.eventos tbody tr')) as HTMLElement[];

    expect(filas.length).toBe(2);
    expect(detalle.querySelector('.detalle-historico__titulo')?.textContent).toContain('2');

    // Primer evento: todos los campos, la fecha correcta y el documento.
    // Las fechas se comprueban literales: con `new Date('2021-08-01')` (UTC) el
    // panel mostraba el día anterior en hora de Perú.
    expect(filas[0].textContent).toContain('01/08/2021');
    expect(filas[0].textContent).toContain('31/07/2024');
    expect(filas[0].textContent).toContain('Promoción');
    expect(filas[0].textContent).toContain('Docente');
    expect(filas[0].textContent).toContain('Derecho');
    expect(filas[0].textContent).toContain('Asociado');
    expect(filas[0].textContent).toContain('Evaluación');
    expect(filas[0].textContent).toContain('resolucion.pdf');
    expect(filas[0].querySelector('button.documento')).not.toBeNull();

    // Segundo evento: los campos vacíos salen marcados y sin documento.
    expect(filas[1].textContent).toContain('Instructor');
    expect(filas[1].textContent).toContain('Sin documento');
    expect(filas[1].querySelectorAll('td')[0].textContent).toContain('—');
    expect(filas[1].querySelector('button.documento')).toBeNull();
  });

  it('avisa cuando el registro no tiene eventos en el histórico', () => {
    component.dataSource.data = [registro()];
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelectorAll('.col-expandir button')[0] as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    const detalle = fixture.nativeElement.querySelector('tr.fila-detalle') as HTMLElement;

    expect(detalle.querySelector('.detalle-historico__vacio')?.textContent).toContain('no tiene eventos');
    expect(detalle.querySelector('table.eventos')).toBeNull();
  });
});
