import {
  anioNumerico,
  ordenarPorAnioDescendente,
  parsearReconocimientos,
  serializarReconocimientos,
} from './reconocimientos.util';

describe('Historial de reconocimientos (utilidades)', () => {

  describe('parsearReconocimientos', () => {
    it('devuelve [] si el valor viene vacío, nulo o corrupto', () => {
      expect(parsearReconocimientos(null)).toEqual([]);
      expect(parsearReconocimientos(undefined)).toEqual([]);
      expect(parsearReconocimientos('')).toEqual([]);
      expect(parsearReconocimientos('{no es json')).toEqual([]);
      expect(parsearReconocimientos('{"a":1}')).toEqual([]);
    });

    it('parsea el JSON guardado en la columna', () => {
      const json = JSON.stringify([
        { anio: '2022', nombre: 'DAP', categoria: 'Premio', unidad: 'PUCP', observaciones: '' },
      ]);

      expect(parsearReconocimientos(json)).toEqual([
        { anio: '2022', nombre: 'DAP', categoria: 'Premio', unidad: 'PUCP', observaciones: '' },
      ]);
    });

    it('completa con cadenas vacías las filas a las que les falten campos', () => {
      expect(parsearReconocimientos('[{"anio":"2022"}]')).toEqual([
        { anio: '2022', nombre: '', categoria: '', unidad: '', observaciones: '' },
      ]);
    });
  });

  describe('anioNumerico', () => {
    it('convierte años válidos', () => {
      expect(anioNumerico('2022')).toBe(2022);
      expect(anioNumerico(2019)).toBe(2019);
    });

    it('trata como 0 lo que no es un año', () => {
      expect(anioNumerico('')).toBe(0);
      expect(anioNumerico(null)).toBe(0);
      expect(anioNumerico('abc')).toBe(0);
      expect(anioNumerico('12')).toBe(0);
    });
  });

  describe('ordenarPorAnioDescendente', () => {
    it('deja el más reciente primero sin mutar el original', () => {
      const filas = [
        { anio: '2019', nombre: 'a', categoria: '', unidad: '', observaciones: '' },
        { anio: '2023', nombre: 'b', categoria: '', unidad: '', observaciones: '' },
        { anio: '2021', nombre: 'c', categoria: '', unidad: '', observaciones: '' },
      ];

      expect(ordenarPorAnioDescendente(filas).map(f => f.anio)).toEqual(['2023', '2021', '2019']);
      expect(filas.map(f => f.anio)).toEqual(['2019', '2023', '2021']);
    });
  });

  describe('serializarReconocimientos', () => {
    it('guarda el JSON ordenado de más reciente a más antiguo', () => {
      const json = serializarReconocimientos([
        { anio: '2019', nombre: 'antiguo', categoria: '', unidad: '', observaciones: '' },
        { anio: '2023', nombre: 'reciente', categoria: '', unidad: '', observaciones: '' },
      ]);

      expect(JSON.parse(json).map((f: any) => f.nombre)).toEqual(['reciente', 'antiguo']);
    });

    it('descarta filas completamente vacías', () => {
      const json = serializarReconocimientos([
        { anio: '', nombre: '', categoria: '', unidad: '', observaciones: '' },
        { anio: '2022', nombre: 'DAP', categoria: '', unidad: '', observaciones: '' },
      ]);

      expect(JSON.parse(json).length).toBe(1);
    });
  });

});
