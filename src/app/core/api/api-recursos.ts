/**
 * Catálogo de rutas de la API `backendpucp`.
 *
 * Antes estas cadenas viajaban sueltas en 119 llamadas a `ponerurl()`, con
 * erratas imposibles de detectar en compilación (por ejemplo `"plan "`). Aquí
 * quedan en un único lugar tipado: si una ruta no existe, no compila.
 */
export const RECURSOS = {
  afps: 'afps',
  area: 'area',
  bancos: 'bancos',
  categoria: 'categoria',
  curso: 'curso',
  departamentoAcademico: 'departamentoacad',
  departamentos: 'departamentos',
  distritos: 'distritos',
  docentes: 'docentes',
  docentesCategoria: 'docentescategoria',
  docentesCurso: 'docentescurso',
  docentesGrado: 'docentesgrado',
  docentesInfo: 'docentesinfo',
  docentesInvestigacion: 'docentesinvestiga',
  docentesLaboral: 'docenteslaboral',
  escuela: 'escuela',
  facultad: 'facultad',
  firma: 'firma',
  login: 'login',
  nacionalidad: 'nacionalidad',
  plan: 'plan',
  programa: 'programa',
  provincias: 'provincias',
} as const;

/** Nombre de un recurso base de la API. */
export type Recurso = (typeof RECURSOS)[keyof typeof RECURSOS];

/**
 * Sub-rutas reales de la API (recurso + acción).
 *
 * Todas se verificaron contra las llamadas existentes: no se inventó ninguna.
 */
export const SUBRUTAS = {
  /** `GET docentes/cod/{codigo}` */
  docentePorCodigo: 'docentes/cod',
  /** `GET docentes/contrato/{codigo}[/{dni}]` (PDF del contrato) */
  docenteContrato: 'docentes/contrato',
  /** `GET docentes/contratow/{codigo}` (contrato en Word) */
  docenteContratoWord: 'docentes/contratow',
  /** `GET docenteslaboral/cod/{codigo}` */
  docenteLaboralPorCodigo: 'docenteslaboral/cod',
  /** `GET docentesinvestiga/cod/{codigo}` */
  docenteInvestigacionPorCodigo: 'docentesinvestiga/cod',
  /** `GET docentesinfo/cod/{codigo}` */
  docenteInfoPorCodigo: 'docentesinfo/cod',
  /** `GET docentescurso/docente/{codigo}` */
  docenteCursoPorDocente: 'docentescurso/docente',
  /** `GET firma/dni/{dni}` */
  firmaPorDni: 'firma/dni',
  /** `POST login/login` */
  loginAutenticar: 'login/login',
  /** `POST login/register` */
  loginRegistrar: 'login/register',
  /** `GET login/dni/{dni}` */
  loginPorDni: 'login/dni',
} as const;
