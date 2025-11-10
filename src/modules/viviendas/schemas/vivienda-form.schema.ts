/**
 * SCHEMAS DE VALIDACIÓN - VIVIENDA
 *
 * CAPA 1: Validación síncrona con Zod
 * Solo valida estructura y formato, NO duplicados en BD
 */

import { z } from 'zod'

// ============================================================================
// SCHEMAS POR PASO
// ============================================================================

export const ubicacionSchema = z.object({
  proyecto_id: z.string().uuid('Proyecto inválido'),
  manzana_id: z.string().uuid('Manzana inválida'),
  numero_casa: z.string().min(1, 'Número de casa requerido'),
  lote: z.string().optional(),
  area_terreno: z.coerce.number().positive('Área debe ser positiva'),
  area_construccion: z.coerce.number().positive('Área debe ser positiva'),
})

export const legalSchema = z.object({
  numero_matricula: z.string()
    .min(5, 'Mínimo 5 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),
  cedula_catastral: z.string().optional(),
  linderos: z.object({
    norte: z.string().min(1, 'Lindero norte requerido'),
    sur: z.string().min(1, 'Lindero sur requerido'),
    este: z.string().min(1, 'Lindero este requerido'),
    oeste: z.string().min(1, 'Lindero oeste requerido'),
  }),
})

export const financieroSchema = z.object({
  valor_base: z.coerce.number().positive('Valor debe ser positivo'),
  valor_separacion: z.coerce.number().min(0, 'Valor no puede ser negativo'),
  valor_inicial: z.coerce.number().min(0, 'Valor no puede ser negativo'),
  valor_saldo: z.coerce.number().min(0, 'Valor no puede ser negativo'),
  cuotas_cantidad: z.coerce.number().int().positive('Debe haber al menos 1 cuota'),
  cuotas_valor: z.coerce.number().positive('Valor de cuota debe ser positivo'),
  tasa_interes: z.coerce.number().min(0, 'Tasa no puede ser negativa').max(100, 'Tasa máxima 100%'),
})

// ============================================================================
// SCHEMA COMPLETO
// ============================================================================

export const viviendaFormSchema = z.object({
  ...ubicacionSchema.shape,
  ...legalSchema.shape,
  ...financieroSchema.shape,
})

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type UbicacionFormData = z.infer<typeof ubicacionSchema>
export type LegalFormData = z.infer<typeof legalSchema>
export type FinancieroFormData = z.infer<typeof financieroSchema>
export type ViviendaFormData = z.infer<typeof viviendaFormSchema>
