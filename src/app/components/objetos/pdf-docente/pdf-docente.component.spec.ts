import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDocenteComponent } from './pdf-docente.component';

describe('PdfDocenteComponent', () => {
  let component: PdfDocenteComponent;
  let fixture: ComponentFixture<PdfDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfDocenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
