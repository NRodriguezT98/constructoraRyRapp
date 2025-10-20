/**
 * Tipos para Modal de Crear Negociación
 */

import type { TipoFuentePago } from '@/modules/clientes/types'

export interface ModalCrearNegociacionProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre?: string
  viviendaId?: string
  valorVivienda?: number
  onSuccess: (negociacionId: string) => void
}

export interface FuentePagoConfig {
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
  permite_multiples_abonos?: boolean
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

export interface FormDataNegociacion {
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado: number
  notas: string
}

export type StepNumber = 1 | 2 | 3
