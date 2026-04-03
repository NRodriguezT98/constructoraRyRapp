/**
 * Constantes: Configuración de Campos Dinámicos
 *
 * Definiciones centralizadas de tipos y roles disponibles
 * para campos configurables de fuentes de pago.
 *
 * @version 1.0
 */

import type {
  RolCampo,
  TipoCampoDinamico,
} from '@/modules/configuracion/types/campos-dinamicos.types'

// ============================================
// TIPOS DE CAMPOS DISPONIBLES
// ============================================

export const TIPOS_DISPONIBLES: Array<{
  value: TipoCampoDinamico
  label: string
}> = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Área de texto' },
  { value: 'number', label: 'Número' },
  { value: 'currency', label: 'Moneda (COP)' },
  { value: 'date', label: 'Fecha' },
  { value: 'select_banco', label: 'Select: Banco' },
  { value: 'select_caja', label: 'Select: Caja Compensación' },
  { value: 'select_custom', label: 'Select: Custom' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
]

// ============================================
// ROLES DE CAMPOS DISPONIBLES
// ============================================

export const ROLES_DISPONIBLES: Array<{
  value: RolCampo
  label: string
  description: string
}> = [
  {
    value: 'monto',
    label: '💰 Monto Principal',
    description:
      'Campo que contiene el valor monetario (usado para calcular totales)',
  },
  {
    value: 'entidad',
    label: '🏦 Entidad Financiera',
    description: 'Campo que identifica banco, caja o cooperativa',
  },
  {
    value: 'referencia',
    label: '📄 Referencia',
    description: 'Número de radicado, referencia o identificador del trámite',
  },
  {
    value: 'informativo',
    label: 'ℹ️ Informativo',
    description: 'Campo adicional sin propósito crítico en el sistema',
  },
]
