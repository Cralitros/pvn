import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultaddlgComponent } from './facultaddlg.component';

describe('FacultaddlgComponent', () => {
  let component: FacultaddlgComponent;
  let fixture: ComponentFixture<FacultaddlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultaddlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacultaddlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
