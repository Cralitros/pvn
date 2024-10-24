import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfpsdlgComponent } from './afpsdlg.component';

describe('AfpsdlgComponent', () => {
  let component: AfpsdlgComponent;
  let fixture: ComponentFixture<AfpsdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfpsdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfpsdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
