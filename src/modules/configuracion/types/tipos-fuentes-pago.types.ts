/**
 * Domain Types: Tipos de Fuentes de Pago
 *
 * Tipos TypeScript para el dominio de administración de tipos de fuentes de pago.
 * Siguiendo Domain-Driven Design (DDD) y type safety estricto.
 */

import type { Database } from '@/lib/supabase/database.types'

// =====================================================
// DATABASE TYPES
// =====================================================
export type TipoFuentePagoDB =
  Database['public']['Tables']['tipos_fuentes_pago']['Row']
export type TipoFuentePagoInsert =
  Database['public']['Tables']['tipos_fuentes_pago']['Insert']
export type TipoFuentePagoUpdate =
  Database['public']['Tables']['tipos_fuentes_pago']['Update']

// =====================================================
// DOMAIN TYPES
// =====================================================

/**
 * Tipo de fuente de pago (entidad de dominio completa)
 */
export interface TipoFuentePago {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  es_subsidio: boolean
  color: TipoFuenteColor
  icono: TipoFuenteIcono
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

/**
 * Colores disponibles para UI (paleta del sistema)
 */
export type TipoFuenteColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'cyan'
  | 'pink'
  | 'indigo'
  | 'yellow'
  | 'emerald'

/**
 * Iconos disponibles de lucide-react
 */
export type TipoFuenteIcono =
  | 'Wallet'
  | 'Building2'
  | 'Home'
  | 'Shield'
  | 'CreditCard'
  | 'Landmark'
  | 'BadgeDollarSign'
  | 'DollarSign'
  | 'Banknote'
  | 'HandCoins'

// =====================================================
// FORM TYPES (DTOs)
// =====================================================

/**
 * DTO para crear un nuevo tipo de fuente de pago
 */
export interface CrearTipoFuentePagoDTO {
  nombre: string
  codigo: string
  descripcion?: string
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  es_subsidio: boolean
  color: TipoFuenteColor
  icono: TipoFuenteIcono
  orden: number
  activo?: boolean
}

/**
 * DTO para actualizar un tipo de fuente de pago existente
 */
export interface ActualizarTipoFuentePagoDTO {
  nombre?: string
  codigo?: string
  descripcion?: string | null
  requiere_entidad?: boolean
  permite_multiples_abonos?: boolean
  es_subsidio?: boolean
  color?: TipoFuenteColor
  icono?: TipoFuenteIcono
  orden?: number
  activo?: boolean
}

/**
 * DTO para formulario de UI (con validaciones)
 */
export interface TipoFuentePagoFormData {
  nombre: string
  codigo: string
  descripcion: string // ✅ Zod lo transforma a '' si está vacío
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  es_subsidio: boolean
  color: TipoFuenteColor
  icono: TipoFuenteIcono
  orden: number
  activo: boolean
}

// =====================================================
// QUERY TYPES
// =====================================================

/**
 * Filtros para consultar tipos de fuentes de pago
 */
export interface TipoFuentePagoFilters {
  activo?: boolean
  es_subsidio?: boolean
  requiere_entidad?: boolean
  search?: string
}

/**
 * Opciones de ordenamiento
 */
export type TipoFuentePagoOrderBy =
  | 'orden'
  | 'nombre'
  | 'created_at'
  | 'updated_at'

/**
 * Dirección de ordenamiento
 */
export type OrderDirection = 'asc' | 'desc'

// =====================================================
// UI TYPES
// =====================================================

/**
 * Configuración de tema por color
 */
export interface TipoFuenteTheme {
  gradient: string
  bg: string
  bgLight: string
  bgDark: string
  text: string
  textLight: string
  textDark: string
  border: string
  borderLight: string
  borderDark: string
}

/**
 * Tipo de fuente simplificado para selects/dropdowns
 */
export interface TipoFuentePagoOption {
  value: string // id
  label: string // nombre
  codigo: string
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  icono: TipoFuenteIcono
  color: TipoFuenteColor
}

// =====================================================
// ERROR TYPES
// =====================================================

/**
 * Errores específicos del dominio
 */
export type TipoFuentePagoError =
  | { type: 'NOMBRE_DUPLICADO'; mensaje: string }
  | { type: 'CODIGO_DUPLICADO'; mensaje: string }
  | { type: 'NO_ENCONTRADO'; mensaje: string }
  | { type: 'VALIDACION_FALLIDA'; campo: string; mensaje: string }
  | { type: 'PERMISOS_INSUFICIENTES'; mensaje: string }
  | { type: 'ERROR_DB'; mensaje: string; error?: unknown }

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Valores por defecto
 */
export const TIPO_FUENTE_PAGO_DEFAULTS = {
  color: 'blue' as TipoFuenteColor,
  icono: 'Wallet' as TipoFuenteIcono,
  orden: 99,
  activo: true,
  requiere_entidad: false,
  permite_multiples_abonos: false,
  es_subsidio: false,
} as const

/**
 * Límites de validación
 */
export const TIPO_FUENTE_PAGO_LIMITS = {
  NOMBRE_MIN: 3,
  NOMBRE_MAX: 100,
  CODIGO_MIN: 3,
  CODIGO_MAX: 50,
  DESCRIPCION_MAX: 500,
  ORDEN_MIN: 1,
  ORDEN_MAX: 999,
} as const
