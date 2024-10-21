import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hijoGuard } from './hijo.guard';

describe('hijoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hijoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
