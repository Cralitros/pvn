import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService, Recurso, RECURSOS } from '../../core/api';
import { OrgaComponent } from '../maestros/orga/orga.component';

/** Agrupación visual de una tabla dentro del panel. */
type Familia = 'maestros' | 'docentes';

/** Una tabla del sistema y cómo se pinta en el panel. */
interface TablaPanel {
  readonly recurso: Recurso;
  readonly etiqueta: string;
  readonly icono: string;
  /** Segmento de ruta bajo `/dashboard`. */
  readonly ruta: string;
  readonly familia: Familia;
}

/** Tarjeta grande de la cabecera. */
interface KpiPanel {
  readonly recurso: Recurso;
  readonly etiqueta: string;
  readonly icono: string;
  readonly ruta: string;
  readonly acento: string;
  readonly pie: string;
  readonly total: number;
}

/** Bloque de información docente medido contra el total de docentes. */
interface BloqueCobertura {
  readonly recurso: Recurso;
  readonly etiqueta: string;
  readonly icono: string;
  readonly total: number;
  readonly porcentaje: number;
}

/** Fila del ranking de volumen. */
interface FilaRanking {
  readonly recurso: Recurso;
  readonly etiqueta: string;
  readonly icono: string;
  readonly total: number;
  readonly porcentaje: number;
}

/**
 * Catálogo de tablas del panel.
 *
 * Sustituye a los dos arreglos paralelos del dashboard anterior, donde la
 * plantilla emparejaba `maestros[i]` con `valores[i]` por índice: bastaba con
 * insertar un recurso en medio para que todos los números quedaran bajo la
 * etiqueta equivocada, sin que TypeScript dijera nada.
 *
 * Los iconos también se corrigieron: el mapa anterior usaba claves como
 * `'cursos'` o `'facultades'` que no coinciden con ningún valor de `RECURSOS`,
 * así que casi todas las tarjetas acababan mostrando el icono de reserva.
 */
const TABLAS: readonly TablaPanel[] = [
  // --- Información de docentes ---
  { recurso: RECURSOS.docentes, etiqueta: 'Docentes', icono: 'groups', ruta: 'personal', familia: 'docentes' },
  { recurso: RECURSOS.docentesLaboral, etiqueta: 'Info. laboral', icono: 'work_outline', ruta: 'laboral', familia: 'docentes' },
  { recurso: RECURSOS.docentesGrado, etiqueta: 'Grado académico', icono: 'school', ruta: 'grado', familia: 'docentes' },
  { recurso: RECURSOS.docentesCategoria, etiqueta: 'Categoría', icono: 'military_tech', ruta: 'categoria', familia: 'docentes' },
  { recurso: RECURSOS.docentesInvestigacion, etiqueta: 'Investigación', icono: 'science', ruta: 'investigador', familia: 'docentes' },
  { recurso: RECURSOS.docentesCurso, etiqueta: 'Cursos asignados', icono: 'class', ruta: 'cursoDocentes', familia: 'docentes' },
  { recurso: RECURSOS.docentesInfo, etiqueta: 'Info. docencia', icono: 'analytics', ruta: 'infoDocentes', familia: 'docentes' },

  // --- Maestros y gestión ---
  { recurso: RECURSOS.curso, etiqueta: 'Cursos', icono: 'menu_book', ruta: 'curso', familia: 'maestros' },
  { recurso: RECURSOS.programa, etiqueta: 'Escuelas y programas', icono: 'workspaces', ruta: 'programa', familia: 'maestros' },
  { recurso: RECURSOS.escuela, etiqueta: 'Deptos. académicos', icono: 'account_balance', ruta: 'escuela', familia: 'maestros' },
  { recurso: RECURSOS.facultad, etiqueta: 'Unidades académicas', icono: 'domain', ruta: 'facultad', familia: 'maestros' },
  { recurso: RECURSOS.plan, etiqueta: 'Planes académicos', icono: 'description', ruta: 'plan', familia: 'maestros' },
  { recurso: RECURSOS.area, etiqueta: 'Áreas', icono: 'view_comfy', ruta: 'area', familia: 'maestros' },
  { recurso: RECURSOS.login, etiqueta: 'Usuarios', icono: 'manage_accounts', ruta: 'usuarios', familia: 'maestros' },
  { recurso: RECURSOS.firma, etiqueta: 'Firmas', icono: 'draw', ruta: 'firma', familia: 'maestros' },
  { recurso: RECURSOS.bancos, etiqueta: 'Bancos', icono: 'savings', ruta: 'bancos', familia: 'maestros' },
  { recurso: RECURSOS.afps, etiqueta: 'AFPs', icono: 'shield', ruta: 'afps', familia: 'maestros' },
  { recurso: RECURSOS.nacionalidad, etiqueta: 'Nacionalidades', icono: 'flag', ruta: 'nacionalidad', familia: 'maestros' },
  { recurso: RECURSOS.departamentos, etiqueta: 'Departamentos', icono: 'location_city', ruta: 'departamento', familia: 'maestros' },
  { recurso: RECURSOS.provincias, etiqueta: 'Provincias', icono: 'map', ruta: 'provincia', familia: 'maestros' },
  { recurso: RECURSOS.distritos, etiqueta: 'Distritos', icono: 'location_on', ruta: 'distrito', familia: 'maestros' },
];

