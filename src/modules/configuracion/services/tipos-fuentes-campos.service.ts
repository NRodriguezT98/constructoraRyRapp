/**
 * Service: Gestión de Configuración de Campos Dinámicos
 *
 * Maneja la carga y actualización de configuraciones de campos
 * para tipos de fuentes de pago.
 */

import { supabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import { logger } from '@/lib/utils/logger'

import type {
  ConfiguracionCampos,
  TipoFuentePagoConCampos,
} from '../types/campos-dinamicos.types'

// ============================================
// CARGAR TIPOS CON CONFIGURACIÓN DE CAMPOS
// ============================================

/**
 * Carga todos los tipos de fuentes activas con su configuración de campos
 */
export async function cargarTiposFuentesConCampos() {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) {
    logger.error('❌ Error al cargar tipos de fuentes con campos:', error)
    throw new Error(`Error al cargar configuración: ${error.message}`)
  }

  // ✅ Cast JSON to ConfiguracionCampos
  return data.map(tipo => ({
    ...tipo,
    configuracion_campos:
      tipo.configuracion_campos as unknown as ConfiguracionCampos,
  })) as unknown as TipoFuentePagoConCampos[]
}

/**
 * Carga un tipo específico con su configuración
 */
export async function cargarTipoFuenteConCampos(tipoId: string) {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('*')
    .eq('id', tipoId)
    .single()

  if (error) {
    logger.error(`❌ Error al cargar tipo ${tipoId}:`, error)
    throw new Error(`Error al cargar tipo: ${error.message}`)
  }

  // ✅ Cast JSON to ConfiguracionCampos
  return {
    ...data,
    configuracion_campos:
      data.configuracion_campos as unknown as ConfiguracionCampos,
  } as unknown as TipoFuentePagoConCampos
}

// ============================================
// ACTUALIZAR CONFIGURACIÓN DE CAMPOS
// ============================================

/**
 * Actualiza la configuración de campos de un tipo de fuente
 */
export async function actualizarConfiguracionCampos(
  tipoId: string,
  configuracion: ConfiguracionCampos
) {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .update({
      configuracion_campos: configuracion as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tipoId)
    .select()
    .single()

  if (error) {
    logger.error('❌ Error al actualizar configuración:', error)
    throw new Error(`Error al guardar configuración: ${error.message}`)
  }

  return {
    ...data,
    configuracion_campos:
      data.configuracion_campos as unknown as ConfiguracionCampos,
  } as unknown as TipoFuentePagoConCampos
}

// ============================================
// VALIDAR CONFIGURACIÓN
// ============================================

/**
 * Valida que una configuración de campos sea correcta
 */
export function validarConfiguracionCampos(config: ConfiguracionCampos): {
  valido: boolean
  errores: string[]
} {
  const errores: string[] = []

  if (!config.campos || !Array.isArray(config.campos)) {
    errores.push('La configuración debe tener un array de campos')
    return { valido: false, errores }
  }

  config.campos.forEach((campo, index) => {
    if (!campo.nombre) {
      errores.push(`Campo ${index + 1}: falta nombre`)
    }
    if (!campo.tipo) {
      errores.push(`Campo ${index + 1}: falta tipo`)
    }
    if (!campo.label) {
      errores.push(`Campo ${index + 1}: falta label`)
    }
    if (typeof campo.requerido !== 'boolean') {
      errores.push(`Campo ${index + 1}: requerido debe ser boolean`)
    }
    if (typeof campo.orden !== 'number') {
      errores.push(`Campo ${index + 1}: orden debe ser número`)
    }
  })

  return {
    valido: errores.length === 0,
    errores,
  }
}
