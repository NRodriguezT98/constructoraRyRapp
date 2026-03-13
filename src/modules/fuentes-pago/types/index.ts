/**
 * ============================================
 * TYPES: Sistema de Validación de Fuentes de Pago
 * ============================================
 *
 * Tipos TypeScript para el sistema de pasos de validación.
 *
 * @version 1.0.0 - 2025-12-11
 */

import type { Database } from '@/lib/supabase/database.types'

// ============================================
// TIPOS DE BASE DE DATOS
// ============================================

export type PasoFuentePagoDB = Database['public']['Tables']['pasos_fuente_pago']['Row']
export type PasoFuentePagoInsert = Database['public']['Tables']['pasos_fuente_pago']['Insert']
export type PasoFuentePagoUpdate = Database['public']['Tables']['pasos_fuente_pago']['Update']

// ============================================
// TYPES EXTENDIDOS
// ============================================

/**
 * Paso de validación de fuente de pago
 */
export interface PasoFuentePago extends PasoFuentePagoDB {
  // Campos adicionales opcionales de relaciones
  documento?: {
    id: string
    titulo: string
    url_storage: string
    fecha_documento: string
  }
}

/**
 * Progreso de validación de una fuente de pago
 */
export interface ProgresoFuentePago {
  total_pasos: number
  completados: number
  pendientes: number
  porcentaje: number
}

/**
 * Fuente de pago con progreso de validación
 */
export interface FuentePagoConProgreso {
  id: string
  negociacion_id: string
  tipo: string
  entidad?: string
  monto: number
  monto_recibido: number
  carta_aprobacion_url?: string
  created_at: string

  // Progreso de validación
  progreso: ProgresoFuentePago
  pasos: PasoFuentePago[]
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * DTO para marcar un paso como completado
 */
export interface MarcarPasoCompletadoDTO {
  pasoId: string
  fecha_completado: string // ISO string (YYYY-MM-DD)
  documento_id?: string | null // Opcional para DOCUMENTO_OPCIONAL y SOLO_CONFIRMACION
  observaciones?: string
}

/**
 * DTO para crear pasos de validación
 */
export interface CrearPasosDTO {
  fuente_pago_id: string
  tipo_fuente: string
}

/**
 * DTO para validar pre-desembolso
 */
export interface ValidacionPreDesembolso {
  valido: boolean
  errores: string[]
  pasos_pendientes: {
    paso: string
    titulo: string
    razon: string
  }[]
}

// ============================================
// ENUMS
// ============================================

export enum NivelValidacion {
  DOCUMENTO_OBLIGATORIO = 'DOCUMENTO_OBLIGATORIO',
  DOCUMENTO_OPCIONAL = 'DOCUMENTO_OPCIONAL',
  SOLO_CONFIRMACION = 'SOLO_CONFIRMACION',
}

// ============================================
// QUERY KEYS (React Query)
// ============================================

export const pasosFuentePagoKeys = {
  all: ['pasos-fuente-pago'] as const,
  lists: () => [...pasosFuentePagoKeys.all, 'list'] as const,
  list: (fuenteId: string) => [...pasosFuentePagoKeys.lists(), fuenteId] as const,
  progreso: (fuenteId: string) => [...pasosFuentePagoKeys.all, 'progreso', fuenteId] as const,
  validacion: (fuenteId: string) => [...pasosFuentePagoKeys.all, 'validacion', fuenteId] as const,
}
