import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigadlgComponent } from './investigadlg.component';

describe('InvestigadlgComponent', () => {
  let component: InvestigadlgComponent;
  let fixture: ComponentFixture<InvestigadlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestigadlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvestigadlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
