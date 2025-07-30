import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfodocenciadlgComponent } from './infodocenciadlg.component';

describe('InfodocenciadlgComponent', () => {
  let component: InfodocenciadlgComponent;
  let fixture: ComponentFixture<InfodocenciadlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfodocenciadlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfodocenciadlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
