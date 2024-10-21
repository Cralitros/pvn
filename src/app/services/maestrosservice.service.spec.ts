import { TestBed } from '@angular/core/testing';

import { MaestrosserviceService } from './maestrosservice.service';

describe('MaestrosserviceService', () => {
  let service: MaestrosserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaestrosserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
