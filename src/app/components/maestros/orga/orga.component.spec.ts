import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrgaComponent, construirOrganigrama } from './orga.component';
import { Usuario } from '../../modelos/usuario';

/** Deja avanzar los `await` internos del componente. */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

/** Usuario de prueba: rellena la contraseña, que el modelo exige. */
function usuario(datos: Partial<Usuario> & { dni: string }): Usuario {
  return { password: '', ...datos };
}

const USUARIOS: Usuario[] = [
  usuario({ dni: '11111111', nivel: '1', rol: 'Administrador', nombres: 'Ana', apellidos: 'López' }),
  usuario({ dni: '22222222', nivel: '2', rol: 'Data entry', nombres: 'Luis', apellidos: 'Gómez' }),
  usuario({ dni: '33333333', nivel: '2', rol: 'Lector', nombres: 'María', apellidos: 'Ruiz' }),
  usuario({ dni: '44444444', nivel: '3', rol: 'Lector' }),
  usuario({ dni: '55555555' }),
];

describe('construirOrganigrama', () => {
  it('no arma nada si no hay usuarios', () => {
    expect(construirOrganigrama(null)).toBeNull();
    expect(construirOrganigrama(undefined)).toBeNull();
    expect(construirOrganigrama([])).toBeNull();
  });

  it('agrupa por nivel de acceso, en orden y con los sin nivel al final', () => {
    const raiz = construirOrganigrama(USUARIOS)!;

    expect(raiz.name).toBe('Usuarios del sistema');
    expect(raiz.title).toBe('5 usuarios');

    expect(raiz.children!.map(nivel => nivel.name)).toEqual([
      'Nivel 1 · Acceso total',
      'Nivel 2 · Tablas y reportes',
      'Nivel 3 · Reportes',
      'Sin nivel asignado',
    ]);
  });

  it('rotula cada usuario con su rol y pone el nombre debajo', () => {
    const raiz = construirOrganigrama(USUARIOS)!;
    const nivel1 = raiz.children![0];

    expect(nivel1.title).toBe('1 usuario');
    expect(nivel1.children).toEqual([
      jasmine.objectContaining({ name: 'Administrador', title: 'Ana López' }),
    ]);

    const nivel2 = raiz.children![1];
    expect(nivel2.title).toBe('2 usuarios');
    expect(nivel2.children!.map(usuario => usuario.name)).toEqual(['Data entry', 'Lector']);
  });

  it('usa el cargo si no hay rol, y el DNI si no hay nombre', () => {
    const raiz = construirOrganigrama([
      usuario({ dni: '1', nivel: '1', cargo: 'Secretaria' }),
      usuario({ dni: '2', nivel: '1' }),
    ])!;

    const usuarios = raiz.children![0].children!;

    expect(usuarios[0]).toEqual(jasmine.objectContaining({ name: 'Secretaria', title: '1' }));
    expect(usuarios[1]).toEqual(jasmine.objectContaining({ name: 'Sin rol', title: '2' }));
  });

  it('nunca deja un nodo sin texto', () => {
    const raiz = construirOrganigrama([usuario({ dni: '', rol: '  ', nombres: '  ' })])!;
    const nodo = raiz.children![0].children![0];

    expect(nodo.name).toBe('Sin rol');
    expect(nodo.title).toBe('Sin nombre');
  });

  it('ignora entradas nulas', () => {
    const raiz = construirOrganigrama([null as any, USUARIOS[0]])!;

    expect(raiz.title).toBe('1 usuario');
    expect(raiz.children!.length).toBe(1);
  });
});

describe('OrgaComponent', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [OrgaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(OrgaComponent);
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, httpMock };
  }

  it('pide los usuarios de la API y pinta el organigrama', async () => {
    const { fixture, component, httpMock } = await crear();

    // Mientras carga avisa, y no deja el hueco en blanco.
    expect(component.cargando()).toBeTrue();

    httpMock.expectOne(peticion => peticion.url.endsWith('/login')).flush(USUARIOS);
    await tick();
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.error()).toBeNull();
    expect(component.raiz()?.title).toBe('5 usuarios');
    expect(fixture.nativeElement.querySelector('app-organigrama')).not.toBeNull();
  });

  it('avisa si la tabla de usuarios está vacía', async () => {
    const { fixture, component, httpMock } = await crear();

    httpMock.expectOne(() => true).flush([]);
    await tick();
    fixture.detectChanges();

    expect(component.raiz()).toBeNull();
    expect(component.error()).toContain('vacía');
    expect(fixture.nativeElement.querySelector('app-organigrama')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('vacía');
  });

  it('avisa si la petición falla, en lugar de quedarse cargando', async () => {
    const { fixture, component, httpMock } = await crear();

    httpMock.expectOne(() => true).flush({ mensaje: 'boom' }, { status: 500, statusText: 'Server Error' });
    await tick();
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.raiz()).toBeNull();
    expect(component.error()).toContain('No se pudieron cargar');
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar');
  });
});
