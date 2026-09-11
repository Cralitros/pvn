import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import Swal from 'sweetalert2';

import { InvestigadlgComponent } from './investigadlg.component';

describe('InvestigadlgComponent', () => {
  let dialogRef: { close: jasmine.Spy };

  beforeEach(() => {
    dialogRef = { close: jasmine.createSpy('close') };
    spyOn(Swal, 'fire').and.resolveTo({} as never);
  });

  /** Crea el diálogo con los datos indicados y responde a los catálogos. */
  async function crear(modo: number, valores: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({
      imports: [InvestigadlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo, valores } },
        { provide: MatDialogRef, useValue: dialogRef },
      ]
    })
    .compileComponents();

    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(InvestigadlgComponent);
    fixture.detectChanges();

    // Catálogo que pide el diálogo al abrirse.
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));

    return { component: fixture.componentInstance, fixture, httpMock };
  }

  /**
   * Abre la pestaña "Reconocimientos".
   *
   * Hace falta porque `mat-tab` sólo renderiza el contenido de la pestaña activa,
   * así que la tabla no existe en el DOM hasta que se abre.
   */
  function abrirPestanaReconocimientos(fixture: ComponentFixture<InvestigadlgComponent>): Promise<void> {
    const tabs = fixture.debugElement
      .query(By.directive(MatTabGroup))
      .componentInstance as MatTabGroup;

    tabs.selectedIndex = 1;
    fixture.detectChanges();

    return fixture.whenStable().then(() => {
      fixture.detectChanges();
    });
  }

  it('should create', async () => {
    const { component } = await crear(0, { laboral: [{ codigo: '1234' }] });
    expect(component).toBeTruthy();
  });

  it('al editar, carga el historial guardado de más reciente a más antiguo', async () => {
    const { component } = await crear(1, {
      id: '1',
      reconocimientos: JSON.stringify([
        { anio: '2019', nombre: 'antiguo', categoria: 'A', unidad: 'U1', observaciones: '' },
        { anio: '2023', nombre: 'reciente', categoria: 'B', unidad: 'U2', observaciones: 'ok' },
      ]),
    });

    expect(component.reconocimientosArray.value.map((f: any) => f.nombre))
      .toEqual(['reciente', 'antiguo']);
  });

  it('un historial guardado vacío deja la tabla vacía (no se inventa filas)', async () => {
    const { component } = await crear(1, { id: '1', reconocimientos: '[]' });

    expect(component.reconocimientosArray.length).toBe(0);
  });

  it('el botón Agregar pone la fila nueva al principio (la más reciente arriba)', async () => {
    const { component } = await crear(1, {
      id: '1',
      reconocimientos: JSON.stringify([
        { anio: '2019', nombre: 'antiguo', categoria: '', unidad: '', observaciones: '' },
      ]),
    });

    component.agregarFilaReconocimiento();

    expect(component.reconocimientosArray.length).toBe(2);
    expect(component.reconocimientosArray.value[0].nombre).toBe('');
    expect(component.reconocimientosArray.value[1].nombre).toBe('antiguo');
  });

  it('reenvía el historial guardado, ordenado y sin los campos antiguos', async () => {
    const historial = JSON.stringify([
      { anio: '2019', nombre: 'antiguo', categoria: '', unidad: '', observaciones: '' },
      { anio: '2024', nombre: 'reciente', categoria: '', unidad: '', observaciones: '' },
    ]);
    const { component, httpMock } = await crear(1, {
      id: '1',
      codigoDocente: '1234',
      reconocimientos: historial,
    });

    component.onSubmit();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'PUT');
    const cuerpo = guardado.request.body;

    expect(JSON.parse(cuerpo.reconocimientos).map((f: any) => f.nombre)).toEqual(['reciente', 'antiguo']);
    expect(cuerpo.ri).toBeUndefined();
    expect(cuerpo.pibpdu).toBeUndefined();

    guardado.flush({});
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('no cierra el diálogo hasta que el guardado responde', async () => {
    const { component, httpMock } = await crear(1, { id: '1', codigoDocente: '1234' });

    component.onSubmit();
    expect(dialogRef.close).not.toHaveBeenCalled();

    httpMock.expectOne(peticion => peticion.method === 'PUT').flush({});
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('el botón "Agregar Reconocimiento" de la tabla añade una fila (clic real en el DOM)', async () => {
    const { component, fixture } = await crear(0, { laboral: [{ codigo: '1234' }] });
    await abrirPestanaReconocimientos(fixture);

    const boton = fixture.nativeElement.querySelector('.btn-add-row') as HTMLElement;
    expect(boton).toBeTruthy();

    boton.click();
    fixture.detectChanges();

    expect(component.reconocimientosArray.length).toBe(1);
  });

  it('el botón de eliminar de una fila la quita de la tabla (clic real en el DOM)', async () => {
    const { component, fixture } = await crear(1, { id: '1' });
    // La confirmación de Swal debe responder "sí".
    (Swal.fire as jasmine.Spy).and.resolveTo({ isConfirmed: true } as never);

    component.agregarFilaReconocimiento();
    await abrirPestanaReconocimientos(fixture);
    expect(component.reconocimientosArray.length).toBe(1);

    const botonBorrar = fixture.nativeElement.querySelector('.col-acciones button') as HTMLElement;
    expect(botonBorrar).toBeTruthy();

    botonBorrar.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.reconocimientosArray.length).toBe(0);
  });

  it('no envía el campo `id` cuando está vacío (provocaba un 500 al guardar)', async () => {
    const { component, httpMock } = await crear(0, { laboral: [{ codigo: '1234' }] });

    component.onSubmit();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');

    // La API hace `update(req.body, ...)`: un id vacío ("") revienta con
    // "Incorrect integer value: '' for column 'id'".
    expect(guardado.request.body.id).toBeUndefined();

    guardado.flush({ id: '1' });
  });

  it('sí envía el id cuando la edición trae uno', async () => {
    const { component, httpMock } = await crear(1, { id: '7', codigoDocente: '1234' });

    component.onSubmit();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'PUT');
    expect(guardado.request.body.id).toBe('7');

    guardado.flush({});
  });

  it('si el guardado falla, el aviso incluye el código HTTP y el mensaje del servidor', async () => {
    const { component, httpMock } = await crear(1, { id: '1', codigoDocente: '1234' });

    component.onSubmit();

    httpMock.expectOne(peticion => peticion.method === 'PUT')
      .flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    const aviso = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(aviso.title).toContain('500');
    expect(aviso.text).toContain('boom');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
