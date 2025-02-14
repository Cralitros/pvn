import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasdlgComponent } from './areasdlg.component';

describe('AreasdlgComponent', () => {
  let component: AreasdlgComponent;
  let fixture: ComponentFixture<AreasdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreasdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
