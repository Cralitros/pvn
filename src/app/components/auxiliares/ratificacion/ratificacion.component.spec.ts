import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatificacionComponent } from './ratificacion.component';

describe('RatificacionComponent', () => {
  let component: RatificacionComponent;
  let fixture: ComponentFixture<RatificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatificacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RatificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
