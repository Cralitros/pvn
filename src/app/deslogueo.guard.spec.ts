import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { deslogueoGuard } from './deslogueo.guard';

describe('deslogueoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => deslogueoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
