import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfpsComponent } from './afps.component';

describe('AfpsComponent', () => {
  let component: AfpsComponent;
  let fixture: ComponentFixture<AfpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfpsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