/** Tarjetas grandes: los cuatro totales que resumen el sistema. */
const KPIS: readonly Omit<KpiPanel, 'total'>[] = [
  { recurso: RECURSOS.docentes, etiqueta: 'Docentes', icono: 'groups', ruta: 'personal', acento: 'azul', pie: 'fichas registradas' },
  { recurso: RECURSOS.curso, etiqueta: 'Cursos', icono: 'menu_book', ruta: 'curso', acento: 'teal', pie: 'en el plan curricular' },
  { recurso: RECURSOS.programa, etiqueta: 'Escuelas y programas', icono: 'workspaces', ruta: 'programa', acento: 'violeta', pie: 'oferta académica' },
  { recurso: RECURSOS.firma, etiqueta: 'Firmas', icono: 'draw', ruta: 'firma', acento: 'ambar', pie: 'digitalizadas' },
];

/** Cuántas filas muestra el ranking de volumen. */
const FILAS_RANKING = 8;

/** Vigencia de la caché de totales: evita 21 peticiones en cada visita. */
const VIGENCIA_CACHE_MS = 60_000;

interface CacheTotales {
  readonly totales: Record<string, number>;
  readonly momento: number;
}

/**
 * Caché a nivel de módulo, no de componente: sobrevive al navegar a otra
 * sección y volver al panel. `null` significa "sin datos utilizables".
 */
let cacheTotales: CacheTotales | null = null;

/**
 * Descarta la caché de totales.
 *
 * La usan las pruebas para que cada caso parta de cero (sin esto, el primer
 * test dejaría la caché caliente y los siguientes no pedirían nada a la API,
 * dando por buenos datos que nunca se consultaron).
 */
export function olvidarCacheTotales(): void {
  cacheTotales = null;
}

/** Clave donde se recuerda si el organigrama quedó oculto. */
export const CLAVE_ORGANIGRAMA = 'dashboard.organigrama';

/**
 * Estado inicial del organigrama: visible salvo que el usuario lo haya
 * ocultado antes.
 *
 * `typeof localStorage === 'undefined'` cubre el renderizado en servidor, y el
 * `try` cubre los navegadores que lanzan al acceder al almacenamiento (modo
 * privado, cookies bloqueadas): en ambos casos se muestra, que es lo seguro.
 */
function leerPreferenciaOrganigrama(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(CLAVE_ORGANIGRAMA) !== 'oculto';
  } catch {
    return true;
  }
}

