/**
 * Domain Types: Entidades Financieras
 *
 * Tipos para el manejo de bancos, cajas de compensación y otras entidades financieras.
 * Siguen Clean Architecture y DDD principles.
 */

import type { Database } from '@/lib/supabase/database.types'

// =====================================================
// DATABASE TYPES
// =====================================================

export type EntidadFinancieraRow = Database['public']['Tables']['entidades_financieras']['Row']
export type EntidadFinancieraInsert = Database['public']['Tables']['entidades_financieras']['Insert']
export type EntidadFinancieraUpdate = Database['public']['Tables']['entidades_financieras']['Update']

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export const TIPO_ENTIDAD_VALUES = [
  'Banco',
  'Caja de Compensación',
  'Cooperativa',
  'Otro',
] as const

export type TipoEntidadFinanciera = (typeof TIPO_ENTIDAD_VALUES)[number]

export const ENTIDAD_COLOR_VALUES = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'yellow',
  'cyan',
  'pink',
  'indigo',
  'gray',
] as const

export type EntidadColor = (typeof ENTIDAD_COLOR_VALUES)[number]

// =====================================================
// DOMAIN MODEL
// =====================================================

export interface EntidadFinanciera {
  id: string

  // Identificación
  nombre: string
  codigo: string
  tipo: TipoEntidadFinanciera

  // Información corporativa
  nit: string | null
  razon_social: string | null

  // Contacto
  telefono: string | null
  email_contacto: string | null
  sitio_web: string | null
  direccion: string | null

  // Información adicional
  codigo_superintendencia: string | null
  notas: string | null

  // Configuración de aplicabilidad
  tipos_fuentes_aplicables: string[] // Array de UUIDs de tipos_fuentes_pago

  // UI/UX
  logo_url: string | null
  color: EntidadColor
  orden: number

  // Estado
  activo: boolean

  // Auditoría
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CrearEntidadFinancieraDTO {
  nombre: string
  codigo: string
  tipo: TipoEntidadFinanciera
  tipos_fuentes_aplicables?: string[] // Array de UUIDs de tipos_fuentes_pago
  nit?: string | null
  razon_social?: string | null
  telefono?: string | null
  email_contacto?: string | null
  sitio_web?: string | null
  direccion?: string | null
  codigo_superintendencia?: string | null
  notas?: string | null
  logo_url?: string | null
  color?: EntidadColor
  orden?: number
  activo?: boolean
}

export interface ActualizarEntidadFinancieraDTO {
  nombre?: string
  codigo?: string
  tipo?: TipoEntidadFinanciera
  tipos_fuentes_aplicables?: string[] // Array de UUIDs de tipos_fuentes_pago
  nit?: string | null
  razon_social?: string | null
  telefono?: string | null
  email_contacto?: string | null
  sitio_web?: string | null
  direccion?: string | null
  codigo_superintendencia?: string | null
  notas?: string | null
  logo_url?: string | null
  color?: EntidadColor
  orden?: number
  activo?: boolean
}

// =====================================================
// FILTERS & QUERIES
// =====================================================

export interface EntidadesFinancierasFilters {
  tipo?: TipoEntidadFinanciera
  activo?: boolean
  search?: string
}

export interface EntidadesFinancierasOrderBy {
  column: keyof EntidadFinanciera
  ascending: boolean
}

// =====================================================
// VALIDATION
// =====================================================

export const ENTIDAD_FINANCIERA_LIMITS = {
  nombre: { min: 1, max: 100 },
  codigo: { min: 1, max: 50 },
  nit: { max: 20 },
  razon_social: { max: 200 },
  telefono: { max: 50 },
  email_contacto: { max: 255 },
  sitio_web: { max: 255 },
  codigo_superintendencia: { max: 20 },
  orden: { min: 1, max: 9999 },
} as const

// =====================================================
// UI HELPERS
// =====================================================

export interface EntidadFinancieraOption {
  value: string // id
  label: string // nombre
  tipo: TipoEntidadFinanciera
  codigo: string
  activo: boolean
}

// =====================================================
// SERVICE RESULT TYPE
// =====================================================

export type EntidadFinancieraResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// =====================================================
// ESTADÍSTICAS
// =====================================================

export interface EntidadesFinancierasStats {
  total: number
  activas: number
  inactivas: number
  porTipo: Record<TipoEntidadFinanciera, number>
}
