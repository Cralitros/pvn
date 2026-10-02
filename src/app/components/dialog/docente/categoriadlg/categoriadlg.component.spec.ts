import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { CategoriadlgComponent } from './categoriadlg.component';
import { crearEventoVacio, TAMANO_TROZO_BYTES } from '../../../modelos/categoria-historico.util';
import { EventoCategoria } from '../../../modelos/categoria';

/** Evento con el detalle completo, que es lo que exige el guardado. */
function eventoCompleto(parcial: Partial<EventoCategoria> = {}): EventoCategoria {
  return {
    ...crearEventoVacio(),
    fechaInicio: '2019-03-12',
    tipoProceso: 'Ingreso',
    linea: 'Docente',
    departamento: 'Derecho',
    categoriaDocente: 'Contratado',
    modalidadIngreso: 'Entrevista',
    dedicacion: 'TC',
    ...parcial,
  };
}

describe('CategoriadlgComponent', () => {
  let component: CategoriadlgComponent;
  let fixture: ComponentFixture<CategoriadlgComponent>;
  let httpMock: HttpTestingController;
  let dialogRef: { close: jasmine.Spy };

  beforeEach(async () => {
    dialogRef = { close: jasmine.createSpy('close') };
    spyOn(Swal, 'fire').and.resolveTo({} as never);

    await TestBed.configureTestingModule({
      imports: [CategoriadlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 0, valores: { laboral: [{ codigo: '1234' }] } } },
        { provide: MatDialogRef, useValue: dialogRef },
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CategoriadlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Catálogos que pide el diálogo al abrirse.
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
  });

  afterEach(() => {
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no cierra el diálogo hasta que el guardado responde', () => {
    component.agregarFilaEvento(eventoCompleto());

    component.add_grado();

    // El bug original: había un close() aquí mismo, antes de que la API
    // contestara, así que la tabla recargaba sin ver el registro nuevo.
    expect(dialogRef.close).not.toHaveBeenCalled();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.flush({ id: '1' });

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('guarda el detalle de cada evento en `categoria` y deriva las columnas h*', () => {
    component.agregarFilaEvento(eventoCompleto({
      linea: 'Predocente',
      categoriaPredocente: 'Jefe de práctica',
      categoriaDocente: '',
      fechaInicio: '2019-03-12',
    }));
    component.agregarFilaEvento(eventoCompleto({
      fechaInicio: '2021-08-01',
      fechaFin: '2024-07-31',
      tipoProceso: 'Promoción',
      categoriaDocente: 'Contratado',
      modalidadIngreso: 'Evaluación',
      dedicacion: 'TPC',
    }));

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    const cuerpo = guardado.request.body;
    const eventos = JSON.parse(cuerpo.categoria);

    expect(eventos.length).toBe(2);
    // Las fechas se comparan con `new Date(año, mes, día)` (medianoche local): el
    // formulario interpreta así los valores guardados, para no mostrar el día
    // anterior cuando la fecha viene sin hora.
    expect(eventos[0]).toEqual(jasmine.objectContaining({
      seleccionada: true,
      fechaInicio: new Date(2019, 2, 12).toISOString(),
      tipoProceso: 'Ingreso',
      linea: 'Predocente',
      departamento: 'Derecho',
      categoriaPredocente: 'Jefe de práctica',
      modalidadIngreso: 'Entrevista',
      dedicacion: 'TC',
    }));
    expect(eventos[1].fechaFin).toBe(new Date(2024, 6, 31).toISOString());
    expect(eventos[1].tipoProceso).toBe('Promoción');

    expect(cuerpo.hJefePract).toBe(new Date(2019, 2, 12).toISOString());
    expect(cuerpo.hContratado).toBe(new Date(2021, 7, 1).toISOString());
    expect(cuerpo.hPrincipal).toBeNull();

    // «Fecha contrato» es la fecha de inicio más reciente.
    expect((cuerpo.fecha as Date).getFullYear()).toBe(2021);

    guardado.flush({ id: '1' });
  });

  it('guarda un evento aunque le falten campos del detalle', () => {
    component.agregarFilaEvento(eventoCompleto({
      tipoProceso: '',
      departamento: '',
      modalidadIngreso: '',
      dedicacion: '',
    }));

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    const eventos = JSON.parse(guardado.request.body.categoria);

    expect(eventos.length).toBe(1);
    expect(eventos[0].tipoProceso).toBe('');
    expect(eventos[0].categoriaDocente).toBe('Contratado');

    guardado.flush({ id: '1' });
  });

  it('guarda un evento con sólo la categoría, sin fecha de inicio', () => {
    component.agregarFilaEvento(crearEventoVacio());
    component.eventosArray.at(0).get('categoriaDocente')?.setValue('Auxiliar');

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    const eventos = JSON.parse(guardado.request.body.categoria);

    expect(eventos.length).toBe(1);
    expect(eventos[0].fechaInicio).toBeNull();
    expect(guardado.request.body.hAuxiliar).toBeNull();

    guardado.flush({ id: '1' });
  });

  it('rechaza una fecha de fin anterior a la de inicio', () => {
    component.agregarFilaEvento(eventoCompleto({
      fechaInicio: '2021-08-01',
      fechaFin: '2019-03-12',
    }));

    component.add_grado();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Revisa las fechas' }));
    httpMock.expectNone(peticion => peticion.method === 'POST');
  });

  it('descarta las filas que quedaron sin llenar', () => {
    component.agregarFilaEvento();
    component.agregarFilaEvento(eventoCompleto());

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    expect(JSON.parse(guardado.request.body.categoria).length).toBe(1);

    guardado.flush({ id: '1' });
  });

  it('al cambiar la línea limpia la categoría de la otra línea', () => {
    component.agregarFilaEvento(eventoCompleto({ linea: 'Docente', categoriaDocente: 'Auxiliar' }));

    component.eventosArray.at(0).get('linea')?.setValue('Predocente');
    component.onLineaChange(0);

    expect(component.eventosArray.at(0).get('categoriaDocente')?.value).toBe('');
  });

  it('no vacía la fecha de contrato cuando el histórico no tiene fechas', () => {
    const contrato = new Date('2020-05-20');
    component.formularioCategoria.get('fecha')?.setValue(contrato);

    // Fila con datos pero sin fecha de inicio: es válida (el detalle es
    // opcional) y no debe borrar la fecha que ya tenía el registro.
    component.agregarFilaEvento(crearEventoVacio());
    component.eventosArray.at(0).get('categoriaDocente')?.setValue('Auxiliar');

    expect(component.formularioCategoria.get('fecha')?.value).toEqual(contrato);
  });

  it('si el guardado falla, avisa y NO cierra el diálogo', () => {
    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(Swal.fire).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();

    // El aviso ya no es genérico: dice qué contestó el servidor y cuánto pesa el
    // histórico, que es lo que permite distinguir el problema de tamaño.
    const aviso = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(aviso.title).toContain('No se pudo guardar');
    expect(aviso.text).toContain('500');
    expect(aviso.text).toContain('boom');
  });

  it('si el servidor rechaza el tamaño de un documento antiguo, lo explica', () => {
    component.agregarFilaEvento(eventoCompleto());

    // Documento del formato viejo: el base64 viaja dentro del JSON y sigue
    // sujeto al corte de 128 KB (los nuevos se suben por trozos).
    component.eventosArray.at(0).get('documento')?.setValue({
      nombre: 'resolucion.pdf',
      tipo: 'application/pdf',
      tamano: 120 * 1024,
      dataUrl: `data:application/pdf;base64,${'A'.repeat(120 * 1024)}`,
    });

    component.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.flush({ message: 'Payload Too Large' }, { status: 413, statusText: 'Payload Too Large' });

    const aviso = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(aviso.text).toContain('413');
    expect(aviso.text).toContain('Payload Too Large');
    expect(aviso.text).toContain('supera los');
  });

  it('explica que la conexión se cortó cuando la petición no recibe respuesta', () => {
    component.agregarFilaEvento(eventoCompleto());

    // Con un documento antiguo (base64) en el evento: el aviso debe decir que el
    // cuerpo lo lleva dentro.
    component.eventosArray.at(0).get('documento')?.setValue({
      nombre: 'resolucion.pdf',
      tipo: 'application/pdf',
      tamano: 12,
      dataUrl: 'data:application/pdf;base64,JVBERi0=',
    });

    component.add_grado();

    // Lo que devuelve el navegador cuando el servidor corta la conexión: estado
    // 0 y sin mensaje. Antes el aviso salía sin ninguna pista.
    const guardado = httpMock.expectOne(peticion => peticion.method === 'POST');
    guardado.error(new ProgressEvent('error'));

    const aviso = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(aviso.text).toContain('sin respuesta');
    expect(aviso.text).toContain('documento antiguo en base64');
  });

  describe('documento adjunto (subida por trozos)', () => {
    /** Simula elegir un archivo en el `input type="file"` de una fila. */
    function elegirArchivo(componente: CategoriadlgComponent, index: number, archivo: File): Promise<void> {
      const input = { files: [archivo], value: 'C:\\fakepath\\x' };

      return componente.onDocumentoSeleccionado({ target: input } as unknown as Event, index);
    }

    it('sube el archivo por trozos y guarda sólo la referencia', async () => {
      component.agregarFilaEvento(eventoCompleto());

      // 300 KB con trozos de 64 KB son 5 peticiones.
      const archivo = new File([new Uint8Array(300 * 1024)], 'resolucion.pdf', { type: 'application/pdf' });
      const subida = elegirArchivo(component, 0, archivo);

      for (const indice of [0, 1, 2, 3, 4]) {
        const trozo = httpMock.expectOne(peticion => peticion.method === 'POST' && peticion.url.includes('/documento/'));

        expect(trozo.request.params.get('indice')).toBe(String(indice));
        expect(trozo.request.body instanceof Blob).toBeTrue();

        if (indice === 0) {
          expect((trozo.request.body as Blob).size).toBe(TAMANO_TROZO_BYTES);
        }

        trozo.flush({ bytes: 0 });

        // El siguiente trozo se pide cuando se resuelve la promesa del anterior.
        await new Promise(resolve => setTimeout(resolve));
      }

      await subida;

      const documento = component.documentoDe(0);
      expect(documento?.nombre).toBe('resolucion.pdf');
      expect(documento?.archivo).toMatch(/^cat-1234-[a-z0-9]+\.pdf$/);
      // El archivo ya no viaja dentro del JSON: eso es lo que rompía el guardado.
      expect(documento?.dataUrl).toBeUndefined();
      expect(component.subiendoEn(0)).toBeFalse();
    });

    it('avisa y no deja el documento si la subida falla', async () => {
      component.agregarFilaEvento(eventoCompleto());

      const archivo = new File([new Uint8Array(10 * 1024)], 'resolucion.pdf', { type: 'application/pdf' });
      const subida = elegirArchivo(component, 0, archivo);

      const peticion = httpMock.expectOne(peticion => peticion.method === 'POST' && peticion.url.includes('/documento/'));
      peticion.flush({ mensaje: 'boom' }, { status: 500, statusText: 'Server Error' });

      await subida;

      // Limpieza del trozo que sí llegó al servidor.
      httpMock.expectOne(peticion => peticion.method === 'DELETE').flush({});

      expect(component.documentoDe(0)).toBeNull();
      expect(Swal.fire).toHaveBeenCalled();
      const aviso = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
      expect(aviso.title).toBe('No se pudo adjuntar');
    });

    it('borra del servidor el documento al quitarlo de la fila', async () => {
      component.agregarFilaEvento(eventoCompleto());

      const archivo = new File([new Uint8Array(1024)], 'resolucion.pdf', { type: 'application/pdf' });
      const subida = elegirArchivo(component, 0, archivo);
      httpMock.expectOne(peticion => peticion.method === 'POST').flush({});
      await subida;

      component.quitarDocumento(0);

      const borrado = httpMock.expectOne(peticion => peticion.method === 'DELETE');
      expect(borrado.request.url).toContain('/documento/');
      borrado.flush({});

      expect(component.documentoDe(0)).toBeNull();
    });

    it('borra los documentos subidos y no guardados al cancelar', async () => {
      component.agregarFilaEvento(eventoCompleto());

      const archivo = new File([new Uint8Array(1024)], 'resolucion.pdf', { type: 'application/pdf' });
      const subida = elegirArchivo(component, 0, archivo);
      httpMock.expectOne(peticion => peticion.method === 'POST').flush({});
      await subida;

      component.onNoClick();

      httpMock.expectOne(peticion => peticion.method === 'DELETE').flush({});
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('no borra el documento si el registro se guardó', async () => {
      component.agregarFilaEvento(eventoCompleto());

      const archivo = new File([new Uint8Array(1024)], 'resolucion.pdf', { type: 'application/pdf' });
      const subida = elegirArchivo(component, 0, archivo);
      httpMock.expectOne(peticion => peticion.method === 'POST' && peticion.url.includes('/documento/')).flush({});
      await subida;

      component.add_grado();
      httpMock.expectOne(peticion => peticion.method === 'POST' && !peticion.url.includes('/documento/')).flush({ id: '1' });

      component.onNoClick();

      // Ya está referenciado por el registro: no se toca.
      httpMock.expectNone(peticion => peticion.method === 'DELETE');
    });
  });
});

describe('CategoriadlgComponent en modo edición', () => {
  let httpMock: HttpTestingController;

  /** Valores mínimos que `poner_datos` espera de la fila de la tabla. */
  const registroBase = {
    id: '1',
    tipo: 'Nuevo',
    fecha: '2021-08-01',
    condiciondap: 'Activo',
    codigoDocente: '1234',
    dedicacion: 'TC',
    labor: 'Si',
    categoriadap: 'Contratado',
    ratificado: '',
  };

  /** Monta el diálogo con un registro ya guardado y devuelve el componente. */
  async function crearConRegistro(valores: Record<string, any>): Promise<CategoriadlgComponent> {
    spyOn(Swal, 'fire').and.resolveTo({} as never);

    await TestBed.configureTestingModule({
      imports: [CategoriadlgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { modo: 1, valores } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(CategoriadlgComponent);
    fixture.detectChanges();
    httpMock.match(() => true).forEach(peticion => peticion.flush([]));

    return fixture.componentInstance;
  }

  it('carga los eventos guardados en la columna `categoria`', async () => {
    const componente = await crearConRegistro({
      ...registroBase,
      categoria: JSON.stringify([
        eventoCompleto({ fechaInicio: '2019-03-12', tipoProceso: 'Ingreso' }),
        eventoCompleto({ fechaInicio: '2021-08-01', tipoProceso: 'Promoción', categoriaDocente: 'Asociado' }),
      ]),
    });

    expect(componente.eventosArray.length).toBe(2);
    expect(componente.eventosArray.at(1).get('categoriaDocente')?.value).toBe('Asociado');
    expect(componente.eventosArray.at(1).get('tipoProceso')?.value).toBe('Promoción');
  });

  it('reconstruye el histórico de los registros anteriores desde las columnas h*', async () => {
    const componente = await crearConRegistro({
      ...registroBase,
      // Registro antiguo: la lista JSON viene vacía y sólo hay columnas h*.
      categoria: '',
      jefepractica: '2019-03-12',
    });

    expect(componente.eventosArray.length).toBe(1);
    expect(componente.eventosArray.at(0).get('categoriaPredocente')?.value).toBe('Jefe de práctica');
    expect(componente.eventosArray.at(0).get('linea')?.value).toBe('Predocente');
  });

  it('no repite un evento que ya viene en la lista JSON y en las columnas h*', async () => {
    const componente = await crearConRegistro({
      ...registroBase,
      categoria: JSON.stringify([eventoCompleto({ categoriaDocente: 'Contratado', fechaInicio: '2021-08-01' })]),
      contratado: '2021-08-01',
    });

    expect(componente.eventosArray.length).toBe(1);
  });

  it('conserva la fecha de contrato del registro cuando el histórico viene vacío', async () => {
    const componente = await crearConRegistro({ ...registroBase, categoria: '' });

    // Antes se escribía `null` en «Fecha contrato» al no haber fechas en el
    // histórico, y el guardado lo rechazaba. La fecha se lee como local, así que
    // el 1 de agosto del registro no se convierte en el 31 de julio.
    expect(componente.formularioCategoria.get('fecha')?.value).toEqual(new Date(2021, 7, 1));
  });

  it('envía el documento antiguo (base64) dentro del JSON del evento', async () => {
    const componente = await crearConRegistro({ ...registroBase, categoria: '' });
    componente.agregarFilaEvento(eventoCompleto({ fechaInicio: '2021-08-01' }));

    const documento = {
      nombre: 'resolucion.pdf',
      tipo: 'application/pdf',
      tamano: 12,
      dataUrl: 'data:application/pdf;base64,JVBERi0=',
    };
    componente.eventosArray.at(0).get('documento')?.setValue(documento);

    componente.add_grado();

    const guardado = httpMock.expectOne(peticion => peticion.method === 'PUT');

    // La actualización va al código del docente (no al id del registro) y el
    // documento viaja dentro de `categoria`, como string.
    expect(guardado.request.url).toContain('/docentescategoria/1234');
    expect(typeof guardado.request.body.categoria).toBe('string');

    const eventos = JSON.parse(guardado.request.body.categoria);
    expect(eventos[0].documento).toEqual(documento);

    guardado.flush({ id: '1' });
  });
});
