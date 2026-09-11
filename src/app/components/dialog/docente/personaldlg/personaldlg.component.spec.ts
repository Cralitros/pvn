import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PersonaldlgComponent } from './personaldlg.component';

describe('PersonaldlgComponent', () => {
  let component: PersonaldlgComponent;
  let fixture: ComponentFixture<PersonaldlgComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaldlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 0, valores: {} } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PersonaldlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // El diálogo carga sus catálogos en `ngOnInit`: se responden vacíos para que
    // se inicialice sin llamar a la API real (antes este spec importaba
    // `describe`/`it` de `node:test`, lo que rompía el bundle de Karma).
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
