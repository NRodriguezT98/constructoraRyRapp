/**
 * Tipos para el módulo de Negociaciones
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 * ✅ ACTUALIZADO: 2025-10-22 (Migración 003)
 *
 * Reutiliza tipos de clientes pero con extensiones para vistas globales
 */

// Re-exportar tipos de clientes
export type {
    EstadoNegociacion, // ⭐ NUEVO
    EstadoRenuncia, FuentePago, Negociacion, ProcesoNegociacion,
    Renuncia
} from '@/modules/clientes/types'

/**
 * ✅ VERIFICADO en DB: negociaciones_estado_check
 * Estados actualizados según migración 003
 */
export const ESTADOS_NEGOCIACION = [
  'Activa',
  'Suspendida', // ⭐ NUEVO
  'Cerrada por Renuncia', // ⭐ NUEVO
  'Completada',
] as const

// Tipos de fuente de pago (PascalCase - VERIFICADO EN DB)
export const TIPOS_FUENTE_PAGO = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación',
] as const

// Estados de proceso (PascalCase - VERIFICADO EN DB)
export const ESTADOS_PROCESO = [
  'Pendiente',
  'En Proceso',
  'Completado',
  'Omitido',
] as const

// Tipos extendidos para vistas globales
export interface NegociacionConRelaciones {
  id: string
  cliente_id: string
  vivienda_id: string
  estado: typeof ESTADOS_NEGOCIACION[number]
  valor_negociado: number
  descuento_aplicado: number
  valor_total: number // GENERATED
  total_fuentes_pago: number
  fecha_creacion: string
  fecha_actualizacion: string
  fecha_negociacion: string
  fecha_completada?: string // ⭐ Requerida cuando estado='Completada'
  notas?: string

  // Relaciones
  cliente?: {
    id: string
    nombre_completo: string // GENERATED
    numero_documento: string
    telefono?: string
    email?: string
  }
  vivienda?: {
    id: string
    numero: string // ✅ VERIFICADO: campo 'numero' NO 'numero_vivienda'
    valor_base: number
    valor_total: number // GENERATED
    estado: string
    manzana?: {
      nombre: string
      proyecto?: {
        nombre: string
      }
    }
  }
  fuentes_pago?: Array<{
    id: string
    tipo: typeof TIPOS_FUENTE_PAGO[number]
    monto_aprobado: number
    monto_recibido: number
    saldo_pendiente: number // GENERATED
    porcentaje_completado: number // GENERATED
  }>
}

// Filtros para la vista de negociaciones
export interface FiltrosNegociaciones {
  estado?: typeof ESTADOS_NEGOCIACION[number]
  busqueda?: string // Buscar por cliente o vivienda
  proyecto_id?: string
  fecha_desde?: string
  fecha_hasta?: string
}

// Métricas del dashboard
export interface MetricasNegociaciones {
  total: number
  activas: number // ⭐ ACTUALIZADO
  suspendidas: number // ⭐ NUEVO
  cerradas_renuncia: number // ⭐ NUEVO
  completadas: number
  valor_total_activas: number
  valor_total_completadas: number
}
