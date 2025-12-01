/**
 * Tipos para el Historial de Cliente
 * Sistema de auditoría humanizado para mostrar en timeline
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Evento raw de audit_log relacionado con un cliente
 */
export interface EventoHistorialCliente {
  id: string
  tabla: string
  accion: 'CREATE' | 'UPDATE' | 'DELETE'
  registro_id: string
  fecha_evento: string
  usuario_email: string
  usuario_nombres: string | null
  usuario_rol: string | null
  datos_anteriores: any | null
  datos_nuevos: any | null
  cambios_especificos: Record<string, { antes: any; despues: any }> | null
  metadata: Record<string, any>
  modulo: string | null
}

/**
 * Evento humanizado para mostrar en UI
 * Convierte datos raw de audit_log en información legible
 */
export interface EventoHistorialHumanizado {
  id: string
  tipo: TipoEventoHistorial
  titulo: string
  descripcion: string
  fecha: string
  usuario: {
    email: string
    nombres: string | null
    rol: string | null
  }
  icono: LucideIcon
  color: ColorEvento
  detalles?: DetalleEvento[]
  metadata?: Record<string, any>
}

/**
 * Tipos de eventos del historial
 */
export type TipoEventoHistorial =
  // Cliente
  | 'cliente_creado'
  | 'cliente_actualizado'
  | 'cliente_eliminado'
  | 'cliente_estado_cambiado'
  // Negociación
  | 'negociacion_creada'
  | 'negociacion_actualizada'
  | 'negociacion_estado_cambiada'
  | 'negociacion_completada'
  // Abono
  | 'abono_registrado'
  | 'abono_anulado'
  // Renuncia
  | 'renuncia_creada'
  | 'renuncia_aprobada'
  | 'renuncia_rechazada'
  // Interés
  | 'interes_registrado'
  | 'interes_actualizado'
  | 'interes_descartado'
  // Documento
  | 'documento_subido'
  | 'documento_actualizado'
  | 'documento_eliminado'
  // Otros
  | 'evento_generico'

/**
 * Colores para cada tipo de evento
 */
export type ColorEvento =
  | 'blue' // Información general
  | 'green' // Creación, aprobación, éxito
  | 'yellow' // Actualización, cambio
  | 'red' // Eliminación, rechazo, error
  | 'purple' // Completado, finalizado
  | 'cyan' // Documentos
  | 'orange' // Advertencias, descartes
  | 'gray' // Otros

/**
 * Detalle de un campo modificado (para UPDATE)
 */
export interface DetalleEvento {
  campo: string
  etiqueta: string
  valorAnterior: any
  valorNuevo: any
  tipo?: 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum'
}

/**
 * Filtros para el historial
 */
export interface FiltrosHistorial {
  tipo?: TipoEventoHistorial[]
  tabla?: string[]
  accion?: ('CREATE' | 'UPDATE' | 'DELETE')[]
  fecha_desde?: string
  fecha_hasta?: string
  busqueda?: string
  usuario?: string
}

/**
 * Estadísticas de actividad del cliente
 */
export interface EstadisticasHistorial {
  total_eventos: number
  eventos_por_tipo: {
    clientes: number
    negociaciones: number
    abonos: number
    renuncias: number
    intereses: number
    documentos: number
  }
  eventos_por_accion: {
    creaciones: number
    actualizaciones: number
    eliminaciones: number
  }
  primer_evento: string | null
  ultimo_evento: string | null
}

/**
 * Agrupación de eventos por fecha
 */
export interface GrupoEventosPorFecha {
  fecha: string // YYYY-MM-DD
  fechaFormateada: string // "Hoy", "Ayer", "15 de noviembre de 2025"
  eventos: EventoHistorialHumanizado[]
  total: number
}
