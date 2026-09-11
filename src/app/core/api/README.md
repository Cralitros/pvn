# Capa de acceso a datos (`core/api`)

Esta carpeta es **el único punto de la aplicación que conoce las rutas de la API
`backendpucp`**.

## La regla

> Un componente nunca construye URLs ni escribe rutas de la API.
> Inyecta el servicio del recurso que necesita y llama a un método con nombre.

```ts
import { AfpApiService } from '../../../core/api';

@Component({ /* ... */ })
export class AfpsComponent {
  constructor(private readonly afpApi: AfpApiService) {}

  cargar() {
    this.afpApi.listar().subscribe(afps => { /* ... */ });
  }
}
```

## Por qué existe (el problema que resuelve)

Antes había **cinco servicios casi idénticos** (`MaestrosserviceService`,
`Aux1Service`, `Aux2Service`, `Aux3Service`, `Saux4Service`) que compartían una
propiedad `apiUrl` **mutable** en un singleton (`providedIn: 'root'`):

```ts
// ❌ Antes
this.mservice.ponerurl('afps');   // cambia la URL del singleton
const source$ = this.mservice.get();
```

Como la URL vivía en el servicio compartido, cualquier componente podía
cambiarla mientras otro tenía una petición en curso. Ejemplos reales que había
en el código:

- `dashboard.component.ts` lanzaba **21 peticiones simultáneas** con
  `Promise.all` sobre `${recurso}/total`: como todas compartían `apiUrl`, en la
  práctica acababan apuntando al mismo recurso.
- `pdf-docente.component.ts` pedía siempre `firma/dni/07628234` (un DNI fijo
  escrito a mano).
- El botón *Reporte* de `TablaComponent` descargaba el PDF del **último**
  recurso que hubiera llamado a `ponerurl()` en cualquier parte de la app.
- `getid()` ignoraba el recurso solicitado y usaba el que estuviera "puesto".

Ahora cada petición construye su propia URL a partir de un parámetro, así que
no existe estado compartido que pueda corromperse.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| `api-base-url.token.ts` | `API_BASE_URL`: URL base vía `InjectionToken` (sustituible en pruebas). |
| `api-recursos.ts` | `RECURSOS` (recursos base) y `SUBRUTAS` (sub-rutas reales). |
| `api.types.ts` | `IdRecurso`, `ParametrosApi`, `RutaApi`, `TotalRecurso`. |
| `api.service.ts` | `ApiService`: motor HTTP tipado, sin estado. |
| `recurso-api.ts` | `RecursoApi<T>`: clase base con el CRUD común. |
| `servicios/` | Un servicio por recurso (catálogo, docentes, auth, firma, reportes). |

## Operaciones disponibles

Casi todos los servicios heredan de `RecursoApi`:

| Método | Petición |
| --- | --- |
| `listar(parametros?)` | `GET {recurso}` |
| `obtener(id)` | `GET {recurso}/{id}` |
| `crear(cuerpo)` | `POST {recurso}` |
| `actualizar(id, cuerpo)` | `PUT {recurso}/{id}` |
| `eliminar(id)` | `DELETE {recurso}/{id}` |
| `contar()` | `GET {recurso}/total` |

Métodos propios de algunos servicios:

| Servicio | Método | Petición |
| --- | --- | --- |
| `DocenteApiService` | `obtenerPorCodigo(c)` | `GET docentes/cod/{c}` |
| | `descargarContrato(c, dni)` | `GET docentes/contrato/{c}/{dni}` |
| | `descargarContratoWord(c)` | `GET docentes/contratow/{c}` |
| `DocenteLaboralApiService` | `obtenerPorCodigo(c)` | `GET docenteslaboral/cod/{c}` |
| `DocenteInvestigacionApiService` | `obtenerPorCodigo(c)` | `GET docentesinvestiga/cod/{c}` |
| `DocenteInfoApiService` | `obtenerPorCodigo(c)` | `GET docentesinfo/cod/{c}` |
| `DocenteCursoApiService` | `obtenerPorDocente(c)` | `GET docentescurso/docente/{c}` |
| `ProvinciaApiService` | `obtenerPorDepartamento(id)` | `GET provincias/provin/{id}` |
| `ProgramaApiService` | `listarPorEscuela(id)` | `GET programa?escuelaId={id}` |
| `DepartamentoAcademicoApiService` | `listarPorFacultad(id)` | `GET escuela?facultadId={id}` |
| `AuthApiService` | `autenticar(c)` | `POST login/login` |
| | `listarUsuarios()` | `GET login` |
| | `registrar(c)` | `POST login/register` |
| | `actualizarUsuario(id, c)` | `PUT login/{id}` |
| | `obtenerPorDni(d)` | `GET login/dni/{d}` |
| `FirmaApiService` | `obtenerPorDni(d)` | `GET firma/dni/{d}` |
| `ReporteApiService` | `reporteDe(recurso)` | `GET {recurso}/report` |

`DocenteGradoApiService` y `DocenteCategoriaApiService` no tienen sub-ruta: el
antiguo `getid(codigo)` sobre `docentesgrado` / `docentescategoria` es
simplemente `obtener(codigo)`.

## Rarezas del backend, documentadas

- **`escuela` vs `departamentoacad`**: la API lista los departamentos académicos
  en `escuela` pero los escribe en `departamentoacad`.
  `DepartamentoAcademicoApiService` encapsula ambas rutas.
- **`provincias/provin/{id}`**: ruta conservada tal cual estaba; si el backend
  espera `?departamentoId=`, devolverá 404 (comportamiento previo incluido).
- Varios endpoints devuelven una **lista** aunque se pidan por identificador
  (por eso `obtenerPorCodigo` devuelve `T[]`).

## Añadir un recurso nuevo

1. Añade su ruta a `RECURSOS` (o a `SUBRUTAS` si es una sub-ruta).
2. Crea `servicios/<nombre>-api.service.ts` extendiendo `RecursoApi<Modelo>`.
3. Reexpórtalo en `servicios/index.ts`.

Si escribes una ruta que no existe, **no compila**: `RutaApi` es una unión de
literales, no un `string` suelto.

## Comprobación de tipos

El proyecto no traía un chequeo de tipos completo (el `tsconfig.app.json` sólo
parte de `main.ts`, así que los archivos no referenciados no se revisan). Se
añadió `tsconfig.verify.json` para revisar **todo** `src/`, incluidas las
plantillas (`strictTemplates`):

```bash
npx ngc -p tsconfig.verify.json --noEmit
```
