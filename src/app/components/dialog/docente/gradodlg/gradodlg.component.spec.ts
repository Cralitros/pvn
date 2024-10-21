import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradodlgComponent } from './gradodlg.component';

describe('GradodlgComponent', () => {
  let component: GradodlgComponent;
  let fixture: ComponentFixture<GradodlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradodlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradodlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
