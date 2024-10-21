import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosdlgComponent } from './cursosdlg.component';

describe('CursosdlgComponent', () => {
  let component: CursosdlgComponent;
  let fixture: ComponentFixture<CursosdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CursosdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
