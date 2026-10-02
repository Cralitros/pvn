import {
  ascensosDesdeColumnas,
  CATEGORIAS_DOCENTE,
  categoriaVisible,
  crearEventoVacio,
  cuerpoDemasiadoGrande,
  derivarColumnasHistorico,
  eventoVacio,
  fechaLocal,
  fechaMasReciente,
  formatearTamano,
  LIMITE_CUERPO_BYTES,
  MAX_DOCUMENTO_BYTES,
  nombreDocumento,
  normalizarEvento,
  parsearCategoria,
  TAMANO_TROZO_BYTES,
  validarDocumento,
} from './categoria-historico.util';
import { EventoCategoria } from './categoria';

/** Evento completo, para no repetir los diez campos en cada prueba. */
function evento(parcial: Partial<EventoCategoria>): EventoCategoria {
  return { ...crearEventoVacio(), ...parcial };
}

describe('Histórico de categoría', () => {

  describe('parsearCategoria', () => {
    it('devuelve [] si el valor viene vacío, nulo o corrupto', () => {
      expect(parsearCategoria(null)).toEqual([]);
      expect(parsearCategoria(undefined)).toEqual([]);
      expect(parsearCategoria('')).toEqual([]);
      expect(parsearCategoria('   ')).toEqual([]);
      expect(parsearCategoria('{no es json')).toEqual([]);
      expect(parsearCategoria('{"a":1}')).toEqual([]);
    });

    it('parsea el JSON guardado, con el detalle de cada evento', () => {
      const json = JSON.stringify([
        evento({
          fechaInicio: '2021-08-01',
          fechaFin: '2023-07-31',
          tipoProceso: 'Promoción',
          linea: 'Docente',
          departamento: 'Derecho',
          categoriaDocente: 'Asociado',
          modalidadIngreso: 'Evaluación',
          dedicacion: 'TC',
        }),
      ]);

      const eventos = parsearCategoria(json);

      expect(eventos.length).toBe(1);
      expect(eventos[0].tipoProceso).toBe('Promoción');
      expect(eventos[0].categoriaDocente).toBe('Asociado');
      expect(eventos[0].fechaFin).toBe('2023-07-31');
    });

    it('reparte la categoría y la fecha de los registros antiguos', () => {
      const json = JSON.stringify([
        { nombre: 'Contratado', seleccionada: true, fecha: '2021-08-01' },
        { nombre: 'Jefe de prácticas', seleccionada: true, fecha: '2019-03-12' },
      ]);

      const [docente, predocente] = parsearCategoria(json);

      expect(docente).toEqual(jasmine.objectContaining({
        categoriaDocente: 'Contratado',
        linea: 'Docente',
        fechaInicio: '2021-08-01',
      }));
      expect(predocente).toEqual(jasmine.objectContaining({
        categoriaPredocente: 'Jefe de práctica',
        linea: 'Predocente',
        fechaInicio: '2019-03-12',
      }));
    });

    it('acepta una lista ya parseada', () => {
      const lista = [evento({ categoriaDocente: 'Auxiliar', linea: 'Docente' })];

      expect(parsearCategoria(lista)).toEqual(lista);
    });
  });

  describe('normalizarEvento', () => {
    it('devuelve un evento vacío con cualquier valor que no sea una fila', () => {
      expect(normalizarEvento(null)).toEqual(crearEventoVacio());
      expect(normalizarEvento('texto')).toEqual(crearEventoVacio());
    });

    it('descarta un documento sin datos', () => {
      expect(normalizarEvento({ documento: { nombre: 'x.pdf' } }).documento).toBeNull();
    });

    it('acepta el documento nuevo (referencia al archivo del servidor)', () => {
      const conArchivo = normalizarEvento({
        documento: { nombre: 'x.pdf', tipo: 'application/pdf', tamano: 10, archivo: 'cat-1234-abc.pdf' },
      });

      expect(conArchivo.documento?.archivo).toBe('cat-1234-abc.pdf');
    });

    it('acepta el documento antiguo (base64 dentro del JSON)', () => {
      const conBase64 = normalizarEvento({
        documento: { nombre: 'x.pdf', tipo: 'application/pdf', tamano: 10, dataUrl: 'data:application/pdf;base64,AAA' },
      });

      expect(conBase64.documento?.nombre).toBe('x.pdf');
    });
  });

  describe('categoriaVisible', () => {
    it('usa la categoría de la línea elegida', () => {
      expect(categoriaVisible(evento({ linea: 'Predocente', categoriaPredocente: 'Instructor' }))).toBe('Instructor');
      expect(categoriaVisible(evento({ linea: 'Docente', categoriaDocente: 'Principal' }))).toBe('Principal');
    });

    it('sin línea toma la que tenga dato', () => {
      expect(categoriaVisible(evento({ categoriaPredocente: 'Ayudante' }))).toBe('Ayudante');
      expect(categoriaVisible(evento({ categoriaDocente: 'Auxiliar' }))).toBe('Auxiliar');
    });
  });

  describe('eventoVacio', () => {
    it('reconoce la fila recién creada y la que ya tiene datos', () => {
      expect(eventoVacio(crearEventoVacio())).toBeTrue();
      expect(eventoVacio(evento({ tipoProceso: 'Ingreso' }))).toBeFalse();
      expect(eventoVacio(evento({ fechaInicio: '2020-01-01' }))).toBeFalse();
    });
  });

  describe('derivarColumnasHistorico', () => {
    it('devuelve siempre las 9 columnas y deja en null las que no tienen evento', () => {
      const columnas = derivarColumnasHistorico([
        evento({ linea: 'Predocente', categoriaPredocente: 'Jefe de práctica', fechaInicio: '2019-03-12' }),
      ]);

      expect(Object.keys(columnas).length).toBe(9);
      expect(columnas['hJefePract']).toBe(new Date('2019-03-12').toISOString());
      expect(columnas['hContratado']).toBeNull();
      expect(columnas['hAsistente']).toBeNull();
    });

    it('usa la fecha de inicio, no la de fin', () => {
      const columnas = derivarColumnasHistorico([
        evento({
          linea: 'Docente',
          categoriaDocente: 'Contratado',
          fechaInicio: '2021-08-01',
          fechaFin: '2024-07-31',
        }),
      ]);

      expect(columnas['hContratado']).toBe(new Date('2021-08-01').toISOString());
    });

    it('si una categoría se repite conserva la fecha más antigua', () => {
      const columnas = derivarColumnasHistorico([
        evento({ linea: 'Docente', categoriaDocente: 'Auxiliar', fechaInicio: '2024-01-10' }),
        evento({ linea: 'Docente', categoriaDocente: 'Auxiliar', fechaInicio: '2020-05-20' }),
      ]);

      expect(columnas['hAuxiliar']).toBe(new Date('2020-05-20').toISOString());
    });

    it('ignora categorías sin columna y fechas inválidas', () => {
      const columnas = derivarColumnasHistorico([
        evento({ linea: 'Docente', categoriaDocente: 'Honorario', fechaInicio: '2020-01-01' }),
        evento({ linea: 'Docente', categoriaDocente: 'Principal', fechaInicio: 'esto no es una fecha' }),
      ]);

      expect(columnas['hPrincipal']).toBeNull();
    });

    it('sólo deriva las categorías que tienen columna en la API', () => {
      // «Honorario», «Emérito» y «Contratado jubilado» existen en el catálogo
      // docente pero la API no tiene columna `h*` para ellos.
      expect(CATEGORIAS_DOCENTE).toContain('Honorario');
      const columnas = derivarColumnasHistorico([
        evento({ linea: 'Docente', categoriaDocente: 'Honorario', fechaInicio: '2020-01-01' }),
      ]);

      expect(Object.values(columnas).every(valor => valor === null)).toBeTrue();
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

  describe('fechaLocal', () => {
    it('lee una fecha sin hora como fecha local, no como UTC', () => {
      // Regresión: `new Date('2021-08-01')` es medianoche UTC, así que en hora de
      // Perú el panel mostraba el 31 de julio.
      const fecha = fechaLocal('2021-08-01')!;

      expect(fecha.getFullYear()).toBe(2021);
      expect(fecha.getMonth()).toBe(7); // agosto
      expect(fecha.getDate()).toBe(1);
    });

    it('respeta los valores que ya traen hora', () => {
      const fecha = fechaLocal('2021-08-01T05:00:00.000Z')!;

      // Se interpreta como instante: en hora de Perú (UTC-5) es el 1 de agosto.
      expect([31, 1]).toContain(fecha.getDate());
    });

    it('devuelve null con valores vacíos o inválidos', () => {
      expect(fechaLocal(null)).toBeNull();
      expect(fechaLocal('')).toBeNull();
      expect(fechaLocal('esto no es una fecha')).toBeNull();
    });
  });

  describe('ascensosDesdeColumnas', () => {
    it('reconstruye los eventos de los registros anteriores al detalle', () => {
      const eventos = ascensosDesdeColumnas({
        jefepractica: '2019-03-12',
        contratado: null,
        principal: '',
      });

      expect(eventos.length).toBe(1);
      expect(eventos[0]).toEqual(jasmine.objectContaining({
        categoriaPredocente: 'Jefe de práctica',
        linea: 'Predocente',
        fechaInicio: '2019-03-12',
      }));
    });

    it('devuelve [] si no hay valores', () => {
      expect(ascensosDesdeColumnas(null)).toEqual([]);
      expect(ascensosDesdeColumnas(undefined)).toEqual([]);
    });
  });

  describe('validarDocumento', () => {
    it('acepta PDF, Word e imágenes dentro del límite', () => {
      expect(validarDocumento({ name: 'resolucion.pdf', size: 1024 })).toBeNull();
      expect(validarDocumento({ name: 'resolucion.docx', size: 1024 })).toBeNull();
      expect(validarDocumento({ name: 'escaneo.JPG', size: 1024 })).toBeNull();
    });

    it('rechaza otros formatos y los archivos demasiado grandes', () => {
      expect(validarDocumento({ name: 'notas.txt', size: 10 })).toContain('Formato no permitido');
      expect(validarDocumento({ name: 'sin-extension', size: 10 })).toContain('Formato no permitido');
      expect(validarDocumento({ name: 'grande.pdf', size: MAX_DOCUMENTO_BYTES + 1 })).toContain('máximo');
      expect(validarDocumento(null)).toContain('No se seleccionó');
    });
  });

  describe('formatearTamano', () => {
    it('pasa los bytes a KB o MB', () => {
      expect(formatearTamano(0)).toBe('0 KB');
      expect(formatearTamano(350 * 1024)).toBe('350 KB');
      expect(formatearTamano(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('cuerpoDemasiadoGrande', () => {
    it('marca el envío cuando pasa del límite que acepta el backend', () => {
      expect(cuerpoDemasiadoGrande('x'.repeat(LIMITE_CUERPO_BYTES))).toBeFalse();
      expect(cuerpoDemasiadoGrande('x'.repeat(LIMITE_CUERPO_BYTES + 1))).toBeTrue();
    });

    it('los trozos de subida quedan por debajo de lo que acepta el backend (96 KB)', () => {
      expect(TAMANO_TROZO_BYTES).toBeLessThan(96 * 1024);
    });
  });

  describe('nombreDocumento', () => {
    it('genera un nombre seguro con la extensión original', () => {
      const nombre = nombreDocumento('20201234', 'Resolución N° 5 (marzo).PDF');

      expect(nombre).toMatch(/^cat-20201234-[a-z0-9]+\.pdf$/);
    });

    it('no repite nombres entre archivos del mismo docente', () => {
      const primero = nombreDocumento('1234', 'a.pdf');
      const segundo = nombreDocumento('1234', 'a.pdf');

      expect(primero).not.toBe(segundo);
    });

    it('descarta formatos no permitidos y códigos vacíos', () => {
      expect(nombreDocumento(null, 'notas.txt')).toMatch(/^cat-docente-[a-z0-9]+$/);
    });
  });
});
