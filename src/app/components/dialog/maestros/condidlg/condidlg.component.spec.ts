import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { CondidlgComponent } from './condidlg.component';

describe('CondidlgComponent', () => {
  let component: CondidlgComponent;
  let fixture: ComponentFixture<CondidlgComponent>;
  let httpMock: HttpTestingController;
  let dialogRef: { close: jasmine.Spy };

  beforeEach(async () => {
    dialogRef = { close: jasmine.createSpy('close') };
    spyOn(Swal, 'fire').and.resolveTo({} as never);

    await TestBed.configureTestingModule({
      imports: [CondidlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 0, valores: {} } },
        { provide: MatDialogRef, useValue: dialogRef },
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CondidlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

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
    component.formulario.patchValue({ condicion: 'Activo' });

    component.onSubmit();

    // Antes había un close() aquí mismo, sin esperar a la API, así que el
    // listado recargaba con datos viejos.
    expect(dialogRef.close).not.toHaveBeenCalled();

    httpMock.expectOne(peticion => peticion.method === 'POST').flush({ id: '1' });

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('si el guardado falla, avisa y NO cierra el diálogo', () => {
    component.formulario.patchValue({ condicion: 'Activo' });

    component.onSubmit();

    httpMock.expectOne(peticion => peticion.method === 'POST')
      .flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(Swal.fire).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
