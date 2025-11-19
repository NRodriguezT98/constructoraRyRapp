/**
 * Tipos TypeScript para el Sistema de Auditoría
 *
 * @author RyR Constructora
 * @date 2025-11-04
 */

/**
 * Tablas que pueden ser auditadas
 */
export type TablaAuditable =
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos_historial'
  | 'fuentes_pago'
  | 'renuncias'
  | 'procesos_negociacion'
  | 'proyectos'
  | 'manzanas'
  | 'usuarios'
  | 'documentos_proyecto'
  | 'documentos_vivienda'
  | 'documentos_cliente'
  | 'categorias_documento'

/**
 * Acciones que se pueden auditar
 */
export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * Módulos de la aplicación
 */
export type ModuloAplicacion =
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos'
  | 'procesos'
  | 'proyectos'
  | 'renuncias'
  | 'usuarios'
  | 'documentos'
  | 'admin'

/**
 * Parámetros para registrar una acción en audit_log
 */
export interface AuditLogParams<T = any> {
  /** Tabla afectada */
  tabla: TablaAuditable

  /** Acción realizada */
  accion: AccionAuditoria

  /** ID del registro afectado */
  registroId: string

  /** Snapshot del registro ANTES del cambio (NULL en CREATE) */
  datosAnteriores?: T | null

  /** Snapshot del registro DESPUÉS del cambio (NULL en DELETE) */
  datosNuevos?: T | null

  /** Metadata adicional de contexto */
  metadata?: Record<string, any>

  /** Módulo de la aplicación */
  modulo?: ModuloAplicacion
}

/**
 * Registro de auditoría (estructura de la tabla audit_log)
 */
export interface AuditLogRecord {
  /** ID único del evento */
  id: string

  /** Tabla afectada */
  tabla: TablaAuditable

  /** Acción realizada */
  accion: AccionAuditoria

  /** ID del registro afectado */
  registro_id: string

  /** ID del usuario que realizó la acción */
  usuario_id: string | null

  /** Email del usuario */
  usuario_email: string

  /** Rol del usuario al momento de la acción */
  usuario_rol: string | null

  /** Timestamp del evento */
  fecha_evento: string

  /** IP desde donde se realizó la acción */
  ip_address: string | null

  /** User agent del navegador */
  user_agent: string | null

  /** Snapshot completo ANTES del cambio */
  datos_anteriores: any | null

  /** Snapshot completo DESPUÉS del cambio */
  datos_nuevos: any | null

  /** Solo los campos que cambiaron */
  cambios_especificos: Record<string, { antes: any; despues: any }> | null

  /** Metadata adicional */
  metadata: Record<string, any>

  /** Módulo de la aplicación */
  modulo: ModuloAplicacion | null
}

/**
 * Resumen de actividad de un usuario
 */
export interface ActividadUsuario {
  id: string
  tabla: TablaAuditable
  accion: AccionAuditoria
  fecha_evento: string
  registro_id: string
  modulo: ModuloAplicacion | null
  metadata: Record<string, any>
}

/**
 * Resumen de auditoría por módulo
 */
export interface ResumenPorModulo {
  /** Módulo de la aplicación */
  modulo: ModuloAplicacion

  /** Total de eventos registrados */
  total_eventos: number

  /** Cantidad de usuarios únicos que realizaron acciones */
  usuarios_activos: number

  /** Total de creaciones */
  total_creaciones: number

  /** Total de actualizaciones */
  total_actualizaciones: number

  /** Total de eliminaciones */
  total_eliminaciones: number

  /** Fecha del último evento */
  ultimo_evento: string

  /** Fecha del primer evento */
  primer_evento: string
}

/**
 * Eliminación masiva detectada
 */
export interface EliminacionMasiva {
  /** Fecha de las eliminaciones */
  fecha: string

  /** Email del usuario que eliminó */
  usuario_email: string

  /** Tabla afectada */
  tabla: TablaAuditable

  /** Cantidad de eliminaciones */
  total_eliminaciones: number
}

/**
 * Filtros para consultar auditoría
 */
export interface FiltrosAuditoria {
  /** Filtrar por tabla */
  tabla?: TablaAuditable

  /** Filtrar por acción */
  accion?: AccionAuditoria

  /** Filtrar por usuario */
  usuarioId?: string

  /** Filtrar por módulo */
  modulo?: ModuloAplicacion

  /** Filtrar por rango de fechas (desde) */
  fechaDesde?: Date | string

  /** Filtrar por rango de fechas (hasta) */
  fechaHasta?: Date | string

  /** Límite de resultados */
  limit?: number
}

/**
 * Cambio específico en un campo
 */
export interface CambioEspecifico {
  /** Valor anterior */
  antes: any

  /** Valor nuevo */
  despues: any
}

/**
 * Historial formateado para UI
 */
export interface HistorialFormateado {
  id: string
  accion: AccionAuditoria
  fechaEvento: Date
  fechaFormateada: string
  usuarioEmail: string
  usuarioRol: string | null
  cambios: Array<{
    campo: string
    antes: any
    despues: any
    tipo: 'texto' | 'numero' | 'booleano' | 'fecha' | 'objeto'
  }>
  metadata: Record<string, any>
}
