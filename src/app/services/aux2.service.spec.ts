import { TestBed } from '@angular/core/testing';

import { Aux2Service } from './aux2.service';

describe('Aux2Service', () => {
  let service: Aux2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aux2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
