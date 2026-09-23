import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/**
 * Comprueba que las convenciones de diálogo definidas en `src/styles.scss`
 * (título, cuerpo, secciones, rejillas y botón) llegan de verdad al DOM.
 *
 * Importa porque están acotadas con `mat-dialog-container`: si ese selector no
 * fuera el correcto, los diálogos se quedarían sin relleno, márgenes ni
 * rejilla, que es justo el síntoma de «se ve raro, sin márgenes ni padding».
 * Karma carga `src/styles.scss` (está en el target `test` de angular.json), así
 * que aquí se mide el resultado real.
 */
@Component({
  standalone: true,
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title"><span class="title-accent"></span>Título</h2>

      <div class="docente-info">Docente: Prueba</div>

      <div class="tab-form">
        <div class="form-section">
          <span class="section-title">Sección</span>
          <div class="grid-2"><span>a</span><span>b</span></div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn-nav">Guardar</button>
      </div>
    </div>
  `,
})
class DialogoDePrueba {}

describe('Convenciones de diálogo (styles.scss)', () => {
  async function abrir() {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, DialogoDePrueba],
      providers: [provideNoopAnimations()],
    });

    const dialog = TestBed.inject(MatDialog);
    const referencia = dialog.open(DialogoDePrueba);

    await new Promise<void>(resolver => referencia.afterOpened().subscribe(() => resolver()));
    TestBed.inject(ApplicationRef).tick();

    return referencia;
  }

  const dentro = (selector: string) =>
    document.querySelector(`mat-dialog-container ${selector}`) as HTMLElement | null;

  it('el contenedor del diálogo se coloca en columna y ocupa el alto', async () => {
    const referencia = await abrir();

    const contenedor = dentro('.dialog-container')!;
    expect(contenedor).not.toBeNull();

    const estilo = getComputedStyle(contenedor);
    expect(estilo.display).toBe('flex');
    expect(estilo.flexDirection).toBe('column');
    expect(estilo.overflow).toBe('hidden');

    referencia.close();
  });

  it('el título lleva margen, subrayado y barra de acento', async () => {
    const referencia = await abrir();

    const titulo = dentro('.dialog-title')!;
    const estilo = getComputedStyle(titulo);

    expect(estilo.display).toBe('flex');
    expect(estilo.marginLeft).toBe('16px');
    expect(estilo.marginBottom).toBe('2px');
    expect(estilo.paddingBottom).toBe('8px');
    expect(estilo.borderBottomWidth).toBe('2px');
    expect(estilo.fontWeight).toBe('600');

    const acento = dentro('.title-accent')!;
    const estiloAcento = getComputedStyle(acento);
    expect(estiloAcento.width).toBe('5px');
    expect(estiloAcento.height).toBe('20px');

    referencia.close();
  });

  it('el cuerpo del formulario tiene relleno y desplazamiento propio', async () => {
    const referencia = await abrir();

    const cuerpo = dentro('.tab-form')!;
    const estilo = getComputedStyle(cuerpo);

    expect(estilo.paddingTop).toBe('8px');
    expect(estilo.paddingLeft).toBe('14px');
    expect(estilo.overflowY).toBe('auto');

    referencia.close();
  });

  it('la sección tiene relleno, borde y su rótulo', async () => {
    const referencia = await abrir();

    const seccion = dentro('.form-section')!;
    expect(seccion).not.toBeNull();

    const estilo = getComputedStyle(seccion);
    expect(estilo.paddingTop).toBe('8px');
    expect(estilo.paddingRight).toBe('12px');
    expect(estilo.marginBottom).toBe('8px');
    expect(estilo.borderTopStyle).toBe('solid');
    expect(estilo.borderTopLeftRadius).toBe('6px');

    const rotulo = dentro('.form-section .section-title')!;
    const estiloRotulo = getComputedStyle(rotulo);
    expect(estiloRotulo.textTransform).toBe('uppercase');
    expect(estiloRotulo.fontWeight).toBe('700');

    referencia.close();
  });

  it('la rejilla de dos columnas se aplica', async () => {
    const referencia = await abrir();

    const rejilla = dentro('.grid-2')!;
    const estilo = getComputedStyle(rejilla);

    expect(estilo.display).toBe('grid');
    expect(estilo.columnGap).toBe('10px');

    referencia.close();
  });

  it('la franja del docente lleva su margen, su relleno y su borde de acento', async () => {
    const referencia = await abrir();

    const franja = dentro('.docente-info')!;
    expect(franja).not.toBeNull();

    const estilo = getComputedStyle(franja);
    expect(estilo.marginLeft).toBe('16px');
    expect(estilo.marginTop).toBe('8px');
    expect(estilo.paddingLeft).toBe('16px');
    expect(estilo.borderLeftWidth).toBe('4px');
    expect(estilo.fontWeight).toBe('500');

    referencia.close();
  });

  it('la barra de acciones se separa del contenido y alinea a la derecha', async () => {
    const referencia = await abrir();

    const acciones = dentro('.dialog-actions')!;
    const estilo = getComputedStyle(acciones);

    expect(estilo.display).toBe('flex');
    expect(estilo.justifyContent).toBe('flex-end');
    expect(estilo.marginTop).toBe('20px');
    expect(estilo.paddingTop).toBe('12px');
    expect(estilo.borderTopStyle).toBe('solid');

    referencia.close();
  });
});
