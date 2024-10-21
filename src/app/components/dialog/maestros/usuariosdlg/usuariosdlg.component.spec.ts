import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosdlgComponent } from './usuariosdlg.component';

describe('UsuariosdlgComponent', () => {
  let component: UsuariosdlgComponent;
  let fixture: ComponentFixture<UsuariosdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsuariosdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
