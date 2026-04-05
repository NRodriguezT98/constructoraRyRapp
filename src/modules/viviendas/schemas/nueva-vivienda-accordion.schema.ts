/**
 * Schema, tipos y configuración de pasos para useNuevaViviendaAccordion
 */

import { ClipboardCheck, DollarSign, MapPin, Ruler, Scale } from 'lucide-react'
import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'

import type { ViviendaSchemaType } from './vivienda.schemas'

// ── Configuración de pasos ───────────────────────────────────────
export const PASOS_VIVIENDA: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Ubicación',
    description:
      'Selecciona el proyecto, manzana y número de la vivienda a registrar.',
    icon: MapPin,
  },
  {
    id: 2,
    title: 'Linderos',
    description:
      'Define los límites físicos (norte, sur, este, oeste) de la vivienda.',
    icon: Ruler,
  },
  {
    id: 3,
    title: 'Información Legal',
    description:
      'Datos catastrales: matrícula inmobiliaria, nomenclatura y áreas.',
    icon: Scale,
  },
  {
    id: 4,
    title: 'Información Financiera',
    description:
      'Valor base de la vivienda y recargos aplicables (esquinera, etc.).',
    icon: DollarSign,
  },
  {
    id: 5,
    title: 'Resumen',
    description: 'Revisa toda la información antes de confirmar la creación.',
    icon: ClipboardCheck,
  },
]

// ── Schema Zod para el formulario (sin cross-field .refine) ─────
export const nuevaViviendaAccordionSchema = z.object({
  // Paso 1
  proyecto_id: z.string().min(1, 'Selecciona un proyecto'),
  manzana_id: z.string().min(1, 'Selecciona una manzana'),
  numero: z.string().min(1, 'El número de vivienda es obligatorio'),
  // Paso 2
  lindero_norte: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-()]+$/,
      'Solo letras, números, puntos, comas y guiones'
    ),
  lindero_sur: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-()]+$/,
      'Solo letras, números, puntos, comas y guiones'
    ),
  lindero_oriente: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-()]+$/,
      'Solo letras, números, puntos, comas y guiones'
    ),
  lindero_occidente: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-()]+$/,
      'Solo letras, números, puntos, comas y guiones'
    ),
  // Paso 3
  matricula_inmobiliaria: z
    .string()
    .min(1, 'La matrícula inmobiliaria es obligatoria')
    .regex(/^[0-9\-]+$/, 'Solo números y guiones (Ej: 050-123456)'),
  nomenclatura: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,\-()°]+$/,
      'Solo letras, números, #, -, puntos, comas'
    ),
  area_lote: z
    .string()
    .min(1, 'El área del lote es obligatoria')
    .regex(/^\d+(\.\d{0,3})?$/, 'Solo números y hasta 3 decimales (Ej: 66.125)')
    .refine(
      val => !isNaN(Number(val)) && Number(val) > 0,
      'Debe ser un número mayor a 0'
    ),
  area_construida: z
    .string()
    .min(1, 'El área construida es obligatoria')
    .regex(/^\d+(\.\d{0,3})?$/, 'Solo números y hasta 3 decimales (Ej: 80.500)')
    .refine(
      val => !isNaN(Number(val)) && Number(val) > 0,
      'Debe ser un número mayor a 0'
    ),
  tipo_vivienda: z.enum(['Regular', 'Irregular']),
  // Paso 4
  valor_base: z.coerce.number().min(1, 'El valor base es obligatorio'),
  es_esquinera: z.boolean().default(false),
  recargo_esquinera: z.coerce.number().min(0).default(0),
})

export type ViviendaFormValues = ViviendaSchemaType

// ── Campos por paso (para trigger de validación parcial) ────────
export const FIELDS_PASO_1 = ['proyecto_id', 'manzana_id', 'numero'] as const
export const FIELDS_PASO_2 = [
  'lindero_norte',
  'lindero_sur',
  'lindero_oriente',
  'lindero_occidente',
] as const
export const FIELDS_PASO_3 = [
  'matricula_inmobiliaria',
  'nomenclatura',
  'area_lote',
  'area_construida',
  'tipo_vivienda',
] as const
export const FIELDS_PASO_4 = [
  'valor_base',
  'es_esquinera',
  'recargo_esquinera',
] as const
