import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmasdlgComponent } from './firmasdlg.component';

describe('FirmasdlgComponent', () => {
  let component: FirmasdlgComponent;
  let fixture: ComponentFixture<FirmasdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmasdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FirmasdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
