/**
 * Tipos para Asignar Vivienda a Cliente
 */

import type { TipoFuentePago } from '@/modules/clientes/types'

export interface FuentePagoConfig {
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string // ⭐ URL del documento subido
  carta_asignacion_url?: string
  permite_multiples_abonos?: boolean
}

export interface FuentePagoErrores {
  monto_aprobado?: string
  entidad?: string
  numero_referencia?: string
}

export interface FuentePagoConfiguracion {
  tipo: TipoFuentePago
  enabled: boolean
  config: FuentePagoConfig | null
}

export interface ProyectoBasico {
  id: string
  nombre: string
  estado?: string
}

export interface ViviendaDetalle {
  id: string
  numero: string
  manzana_id: string
  manzana_nombre?: string
  valor_total: number
  estado: string
}

export interface FormDataAsignacion {
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado: number
  notas: string
}

export type StepNumber = 1 | 2 | 3
