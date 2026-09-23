import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

// Mismo registro de locale que hace la aplicación en `app.config.ts`. Si se
// quitara de allí, estas pruebas empezarían a fallar con NG0701 y avisarían
// del problema antes de que llegue al navegador.
import '../../core/i18n/locale-es-pe';

import { DashboardComponent, CLAVE_ORGANIGRAMA, olvidarCacheTotales } from './dashboard.component';

/** Totales simulados. Cualquier tabla ausente responde 1 para que haya datos. */
const TOTALES: Record<string, number> = {
  docentes: 100,
  docenteslaboral: 50,
  docentesgrado: 80,
  docentescategoria: 20,
  docentesinvestiga: 10,
  docentescurso: 90,
  docentesinfo: 40,
  curso: 300,
};

/** Deja avanzar los `await` internos del componente. */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('DashboardComponent', () => {
  beforeEach(() => {
    // Cada caso parte de una caché vacía: si no, el segundo test no lanzaría
    // ninguna petición y `httpMock.match()` no encontraría nada que responder.
    olvidarCacheTotales();

    // Y de una preferencia limpia: el organigrama se recuerda en localStorage,
    // así que un test podría dejar "oculto" y condicionar al siguiente.
    localStorage.removeItem(CLAVE_ORGANIGRAMA);
  });

  async function crear(opciones: { fallar?: string } = {}) {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        // El mismo LOCALE_ID que la aplicación: sin él, la prueba no
        // reproducía el fallo real del panel.
        { provide: LOCALE_ID, useValue: 'es-PE' },
      ],
    }).compileComponents();

    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    // Las 21 consultas `{recurso}/total` del panel.
    httpMock.match(peticion => peticion.url.endsWith('/total')).forEach(peticion => {
      const recurso = peticion.request.url.split('/').slice(-2)[0];

      if (recurso === opciones.fallar) {
        peticion.flush({ mensaje: 'boom' }, { status: 500, statusText: 'Server Error' });
        return;
      }

      peticion.flush({ total: TOTALES[recurso] ?? 1 });
    });

    await tick();
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, httpMock };
  }

  it('should compile', async () => {
    const { component } = await crear();
    expect(component).toBeTruthy();
  });

  it('consulta el total de las 21 tablas del panel', async () => {
    const { component } = await crear();
    expect(component.tablas.length).toBe(21);
    expect(component.kpis()[0].total).toBe(100);
  });

  it('calcula la completitud de cada bloque contra el total de docentes', async () => {
    const { component } = await crear();

    const bloques = component.coberturaBloques();
    const buscar = (recurso: string) => bloques.find(bloque => bloque.recurso === recurso)!;

    expect(buscar('docenteslaboral').porcentaje).toBe(50);
    expect(buscar('docentesgrado').porcentaje).toBe(80);
    expect(buscar('docentescurso').porcentaje).toBe(90);

    // (50 + 80 + 20 + 10 + 90 + 40) / 6 = 48,33 → 48
    expect(component.cobertura()).toBe(48);
  });

  it('acota la completitud al 100% cuando hay más registros que docentes', async () => {
    // 150 cursos asignados sobre 100 docentes: histórico, no un 150%.
    TOTALES['docentescurso'] = 150;

    try {
      const { component } = await crear();
      const bloque = component.coberturaBloques().find(item => item.recurso === 'docentescurso')!;
      expect(bloque.porcentaje).toBe(100);
    } finally {
      TOTALES['docentescurso'] = 90;
    }
  });

  it('ordena el ranking de mayor a menor volumen', async () => {
    const { component } = await crear();

    const ranking = component.ranking();
    expect(ranking[0].recurso).toBe('curso');
    expect(ranking[0].total).toBe(300);

    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].total).toBeGreaterThanOrEqual(ranking[i].total);
    }
  });

  it('avisa cuando una tabla falla en lugar de mostrar un 0 como dato real', async () => {
    const { component } = await crear({ fallar: 'curso' });

    expect(component.error()).toContain('1 de 21');
    expect(component.valorDe('curso')).toBe(0);
  });

  it('cada tarjeta enlaza con su sección del panel', async () => {
    const { fixture } = await crear();

    const celdas = Array.from(fixture.nativeElement.querySelectorAll('a.celda')) as HTMLAnchorElement[];
    expect(celdas.length).toBe(21);

    const enlaceDe = (etiqueta: string) => {
      const celda = celdas.find(item => item.querySelector('.celda__nombre')?.textContent?.trim() === etiqueta);
      return celda!.getAttribute('href');
    };

    expect(enlaceDe('Cursos')).toBe('/dashboard/curso');
    expect(enlaceDe('Cursos asignados')).toBe('/dashboard/cursoDocentes');
    expect(enlaceDe('Info. laboral')).toBe('/dashboard/laboral');
  });

  it('pinta el panel completo de una sola pasada (regresión NG0701)', async () => {
    const { fixture } = await crear();
    const nativo: HTMLElement = fixture.nativeElement;

    // Cuando faltaban los datos del locale, DatePipe/DecimalPipe lanzaban
    // NG0701 y el change detection se abortaba a media plantilla: las barras
    // aparecían sin etiquetas, el grid quedaba vacío y el contador salía sin
    // cifra. El contenido solo se completaba al provocar nuevos ciclos.
    expect(nativo.querySelectorAll('a.celda').length).toBe(21);

    const leyenda = Array.from(nativo.querySelectorAll('.leyenda li')) as HTMLElement[];
    expect(leyenda.length).toBe(6);
    expect(leyenda.every(fila => (fila.querySelector('.leyenda__nombre')?.textContent ?? '').trim() !== ''))
      .withContext('cada fila de la leyenda muestra su etiqueta')
      .toBeTrue();
    expect(leyenda.every(fila => /\d+%/.test(fila.querySelector('.leyenda__cifra')?.textContent ?? '')))
      .withContext('cada fila de la leyenda muestra su porcentaje')
      .toBeTrue();

    const barras = Array.from(nativo.querySelectorAll('.barra__valor')) as HTMLElement[];
    expect(barras.length).toBeGreaterThan(0);
    expect(barras.every(barra => /\d/.test(barra.textContent ?? '')))
      .withContext('el ranking muestra sus cifras')
      .toBeTrue();

    expect(nativo.querySelector('.contador')?.textContent ?? '')
      .withContext('el contador de tablas incluye la cifra')
      .toMatch(/\d/);
    expect(nativo.querySelector('.sello')?.textContent ?? '')
      .withContext('la fecha de actualización se formatea')
      .toMatch(/\d{2}:\d{2}/);
  });

  it('muestra el organigrama sin necesidad de pulsar ningún botón', async () => {
    const { fixture } = await crear();

    // Regresión: antes arrancaba oculto y la información no aparecía hasta
    // pulsar "Mostrar".
    expect(fixture.nativeElement.querySelector('app-orga')).not.toBeNull();
  });

  it('oculta el organigrama solo si el usuario lo pide, y lo recuerda', async () => {
    const { fixture, component } = await crear();

    component.alternarOrganigrama();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-orga')).toBeNull();
    expect(localStorage.getItem(CLAVE_ORGANIGRAMA)).toBe('oculto');

    // Vuelve a mostrarse al pulsar otra vez.
    component.alternarOrganigrama();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-orga')).not.toBeNull();
    expect(localStorage.getItem(CLAVE_ORGANIGRAMA)).toBe('visible');
  });
});
