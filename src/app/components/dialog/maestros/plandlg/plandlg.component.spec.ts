import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlandlgComponent } from './plandlg.component';

describe('PlandlgComponent', () => {
  let component: PlandlgComponent;
  let fixture: ComponentFixture<PlandlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlandlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlandlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
