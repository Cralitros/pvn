import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { InvestigadorComponent } from './investigador.component';
import { ConversiontablaService } from '../../../services/conversiontabla.service';

/** Deja avanzar los `await` internos del componente. */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('InvestigadorComponent', () => {
  const HISTORIAL = '[{"anio":"2024","nombre":"Premio X","categoria":"C","unidad":"U","observaciones":""}]';
  let openSpy: jasmine.Spy;

  beforeEach(() => {
    // Se espía el prototipo porque `MatDialogModule` le da al componente su
    // propia instancia de MatDialog (un mock por provider no se usaría).
    openSpy = spyOn(MatDialog.prototype, 'open')
      .and.returnValue({ afterClosed: () => of(undefined) } as never);

    spyOn(Swal, 'fire').and.resolveTo({} as never);
  });

  async function crear() {
    await TestBed.configureTestingModule({
      imports: [InvestigadorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(InvestigadorComponent);
    fixture.detectChanges();

    // Carga inicial de la tabla.
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));

    return { component: fixture.componentInstance, httpMock };
  }

  it('should create', async () => {
    const { component } = await crear();
    expect(component).toBeTruthy();
  });

  it('con el docente en la tabla, abre el diálogo en modo Editar con su historial', async () => {
    const { component } = await crear();
    component.tablaDepartamento = [{ id: '1', codigoDocente: '01300069', reconocimientos: HISTORIAL }] as any;
    component.formulario.setValue({ codigo: '01300069' });

    await component.abrirDialogoLaboral();

    const datos = openSpy.calls.mostRecent().args[1].data;
    expect(datos.modo).toBe(1);
    expect(datos.valores.reconocimientos).toBe(HISTORIAL);
  });

  it('acepta el código con espacios alrededor (antes no lo encontraba)', async () => {
    const { component } = await crear();
    component.tablaDepartamento = [{ id: '1', codigoDocente: '01300069', reconocimientos: HISTORIAL }] as any;
    component.formulario.setValue({ codigo: '  01300069  ' });

    await component.abrirDialogoLaboral();

    expect(openSpy.calls.mostRecent().args[1].data.modo).toBe(1);
  });

  it('si no está en la tabla pero SÍ tiene registro en la API, abre en modo Editar (no duplica)', async () => {
    const { component, httpMock } = await crear();
    component.tablaDepartamento = [{ id: '99', codigoDocente: 'OTRO' }] as any;
    component.formulario.setValue({ codigo: '01300069' });

    const abierto = component.abrirDialogoLaboral();

    httpMock.expectOne(peticion => peticion.url.endsWith('docentes/cod/01300069'))
      .flush([{ codigo: '01300069', nombres: 'Ana', apellidos: 'Pérez' }]);

    // El componente usa `await lastValueFrom(...)`, así que la comprobación del
    // registro se lanza en el siguiente tick, no dentro del flush.
    await tick();

    httpMock.expectOne(peticion => peticion.url.endsWith('docentesinvestiga/cod/01300069'))
      .flush([{ id: 1, codigoDocente: '01300069', reconocimientos: HISTORIAL }]);

    await abierto;

    const datos = openSpy.calls.mostRecent().args[1].data;
    expect(datos.modo).toBe(1);
    expect(datos.valores.reconocimientos).toBe(HISTORIAL);
  });

  it('si el docente no tiene registro, abre el diálogo en modo Añadir', async () => {
    const { component, httpMock } = await crear();
    component.tablaDepartamento = [{ id: '99', codigoDocente: 'OTRO' }] as any;
    component.formulario.setValue({ codigo: '00002111' });

    const abierto = component.abrirDialogoLaboral();

    httpMock.expectOne(peticion => peticion.url.endsWith('docentes/cod/00002111'))
      .flush([{ codigo: '00002111', nombres: 'Luis', apellidos: 'Gómez' }]);

    await tick();

    httpMock.expectOne(peticion => peticion.url.endsWith('docentesinvestiga/cod/00002111')).flush([]);

    await abierto;

    const datos = openSpy.calls.mostRecent().args[1].data;
    expect(datos.modo).toBe(0);
    expect(datos.valores.laboral.length).toBe(1);
  });

  it('avisa si el código de docente no existe', async () => {
    const { component, httpMock } = await crear();
    component.tablaDepartamento = [{ id: '99', codigoDocente: 'OTRO' }] as any;
    component.formulario.setValue({ codigo: '99999999' });

    const abierto = component.abrirDialogoLaboral();
    httpMock.expectOne(peticion => peticion.url.endsWith('docentes/cod/99999999')).flush([]);
    await abierto;

    expect(openSpy).not.toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('la tabla muestra un resumen del historial (antes no había ninguna columna)', async () => {
    const { component } = await crear();

    const columna = component.columns.find(column => column.columnDef === 'reconocimientos');
    expect(columna).toBeTruthy();

    expect(columna!.cell({ reconocimientos: '' })).toBe('');
    expect(columna!.cell({ reconocimientos: HISTORIAL })).toBe('2024 - Premio X');

    const dos = '[{"anio":"2024","nombre":"Nuevo","categoria":"","unidad":"","observaciones":""},' +
      '{"anio":"2020","nombre":"Viejo","categoria":"","unidad":"","observaciones":""}]';
    expect(columna!.cell({ reconocimientos: dos }))
      .toBe('2 reconocimientos · más reciente: 2024 - Nuevo');
  });

  it('el lápiz de la tabla también pasa el historial al diálogo', async () => {
    const { component } = await crear();

    // El listado usa este servicio compartido para saber qué fila se editó.
    TestBed.inject(ConversiontablaService).dataSeleccionada = {
      id: 5,
      codigoDocente: '1234',
      reconocimientos: HISTORIAL,
    };

    component.editar({ id: 5 });

    const datos = openSpy.calls.mostRecent().args[1].data;
    expect(datos.modo).toBe(1);
    expect(datos.valores.reconocimientos).toBe(HISTORIAL);
  });
});
