import { TestBed } from '@angular/core/testing';

import { Saux4Service } from './saux4.service';

describe('Saux4Service', () => {
  let service: Saux4Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Saux4Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
