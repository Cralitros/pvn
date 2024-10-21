import { TestBed } from '@angular/core/testing';

import { Aux3Service } from './aux3.service';

describe('Aux3Service', () => {
  let service: Aux3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aux3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
