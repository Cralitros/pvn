import { TestBed } from '@angular/core/testing';

import { TipoTablaService } from './tipo-tabla.service';

describe('TipoTablaService', () => {
  let service: TipoTablaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoTablaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
