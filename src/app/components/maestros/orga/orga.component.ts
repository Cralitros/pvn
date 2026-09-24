import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

import { ApiService, RECURSOS } from '../../../core/api';
import { OrgNode } from '../../modelos/organigrama.model';
import { Usuario } from '../../modelos/usuario';
import { OrganigramaComponent } from '../../objetos/organigrama/organigrama.component';

/** Descripción de cada nivel de acceso, igual que en el formulario de usuarios. */
const NIVELES: Record<string, string> = {
  '1': 'Acceso total',
  '2': 'Tablas y reportes',
  '3': 'Reportes',
};

const SIN_NIVEL = 'sin-nivel';

function etiquetaUsuarios(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'usuario' : 'usuarios'}`;
}

function nombreDelNivel(nivel: string): string {
  return NIVELES[nivel] ? `Nivel ${nivel} · ${NIVELES[nivel]}` : 'Sin nivel asignado';
}

function rolDe(usuario: Usuario): string {
  return (usuario.rol ?? '').trim() || (usuario.cargo ?? '').trim() || 'Sin rol';
}

function nombreDe(usuario: Usuario): string {
  const nombre = [usuario.nombres, usuario.apellidos]
    .map(parte => (parte ?? '').trim())
    .filter(parte => parte !== '')
    .join(' ');

  return nombre || (usuario.dni ?? '').trim() || 'Sin nombre';
}

/**
 * Arma el organigrama a partir de los usuarios del sistema.
 *
 * El primer nivel es el **nivel de acceso** (1 · Acceso total, 2 · Tablas y
 * reportes, 3 · Reportes), que es la jerarquía que existe de verdad en los
 * datos; de cada nivel cuelga una tarjeta por usuario, **rotulada con su rol** y
 * con el nombre de la persona debajo.
 *
 * Antes este componente tenía un árbol inventado (Ana López / CEO, Carlos Ruiz /
 * CTO…) sin ninguna relación con la aplicación. Se exporta la función para poder
 * probarla sin levantar la petición HTTP.
 */
export function construirOrganigrama(
  usuarios: readonly Usuario[] | null | undefined,
): OrgNode | null {
  const lista = (usuarios ?? []).filter((usuario): usuario is Usuario => usuario != null);

  if (lista.length === 0) {
    return null;
  }

  const porNivel = new Map<string, Usuario[]>();
  for (const usuario of lista) {
    const clave = String(usuario.nivel ?? '').trim() || SIN_NIVEL;
    const grupo = porNivel.get(clave);

    if (grupo) {
      grupo.push(usuario);
    } else {
      porNivel.set(clave, [usuario]);
    }
  }

  const hijos: OrgNode[] = [...porNivel.entries()]
    // Los niveles numéricos primero y en orden; los usuarios sin nivel, al final.
    .sort(([a], [b]) => Number(a) - Number(b) || a.localeCompare(b))
    .map(([nivel, usuariosDelNivel]) => ({
      id: `nivel-${nivel}`,
      name: nombreDelNivel(nivel),
      title: etiquetaUsuarios(usuariosDelNivel.length),
      children: usuariosDelNivel.map((usuario, indice) => ({
        id: `usuario-${usuario.dni ?? indice}`,
        name: rolDe(usuario),
        title: nombreDe(usuario),
      })),
    }));

  return {
    id: 'usuarios',
    name: 'Usuarios del sistema',
    title: etiquetaUsuarios(lista.length),
    children: hijos,
  };
}

@Component({
  selector: 'app-orga',
  standalone: true,
  imports: [OrganigramaComponent, CommonModule],
  templateUrl: './orga.component.html',
  styleUrl: './orga.component.scss',
})
export class OrgaComponent {
  private readonly api = inject(ApiService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly raiz = signal<OrgNode | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const usuarios = await lastValueFrom(this.api.listar<Usuario>(RECURSOS.login));
      this.raiz.set(construirOrganigrama(usuarios));

      if (this.raiz() === null) {
        this.error.set('La tabla de usuarios está vacía: no hay nada que mostrar.');
      }
    } catch (fallo) {
      console.error('Error al cargar los usuarios del organigrama:', fallo);
      this.error.set('No se pudieron cargar los usuarios. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }
}
