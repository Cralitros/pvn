import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DptdlgComponent } from './dptdlg.component';

describe('DptdlgComponent', () => {
  let component: DptdlgComponent;
  let fixture: ComponentFixture<DptdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DptdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DptdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
