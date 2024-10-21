import { TestBed } from '@angular/core/testing';

import { CargatablaService } from './cargatabla.service';

describe('CargatablaService', () => {
  let service: CargatablaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CargatablaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
