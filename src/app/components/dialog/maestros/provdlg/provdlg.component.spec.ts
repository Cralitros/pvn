import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvdlgComponent } from './provdlg.component';

describe('ProvdlgComponent', () => {
  let component: ProvdlgComponent;
  let fixture: ComponentFixture<ProvdlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvdlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvdlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
