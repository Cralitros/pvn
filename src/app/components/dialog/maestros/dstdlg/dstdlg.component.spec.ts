import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DstdlgComponent } from './dstdlg.component';

describe('DstdlgComponent', () => {
  let component: DstdlgComponent;
  let fixture: ComponentFixture<DstdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DstdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DstdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
