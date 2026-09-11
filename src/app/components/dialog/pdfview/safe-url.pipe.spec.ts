import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;

  beforeEach(() => {
    // El pipe necesita el DomSanitizer: antes se instanciaba sin argumentos y
    // el archivo no compilaba.
    pipe = new SafeUrlPipe(TestBed.inject(DomSanitizer));
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('marca la URL como recurso seguro', () => {
    expect(pipe.transform('https://ejemplo.com/contrato.pdf')).toBeTruthy();
  });
});
