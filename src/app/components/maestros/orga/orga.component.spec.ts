import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgaComponent } from './orga.component';

describe('OrgaComponent', () => {
  let component: OrgaComponent;
  let fixture: ComponentFixture<OrgaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrgaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
