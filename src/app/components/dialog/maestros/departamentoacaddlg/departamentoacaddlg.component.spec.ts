import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscueladlgComponent } from './departamentoacaddlg.component';

describe('EscueladlgComponent', () => {
  let component: EscueladlgComponent;
  let fixture: ComponentFixture<EscueladlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscueladlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EscueladlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
