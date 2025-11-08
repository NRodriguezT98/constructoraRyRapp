/**
 * 🔐 SERVICIO: VALIDACIÓN DE DESEMBOLSOS
 *
 * Valida que los pasos del proceso estén completados antes de permitir
 * registrar desembolsos según la fuente de pago.
 *
 * REGLA DE NEGOCIO:
 * - Crédito Hipotecario → Requiere paso "Solicitud desembolso de Crédito hipotecario"
 * - Subsidio Caja → Requiere paso "Solicitud desembolso de subsidio de caja de compensación familiar"
 * - Mi Casa Ya → Requiere paso "Solicitud desembolso de subsidio de vivienda Mi Casa Ya"
 */

import { createBrowserClient } from '@supabase/ssr'

import type { TipoFuentePago } from '../types'

// ===================================
// MAPEO: FUENTE DE PAGO → PASO REQUERIDO
// ===================================

/**
 * Mapeo de tipos de fuente de pago a nombres exactos de pasos requeridos
 */
const PASOS_REQUERIDOS_POR_FUENTE: Record<string, string> = {
  'Crédito Hipotecario': 'Solicitud desembolso de Crédito hipotecario',
  'Subsidio Caja Compensación': 'Solicitud desembolso de subsidio de caja de compensación familiar',
  'Subsidio Mi Casa Ya': 'Solicitud desembolso de subsidio de vivienda Mi Casa Ya',
}

// ===================================
// INTERFACES
// ===================================

export interface ResultadoValidacion {
  permitido: boolean
  razon?: string
  pasoRequerido?: {
    nombre: string
    estado: string
    id?: string
  }
}

export interface ProcesoNegociacionDB {
  id: string
  negociacion_id: string
  nombre: string
  estado: string
  fecha_completado: string | null
}

// ===================================
// FUNCIONES PRINCIPALES
// ===================================

/**
 * Valida si se puede registrar un desembolso para una fuente de pago
 *
 * @param negociacionId - ID de la negociación
 * @param tipoFuente - Tipo de fuente de pago
 * @returns Resultado de la validación con mensaje si no está permitido
 */
export async function validarDesembolso(
  negociacionId: string,
  tipoFuente: TipoFuentePago
): Promise<ResultadoValidacion> {
  // Si es Cuota Inicial, no requiere validación de paso
  if (tipoFuente === 'Cuota Inicial') {
    return {
      permitido: true,
    }
  }

  // Obtener el nombre del paso requerido para esta fuente
  const nombrePasoRequerido = PASOS_REQUERIDOS_POR_FUENTE[tipoFuente]

  if (!nombrePasoRequerido) {
    console.warn(`⚠️ No hay paso configurado para la fuente: ${tipoFuente}`)
    return {
      permitido: true, // Si no está configurado, permitir (para no bloquear funcionalidad)
    }
  }

  // Verificar si el paso existe y está completado
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: paso, error } = await supabase
    .from('procesos_negociacion')
    .select('id, nombre, estado, fecha_completado')
    .eq('negociacion_id', negociacionId)
    .eq('nombre', nombrePasoRequerido)
    .single()

  if (error) {
    console.error('❌ Error al verificar paso del proceso:', error)

    // Si el paso no existe, no permitir el desembolso
    if (error.code === 'PGRST116') {
      return {
        permitido: false,
        razon: `El paso "${nombrePasoRequerido}" no existe en el proceso de esta negociación.`,
        pasoRequerido: {
          nombre: nombrePasoRequerido,
          estado: 'No Existe',
        },
      }
    }

    // Otros errores, permitir por seguridad (no bloquear operación)
    return {
      permitido: true,
    }
  }

  // Verificar si el paso está completado
  if (paso.estado !== 'Completado') {
    return {
      permitido: false,
      razon: `Debe completar el paso "${nombrePasoRequerido}" antes de registrar el desembolso de ${tipoFuente}.`,
      pasoRequerido: {
        id: paso.id,
        nombre: paso.nombre,
        estado: paso.estado,
      },
    }
  }

  // ✅ Validación exitosa
  return {
    permitido: true,
    pasoRequerido: {
      id: paso.id,
      nombre: paso.nombre,
      estado: paso.estado,
    },
  }
}

/**
 * Obtiene información del paso requerido sin validar
 * (útil para mostrar información previa)
 */
export async function obtenerInfoPasoRequerido(
  negociacionId: string,
  tipoFuente: TipoFuentePago
): Promise<ProcesoNegociacionDB | null> {
  if (tipoFuente === 'Cuota Inicial') {
    return null
  }

  const nombrePasoRequerido = PASOS_REQUERIDOS_POR_FUENTE[tipoFuente]
  if (!nombrePasoRequerido) {
    return null
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('procesos_negociacion')
    .select('id, negociacion_id, nombre, estado, fecha_completado')
    .eq('negociacion_id', negociacionId)
    .eq('nombre', nombrePasoRequerido)
    .maybeSingle()

  if (error) {
    console.error('Error al obtener info del paso:', error)
    return null
  }

  return data
}

/**
 * Verifica si una fuente de pago requiere validación de paso
 */
export function requiereValidacionPaso(tipoFuente: TipoFuentePago): boolean {
  return tipoFuente !== 'Cuota Inicial' && tipoFuente in PASOS_REQUERIDOS_POR_FUENTE
}

/**
 * Obtiene el nombre del paso requerido para una fuente de pago
 */
export function obtenerNombrePasoRequerido(tipoFuente: TipoFuentePago): string | null {
  return PASOS_REQUERIDOS_POR_FUENTE[tipoFuente] || null
}
