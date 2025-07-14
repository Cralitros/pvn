import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDocenciaComponent } from './info-docencia.component';

describe('InfoDocenciaComponent', () => {
  let component: InfoDocenciaComponent;
  let fixture: ComponentFixture<InfoDocenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoDocenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfoDocenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
