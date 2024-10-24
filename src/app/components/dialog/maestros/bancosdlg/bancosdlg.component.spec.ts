import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BancosdlgComponent } from './bancosdlg.component';

describe('BancosdlgComponent', () => {
  let component: BancosdlgComponent;
  let fixture: ComponentFixture<BancosdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancosdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BancosdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