function guardarPreferenciaOrganigrama(visible: boolean): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_ORGANIGRAMA, visible ? 'visible' : 'oculto');
    }
  } catch {
    // Sin almacenamiento disponible solo se pierde la preferencia, nada más.
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    OrgaComponent,
  ],
})
export class DashboardComponent {
  private readonly api = inject(ApiService);

  /** Catálogo expuesto a la plantilla para el grid "Todas las tablas". */
  readonly tablas = TABLAS;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly ultimaActualizacion = signal<Date | null>(null);

  /**
   * El organigrama se muestra desde el primer render.
   *
   * Antes arrancaba oculto y había que pulsar "Mostrar" para verlo, así que la
   * información no aparecía hasta que el usuario interactuaba. Ahora solo se
   * oculta si él mismo lo pide, y esa decisión se recuerda entre visitas.
   */
  readonly organigramaVisible = signal(leerPreferenciaOrganigrama());

  /**
   * Progreso de la animación de entrada (0 → 1).
   *
   * Arranca en 1 para que el HTML renderizado en servidor muestre cifras
   * reales; el navegador lo baja a 0 y lo sube con `requestAnimationFrame`.
   */
  readonly progreso = signal(1);

  private readonly totales = signal<Record<string, number>>({});
  private enNavegador = false;
  private datosListos = false;

  readonly kpis = computed<KpiPanel[]>(() => {
    const totales = this.totales();
    return KPIS.map((kpi) => ({ ...kpi, total: totales[kpi.recurso] ?? 0 }));
  });

  /**
   * Cobertura de la ficha docente: cuántos docentes tienen cada bloque de
   * información registrado. Es el dato más accionable del panel, porque un
   * porcentaje bajo señala exactamente qué tabla falta cargar.
   */
  readonly coberturaBloques = computed<BloqueCobertura[]>(() => {
    const totales = this.totales();
    const docentes = totales[RECURSOS.docentes] ?? 0;

    return TABLAS.filter((tabla) => tabla.familia === 'docentes' && tabla.recurso !== RECURSOS.docentes).map(
      (tabla) => {
        const total = totales[tabla.recurso] ?? 0;
        // Se acota a 100: puede haber más registros que docentes (histórico).
        const porcentaje = docentes > 0 ? Math.min(100, Math.round((total / docentes) * 100)) : 0;
        return { recurso: tabla.recurso, etiqueta: tabla.etiqueta, icono: tabla.icono, total, porcentaje };
      },
    );
  });

  readonly cobertura = computed(() => {
    const bloques = this.coberturaBloques();
    if (bloques.length === 0) {
      return 0;
    }
    return Math.round(bloques.reduce((suma, bloque) => suma + bloque.porcentaje, 0) / bloques.length);
  });

  readonly ranking = computed<FilaRanking[]>(() => {
    const totales = this.totales();
    const filas = TABLAS.map((tabla) => ({
      recurso: tabla.recurso,
      etiqueta: tabla.etiqueta,
      icono: tabla.icono,
      total: totales[tabla.recurso] ?? 0,
    }));

    const maximo = Math.max(1, ...filas.map((fila) => fila.total));

    return filas
      .sort((a, b) => b.total - a.total)
      .slice(0, FILAS_RANKING)
      .map((fila) => ({ ...fila, porcentaje: Math.round((fila.total / maximo) * 100) }));
  });

  readonly totalGeneral = computed(() =>
    Object.values(this.totales()).reduce((suma, valor) => suma + valor, 0),
  );

