import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriadlgComponent } from './categoriadlg.component';

describe('CategoriadlgComponent', () => {
  let component: CategoriadlgComponent;
  let fixture: ComponentFixture<CategoriadlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriadlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriadlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
