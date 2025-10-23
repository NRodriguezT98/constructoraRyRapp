/**
 * 📋 TIPOS DEL MÓDULO DE GESTIÓN DE PROCESOS
 *
 * Define las interfaces y tipos para el sistema de gestión
 * de plantillas de procesos de negociación.
 */

// ===================================
// ENUMS
// ===================================

/**
 * Estados posibles de un paso en el proceso
 */
export enum EstadoPaso {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  COMPLETADO = 'Completado',
  OMITIDO = 'Omitido'
}

/**
 * Tipos de fuentes de pago que condicionan pasos
 */
export enum TipoFuentePago {
  CREDITO_HIPOTECARIO = 'Crédito Hipotecario',
  SUBSIDIO_CAJA = 'Subsidio Caja de Compensación',
  RECURSOS_PROPIOS = 'Recursos Propios',
  CESANTIAS = 'Cesantías',
  OTRO = 'Otro'
}

// ===================================
// INTERFACES DE DOCUMENTOS
// ===================================

/**
 * Documento requerido para completar un paso
 */
export interface DocumentoRequerido {
  id: string
  nombre: string
  descripcion?: string
  obligatorio: boolean
  tiposArchivo: string[] // ['application/pdf', 'image/*']
  ejemploUrl?: string
}

// ===================================
// INTERFACES DE CONDICIONES
// ===================================

/**
 * Condiciones que determinan si un paso aplica
 */
export interface CondicionesPaso {
  /** Si está vacío, aplica a todas las fuentes de pago */
  fuentesPagoRequeridas: TipoFuentePago[]

  /** IDs de pasos que deben estar completados antes */
  dependeDe: string[]

  /** Días mínimos que deben pasar después de completar paso dependiente */
  diasMinimoDespuesDe?: number

  /** Fecha mínima para poder completar (opcional) */
  fechaMinimaCompletado?: string
}

// ===================================
// INTERFACES DE PASOS
// ===================================

/**
 * Paso individual de una plantilla de proceso
 */
export interface PasoPlantilla {
  id: string
  orden: number
  nombre: string
  descripcion?: string
  obligatorio: boolean
  permiteOmitir: boolean
  condiciones: CondicionesPaso
  documentos: DocumentoRequerido[]

  /** Estimación de días para completar (opcional) */
  diasEstimados?: number

  /** Instrucciones detalladas para el paso (opcional) */
  instrucciones?: string
}

// ===================================
// INTERFACES DE PLANTILLAS
// ===================================

/**
 * Plantilla de proceso completa (tabla: plantillas_proceso)
 */
export interface PlantillaProceso {
  id: string
  nombre: string
  descripcion?: string
  pasos: PasoPlantilla[]
  activo: boolean
  esPredeterminado: boolean
  fechaCreacion: string
  fechaActualizacion: string
  usuarioCreacion?: string
}

/**
 * Datos para crear una nueva plantilla
 */
export interface CrearPlantillaDTO {
  nombre: string
  descripcion?: string
  pasos: Omit<PasoPlantilla, 'id'>[]
  esPredeterminado?: boolean
}

/**
 * Datos para actualizar una plantilla existente
 */
export interface ActualizarPlantillaDTO {
  nombre?: string
  descripcion?: string
  pasos?: PasoPlantilla[]
  activo?: boolean
  esPredeterminado?: boolean
}

// ===================================
// INTERFACES DE INSTANCIAS (procesos_negociacion)
// ===================================

/**
 * Instancia de un paso en una negociación específica
 * (tabla: procesos_negociacion)
 */
export interface ProcesoNegociacion {
  id: string
  negociacionId: string
  nombre: string
  descripcion?: string
  orden: number
  esObligatorio: boolean
  permiteOmitir: boolean
  estado: EstadoPaso
  dependeDe: string[] | null
  documentosRequeridos: DocumentoRequerido[] | null
  documentosUrls: { [key: string]: string } | null
  fechaInicio?: string | null
  fechaCompletado?: string | null
  fechaLimite?: string | null
  notas?: string | null
  motivoOmision?: string | null
  fechaCreacion: string
  fechaActualizacion: string
  usuarioCompleto?: string | null
}

/**
 * Datos para crear instancia de proceso desde plantilla
 */
export interface CrearProcesoDesdePlantillaDTO {
  negociacionId: string
  plantillaId: string
  fuentesPago: TipoFuentePago[]
}

/**
 * Datos para actualizar un paso del proceso
 */
export interface ActualizarProcesoDTO {
  estado?: EstadoPaso
  documentosUrls?: { [key: string]: string }
  fechaInicio?: string
  fechaCompletado?: string
  fechaLimite?: string
  notas?: string
  motivoOmision?: string
}

// ===================================
// TIPOS DE UTILIDAD
// ===================================

/**
 * Estadísticas de una plantilla
 */
export interface EstadisticasPlantilla {
  totalPasos: number
  pasosObligatorios: number
  pasosOpcionales: number
  pasosCondicionales: number
  diasEstimadosTotal: number
  documentosTotales: number
}

/**
 * Resultado de validación de plantilla
 */
export interface ValidacionPlantilla {
  valida: boolean
  errores: string[]
  advertencias: string[]
}

/**
 * Progreso de proceso en una negociación
 */
export interface ProgresoNegociacion {
  negociacionId: string
  totalPasos: number
  pasosCompletados: number
  pasosPendientes: number
  pasosEnProceso: number
  pasosOmitidos: number
  porcentajeCompletado: number
  pasoActual?: ProcesoNegociacion
  diasTranscurridos: number
  diasEstimadosRestantes: number
}
