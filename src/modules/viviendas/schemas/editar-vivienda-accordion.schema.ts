/**
 * Constantes y tipos para useEditarViviendaAccordion.
 * Extraído del hook para mantenerlo bajo el límite de 150 líneas.
 */

import { DollarSign, MapPin, Ruler, Scale } from 'lucide-react'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'

// ── Configuración de pasos ───────────────────────────────────────────────────
export const PASOS_VIVIENDA_EDICION: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Ubicación',
    description: 'Proyecto, manzana y número (solo lectura en edición).',
    icon: MapPin,
  },
  {
    id: 2,
    title: 'Linderos',
    description:
      'Límites físicos de la vivienda: norte, sur, oriente y occidente.',
    icon: Ruler,
  },
  {
    id: 3,
    title: 'Información Legal',
    description: 'Matrícula inmobiliaria, nomenclatura y áreas del predio.',
    icon: Scale,
  },
  {
    id: 4,
    title: 'Información Financiera',
    description:
      'Valor base, tipo y recargos. Cambios pueden impactar negociaciones activas.',
    icon: DollarSign,
  },
]

// ── Campos por paso (para trigger de validación parcial) ─────────────────────
export const FIELDS_PASO_2_VIVIENDA_EDICION = [
  'lindero_norte',
  'lindero_sur',
  'lindero_oriente',
  'lindero_occidente',
] as const

export const FIELDS_PASO_3_VIVIENDA_EDICION = [
  'matricula_inmobiliaria',
  'nomenclatura',
  'area_lote',
  'area_construida',
  'tipo_vivienda',
] as const

export const FIELDS_PASO_4_VIVIENDA_EDICION = [
  'valor_base',
  'es_esquinera',
  'recargo_esquinera',
] as const
