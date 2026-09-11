import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DepartamentoacaddlgComponent } from './departamentoacaddlg.component';

describe('DepartamentoacaddlgComponent', () => {
  let component: DepartamentoacaddlgComponent;
  let fixture: ComponentFixture<DepartamentoacaddlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentoacaddlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 0, valores: {} } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartamentoacaddlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
