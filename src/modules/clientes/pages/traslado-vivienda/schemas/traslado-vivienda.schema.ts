/**
 * Schema de validación para Traslado de Vivienda
 *
 * Paso 1: Motivo y autorización
 * Paso 2: Vivienda destino y fuentes de pago
 */

import { z } from 'zod'

export const trasladoViviendaSchema = z.object({
  // Paso 1
  motivo: z
    .string()
    .min(20, 'El motivo debe tener al menos 20 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
  autorizado_por: z
    .string()
    .min(3, 'Nombre de quien autoriza es requerido')
    .max(100, 'Máximo 100 caracteres'),

  // Paso 2
  proyecto_destino_id: z.string().min(1, 'Selecciona un proyecto'),
  vivienda_destino_id: z.string().min(1, 'Selecciona una vivienda'),
  valor_negociado: z.number().positive('El valor debe ser positivo'),

  // Descuento (opcional)
  aplicar_descuento: z.boolean().default(false),
  descuento_aplicado: z.number().min(0).default(0),
  tipo_descuento: z.string().optional(),
  motivo_descuento: z.string().optional(),
})

export type TrasladoViviendaFormData = z.infer<typeof trasladoViviendaSchema>
