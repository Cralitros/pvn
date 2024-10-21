import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboraldlgComponent } from './laboraldlg.component';

describe('LaboraldlgComponent', () => {
  let component: LaboraldlgComponent;
  let fixture: ComponentFixture<LaboraldlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboraldlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LaboraldlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
