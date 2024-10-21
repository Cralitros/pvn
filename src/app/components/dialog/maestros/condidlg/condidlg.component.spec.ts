import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondidlgComponent } from './condidlg.component';

describe('CondidlgComponent', () => {
  let component: CondidlgComponent;
  let fixture: ComponentFixture<CondidlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondidlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CondidlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
