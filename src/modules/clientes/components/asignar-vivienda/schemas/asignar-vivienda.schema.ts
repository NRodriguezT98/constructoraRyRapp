/**
 * Schemas de validación para Asignar Vivienda
 * ✅ Zod + React Hook Form (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Validación por paso (Paso 1, Paso 2, Paso 3)
 * ✅ Mensajes de error en español
 */

import { z } from 'zod'

// ============================================
// PASO 1: INFORMACIÓN BÁSICA
// ============================================

export const paso1Schema = z.object({
  proyecto_id: z
    .string()
    .min(1, 'Debes seleccionar un proyecto'),

  vivienda_id: z
    .string()
    .min(1, 'Debes seleccionar una vivienda'),

  valor_negociado: z
    .number()
    .positive('El valor debe ser mayor a 0'),

  descuento_aplicado: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .optional()
    .default(0),

  notas: z
    .string()
    .optional()
    .default(''),
})
.refine(
  (data) => {
    // Validar que descuento < valor_negociado
    if (data.descuento_aplicado && data.descuento_aplicado >= data.valor_negociado) {
      return false
    }
    return true
  },
  {
    message: 'El descuento no puede ser mayor o igual al valor de la vivienda',
    path: ['descuento_aplicado'],
  }
)

export type Paso1FormData = z.infer<typeof paso1Schema>

// ============================================
// PASO 2: FUENTES DE PAGO
// ============================================

const fuentePagoConfigSchema = z.object({
  tipo: z.enum([
    'Cuota Inicial',
    'Crédito Hipotecario',
    'Subsidio Mi Casa Ya',
    'Subsidio Caja Compensación',
  ]),

  monto_aprobado: z
    .number()
    .positive('El monto debe ser mayor a 0'),

  permite_multiples_abonos: z
    .boolean()
    .default(false),

  entidad: z
    .string()
    .optional(),

  numero_referencia: z
    .string()
    .optional(),
})

// Validar campos requeridos según tipo de fuente
const fuentePagoValidadaSchema = fuentePagoConfigSchema.refine(
  (data) => {
    // Cuota Inicial: NO requiere entidad ni número de referencia
    if (data.tipo === 'Cuota Inicial') {
      return true
    }

    // Otras fuentes: SÍ requieren entidad y número de referencia
    const tieneEntidad = data.entidad && data.entidad.trim() !== ''
    const tieneNumeroReferencia = data.numero_referencia && data.numero_referencia.trim() !== ''

    return tieneEntidad && tieneNumeroReferencia
  },
  {
    message: 'Debes completar entidad y número de referencia para este tipo de fuente',
    path: ['entidad'],
  }
)

export const paso2Schema = z.object({
  fuentes: z
    .array(fuentePagoValidadaSchema)
    .min(1, 'Debes configurar al menos una fuente de pago'),

  valor_total: z
    .number()
    .positive('El valor total debe ser mayor a 0'),
})
.refine(
  (data) => {
    // Validar que la suma de fuentes sea exactamente el valor total
    const sumaFuentes = data.fuentes.reduce((acc, f) => acc + f.monto_aprobado, 0)
    return Math.abs(sumaFuentes - data.valor_total) < 0.01 // Tolerancia para decimales
  },
  {
    message: 'La suma de las fuentes debe ser exactamente el valor total',
    path: ['fuentes'],
  }
)

export type Paso2FormData = z.infer<typeof paso2Schema>
export type FuentePagoFormData = z.infer<typeof fuentePagoConfigSchema>

// ============================================
// SCHEMA COMPLETO (TODOS LOS PASOS)
// ============================================

export const asignarViviendaSchema = z.object({
  ...paso1Schema.shape,
  ...paso2Schema.shape,
})

export type AsignarViviendaFormData = z.infer<typeof asignarViviendaSchema>
