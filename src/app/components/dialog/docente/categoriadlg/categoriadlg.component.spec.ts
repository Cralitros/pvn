import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { CategoriadlgComponent } from './categoriadlg.component';

describe('CategoriadlgComponent', () => {
  let component: CategoriadlgComponent;
  let fixture: ComponentFixture<CategoriadlgComponent>;
  let httpMock: HttpTestingController;
  let dialogRef: { close: jasmine.Spy };

  beforeEach(async () => {
    dialogRef = { close: jasmine.createSpy('close') };
    spyOn(Swal, 'fire').and.resolveTo({} as never);

    await TestBed.configureTestingModule({
      imports: [CategoriadlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 0, valores: { laboral: [{ codigo: '1234' }] } } },
        { provide: MatDialogRef, useValue: dialogRef },
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CategoriadlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Catálogos que pide el diálogo al abrirse.
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
  });

  afterEach(() => {
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no cierra el diálogo hasta que el guardado responde', () => {
    component.agregarFilaAscenso({ nombre: 'Jefe de prácticas', fecha: '2019-03-12' });

    component.add_grado();

    // El bug original: había un close() aquí mismo, antes de que la API
    // contestara, así que la tabla recargaba sin ver el registro nuevo.
    expect(dialogRef.close).not.toHaveBeenCalled();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.flush({ id: '1' });

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('guarda las filas del histórico en `categoria` y deriva las columnas h*', () => {
    component.agregarFilaAscenso({ nombre: 'Jefe de prácticas', fecha: '2019-03-12' });
    component.agregarFilaAscenso({ nombre: 'Contratado', fecha: '2021-08-01' });

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    const cuerpo = guardado.request.body;

    expect(JSON.parse(cuerpo.categoria)).toEqual([
      { nombre: 'Jefe de prácticas', seleccionada: true, fecha: jasmine.any(String) },
      { nombre: 'Contratado', seleccionada: true, fecha: jasmine.any(String) },
    ]);
    expect(cuerpo.hJefePract).toBe(new Date('2019-03-12').toISOString());
    expect(cuerpo.hContratado).toBe(new Date('2021-08-01').toISOString());
    expect(cuerpo.hPrincipal).toBeNull();

    // «Fecha contrato» es la fecha más reciente de las filas.
    expect((cuerpo.fecha as Date).getFullYear()).toBe(2021);

    guardado.flush({ id: '1' });
  });

  it('si el guardado falla, avisa y NO cierra el diálogo', () => {
    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(Swal.fire).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
