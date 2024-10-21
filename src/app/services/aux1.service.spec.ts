import { TestBed } from '@angular/core/testing';

import { Aux1Service } from './aux1.service';

describe('Aux1Service', () => {
  let service: Aux1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aux1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
