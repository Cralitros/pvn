import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramasdlgComponent } from './programasdlg.component';

describe('ProgramasdlgComponent', () => {
  let component: ProgramasdlgComponent;
  let fixture: ComponentFixture<ProgramasdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramasdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramasdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
