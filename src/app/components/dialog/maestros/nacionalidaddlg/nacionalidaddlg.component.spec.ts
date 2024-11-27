import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NacionalidaddlgComponent } from './nacionalidaddlg.component';

describe('NacionalidaddlgComponent', () => {
  let component: NacionalidaddlgComponent;
  let fixture: ComponentFixture<NacionalidaddlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NacionalidaddlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NacionalidaddlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