  constructor() {
    // `afterNextRender` no se ejecuta en el servidor: la animación nunca
    // intenta tocar `requestAnimationFrame` durante el renderizado SSR.
    afterNextRender(() => {
      this.enNavegador = true;
      if (this.datosListos) {
        this.animarEntrada();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
    this.datosListos = true;
    if (this.enNavegador) {
      this.animarEntrada();
    }
  }

  /** Fuerza una consulta nueva ignorando la caché. */
  async recargar(): Promise<void> {
    await this.cargar(true);
    this.datosListos = true;
    if (this.enNavegador) {
      this.animarEntrada();
    }
  }

  alternarOrganigrama(): void {
    this.organigramaVisible.update((visible) => {
      guardarPreferenciaOrganigrama(!visible);
      return !visible;
    });
  }

  /** Cifra animada de una tarjeta, el ranking o el grid de tablas. */
  valorAnimado(valor: number): number {
    return Math.round(valor * this.progreso());
  }

  valorDe(recurso: Recurso): number {
    return this.totales()[recurso] ?? 0;
  }

  coberturaAnimada(): number {
    return Math.round(this.cobertura() * this.progreso());
  }

  /** Anillo de progreso del donut, con el tramo lleno en degradado. */
  gradienteDonut(): string {
    const p = this.coberturaAnimada();
    return `conic-gradient(from -90deg, #042354 0%, #274c8b ${p * 0.6}%, #6b80aa ${p}%, #e8ecf4 ${p}%, #f4f6fa 100%)`;
  }

  /**
   * Carga los totales, o los reutiliza desde la caché si siguen vigentes.
   *
   * Un fallo de red deja el total en 0, pero se cuentan los fallos para
   * avisar: antes el panel mostraba "0 registros" sin distinguir "no hay
   * datos" de "no se pudo consultar".
   */
  private async cargar(forzar = false): Promise<void> {
    const cache = cacheTotales;
    if (!forzar && cache !== null && Date.now() - cache.momento < VIGENCIA_CACHE_MS) {
      this.totales.set(cache.totales);
      this.ultimaActualizacion.set(new Date(cache.momento));
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const { totales, fallos } = await this.consultarTotales();

    this.totales.set(totales);
    this.ultimaActualizacion.set(new Date());
    this.cargando.set(false);

    if (fallos === 0) {
      cacheTotales = { totales, momento: Date.now() };
    } else {
      // No se cachea una foto parcial: quedaría congelada durante un minuto.
      this.error.set(
        `No se pudieron consultar ${fallos} de ${TABLAS.length} tablas. ` +
          'Las tarjetas afectadas muestran 0. Revisa la conexión e inténtalo de nuevo.',
      );
    }
  }

  private async consultarTotales(): Promise<{ totales: Record<string, number>; fallos: number }> {
    const resultados = await Promise.all(
      TABLAS.map(async (tabla) => {
        try {
          const respuesta = await lastValueFrom(this.api.contar(tabla.recurso));
          return respuesta?.total ?? 0;
        } catch (fallo) {
          console.error(`Error al cargar ${tabla.recurso}:`, fallo);
          return null;
        }
      }),
    );

    const totales: Record<string, number> = {};
    let fallos = 0;

    resultados.forEach((valor, indice) => {
      const recurso = TABLAS[indice].recurso;
      if (valor === null) {
        fallos += 1;
        totales[recurso] = 0;
      } else {
        totales[recurso] = valor;
      }
    });

    return { totales, fallos };
  }

  /**
   * Cuenta las cifras de 0 a su valor real con `requestAnimationFrame`.
   *
   * Una sola señal alimenta todas las tarjetas, así que el panel entra
   * completo y sincronizado en lugar de número por número.
   */
  private animarEntrada(): void {
    if (typeof requestAnimationFrame !== 'function') {
      this.progreso.set(1);
      return;
    }

    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.progreso.set(1);
      return;
    }

    const duracion = 900;
    const inicio = performance.now();

    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / duracion);
      // easeOutCubic: rápido al principio y frenando al final.
      this.progreso.set(1 - Math.pow(1 - avance, 3));
      if (avance < 1) {
        requestAnimationFrame(paso);
      } else {
        this.progreso.set(1);
      }
    };

    this.progreso.set(0);
    requestAnimationFrame(paso);
  }
}
