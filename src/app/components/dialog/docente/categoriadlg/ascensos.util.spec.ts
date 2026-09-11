import {
  ascensosDesdeColumnas,
  derivarColumnasHistorico,
  fechaMasReciente,
  parsearCategoria,
} from './ascensos.util';

describe('Histórico de ascensos', () => {

  describe('parsearCategoria', () => {
    it('devuelve [] si el valor viene vacío, nulo o corrupto', () => {
      expect(parsearCategoria(null)).toEqual([]);
      expect(parsearCategoria(undefined)).toEqual([]);
      expect(parsearCategoria('')).toEqual([]);
      expect(parsearCategoria('   ')).toEqual([]);
      expect(parsearCategoria('{no es json')).toEqual([]);
      expect(parsearCategoria('{"a":1}')).toEqual([]);
    });

    it('acepta una lista ya parseada sin copiarla', () => {
      const lista = [{ nombre: 'Jefe de prácticas', fecha: '2019-03-12' }];
      expect(parsearCategoria(lista)).toBe(lista);
    });

    it('parsea el JSON guardado en la columna', () => {
      const json = JSON.stringify([
        { nombre: 'Contratado', seleccionada: true, fecha: '2021-08-01' },
      ]);
      expect(parsearCategoria(json).length).toBe(1);
      expect(parsearCategoria(json)[0].nombre).toBe('Contratado');
    });
  });

  describe('derivarColumnasHistorico', () => {
    it('devuelve siempre las 9 columnas y deja en null las que no tienen fila', () => {
      const columnas = derivarColumnasHistorico([{ nombre: 'Jefe de prácticas', fecha: '2019-03-12' }]);

      expect(Object.keys(columnas).length).toBe(9);
      expect(columnas['hJefePract']).toBe(new Date('2019-03-12').toISOString());
      expect(columnas['hContratado']).toBeNull();
      expect(columnas['hAsistente']).toBeNull();
    });

    it('si una categoría se repite conserva la fecha más antigua', () => {
      const columnas = derivarColumnasHistorico([
        { nombre: 'Auxiliar', fecha: '2024-01-10' },
        { nombre: 'Auxiliar', fecha: '2020-05-20' },
      ]);

      expect(columnas['hAuxiliar']).toBe(new Date('2020-05-20').toISOString());
    });

    it('ignora categorías desconocidas y fechas inválidas', () => {
      const columnas = derivarColumnasHistorico([
        { nombre: 'Categoría inventada', fecha: '2020-01-01' },
        { nombre: 'Principal', fecha: 'esto no es una fecha' },
      ]);

      expect(columnas['hPrincipal']).toBeNull();
    });
  });

  describe('fechaMasReciente', () => {
    it('devuelve null cuando no hay ninguna fecha', () => {
      expect(fechaMasReciente([null, '', undefined])).toBeNull();
    });

    it('devuelve la fecha mayor', () => {
      expect(fechaMasReciente(['2019-03-12', '2021-08-01', null])?.getFullYear()).toBe(2021);
    });
  });

  describe('ascensosDesdeColumnas', () => {
    it('reconstruye las filas de los registros anteriores al cambio', () => {
      const filas = ascensosDesdeColumnas({
        jefepractica: '2019-03-12',
        contratado: null,
        principal: '',
      });

      expect(filas).toEqual([{ nombre: 'Jefe de prácticas', fecha: '2019-03-12' }]);
    });

    it('devuelve [] si no hay valores', () => {
      expect(ascensosDesdeColumnas(null)).toEqual([]);
      expect(ascensosDesdeColumnas(undefined)).toEqual([]);
    });
  });
});
