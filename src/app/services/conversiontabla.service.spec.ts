import { TestBed } from '@angular/core/testing';

import { ConversiontablaService } from './conversiontabla.service';

describe('ConversiontablaService', () => {
  let service: ConversiontablaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversiontablaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
