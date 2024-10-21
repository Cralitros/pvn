import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaldlgComponent } from './personaldlg.component';

describe('PersonaldlgComponent', () => {
  let component: PersonaldlgComponent;
  let fixture: ComponentFixture<PersonaldlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaldlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaldlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
