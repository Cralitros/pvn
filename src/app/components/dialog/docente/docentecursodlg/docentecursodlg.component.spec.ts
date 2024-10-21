import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocentecursodlgComponent } from './docentecursodlg.component';

describe('DocentecursodlgComponent', () => {
  let component: DocentecursodlgComponent;
  let fixture: ComponentFixture<DocentecursodlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocentecursodlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocentecursodlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
