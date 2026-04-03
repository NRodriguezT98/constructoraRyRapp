/**
 * Schemas de validación para Asignar Vivienda
 * ✅ Zod + React Hook Form (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Validación por paso (Paso 1, Paso 2, Paso 3)
 * ✅ Mensajes de error en español
 * ✅ Sistema de descuentos con tipo/motivo
 */

import { z } from 'zod'

import { esCuotaInicial } from '@/shared/constants/fuentes-pago.constants'

// ============================================
// PASO 1: INFORMACIÓN BÁSICA
// ============================================

export const paso1Schema = z
  .object({
    proyecto_id: z.string().min(1, 'Debes seleccionar un proyecto'),

    vivienda_id: z.string().min(1, 'Debes seleccionar una vivienda'),

    valor_negociado: z.number().positive('El valor debe ser mayor a 0'),

    aplicar_descuento: z.boolean().optional(),

    descuento_aplicado: z
      .number()
      .min(0, 'El descuento no puede ser negativo')
      .optional(),

    tipo_descuento: z.string().optional(),

    motivo_descuento: z.string().optional(),

    valor_escritura_publica: z.number().positive('El valor debe ser mayor a 0'),

    notas: z.string().optional(),

    fecha_negociacion: z.string().optional(),
  })
  .refine(
    data => {
      // Validar que descuento < valor_negociado
      if (
        data.descuento_aplicado &&
        data.descuento_aplicado >= data.valor_negociado
      ) {
        return false
      }
      return true
    },
    {
      message:
        'El descuento no puede ser mayor o igual al valor de la vivienda',
      path: ['descuento_aplicado'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, monto es obligatorio
      if (
        data.aplicar_descuento &&
        (!data.descuento_aplicado || data.descuento_aplicado <= 0)
      ) {
        return false
      }
      return true
    },
    {
      message: 'Debes ingresar un monto de descuento',
      path: ['descuento_aplicado'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, tipo es obligatorio
      if (data.aplicar_descuento && !data.tipo_descuento) {
        return false
      }
      return true
    },
    {
      message: 'Debes seleccionar un tipo de descuento',
      path: ['tipo_descuento'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, motivo es obligatorio (min 10 chars)
      if (data.aplicar_descuento) {
        if (
          !data.motivo_descuento ||
          data.motivo_descuento.trim().length < 10
        ) {
          return false
        }
      }
      return true
    },
    {
      message: 'El motivo debe tener al menos 10 caracteres',
      path: ['motivo_descuento'],
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

  monto_aprobado: z.number().positive('El monto debe ser mayor a 0'),

  permite_multiples_abonos: z.boolean().optional(),

  entidad: z.string().optional(),

  numero_referencia: z.string().optional(),
})

// Validar campos requeridos según tipo de fuente
const fuentePagoValidadaSchema = fuentePagoConfigSchema.refine(
  data => {
    // Cuota Inicial: NO requiere entidad ni número de referencia
    if (esCuotaInicial(data.tipo)) {
      return true
    }

    // Otras fuentes: SÍ requieren entidad y número de referencia
    const tieneEntidad = data.entidad && data.entidad.trim() !== ''
    const tieneNumeroReferencia =
      data.numero_referencia && data.numero_referencia.trim() !== ''

    return tieneEntidad && tieneNumeroReferencia
  },
  {
    message:
      'Debes completar entidad y número de referencia para este tipo de fuente',
    path: ['entidad'],
  }
)

export const paso2Schema = z
  .object({
    fuentes: z
      .array(fuentePagoValidadaSchema)
      .min(1, 'Debes configurar al menos una fuente de pago'),

    valor_total: z.number().positive('El valor total debe ser mayor a 0'),
  })
  .refine(
    data => {
      // Validar que la suma de fuentes sea exactamente el valor total
      const sumaFuentes = data.fuentes.reduce(
        (acc, f) => acc + f.monto_aprobado,
        0
      )
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

export const asignarViviendaSchema = z
  .object({
    ...paso1Schema.shape,
    ...paso2Schema.shape,
  })
  // ✅ CRÍTICO: Aplicar las validaciones del paso 1 que se pierden con .shape
  .refine(
    data => {
      // Validar que descuento < valor_negociado
      if (
        data.descuento_aplicado &&
        data.descuento_aplicado >= data.valor_negociado
      ) {
        return false
      }
      return true
    },
    {
      message:
        'El descuento no puede ser mayor o igual al valor de la vivienda',
      path: ['descuento_aplicado'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, monto es obligatorio
      if (
        data.aplicar_descuento &&
        (!data.descuento_aplicado || data.descuento_aplicado <= 0)
      ) {
        return false
      }
      return true
    },
    {
      message: 'Debes ingresar un monto de descuento',
      path: ['descuento_aplicado'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, tipo es obligatorio
      if (data.aplicar_descuento && !data.tipo_descuento) {
        return false
      }
      return true
    },
    {
      message: 'Debes seleccionar un tipo de descuento',
      path: ['tipo_descuento'],
    }
  )
  .refine(
    data => {
      // Si checkbox marcado, motivo es obligatorio (min 10 chars)
      if (data.aplicar_descuento) {
        if (
          !data.motivo_descuento ||
          data.motivo_descuento.trim().length < 10
        ) {
          return false
        }
      }
      return true
    },
    {
      message: 'El motivo debe tener al menos 10 caracteres',
      path: ['motivo_descuento'],
    }
  )

export type AsignarViviendaFormData = z.infer<typeof asignarViviendaSchema>
