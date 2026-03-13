/**
 * ============================================
 * SERVICIO: Pasos de Validación de Fuentes de Pago
 * ============================================
 *
 * Servicio para gestionar pasos de validación que deben
 * completarse antes de registrar desembolsos.
 *
 * SEPARACIÃ“N DE RESPONSABILIDADES:
 * - Este servicio SOLO hace llamadas a la API
 * - NO maneja estado (React Query lo hace)
 * - NO maneja UI (componentes lo hacen)
 *
 * @version 1.0.0 - 2025-12-11
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB } from '@/lib/utils/date.utils'
import type {
    CrearPasosDTO,
    MarcarPasoCompletadoDTO,
    PasoFuentePago,
    ProgresoFuentePago,
    ValidacionPreDesembolso
} from '../types'

// ============================================
// CONSULTAS (READ)
// ============================================

/**
 * Obtener pasos de validación de una fuente de pago
 */
export async function obtenerPasosFuentePago(fuenteId: string): Promise<PasoFuentePago[]> {
  try {
    const { data, error } = await supabase
      .from('pasos_fuente_pago')
      .select(`
        *,
        documento:documento_id (
          id,
          titulo,
          url_storage,
          fecha_documento
        )
      `)
      .eq('fuente_pago_id', fuenteId)
      .order('orden', { ascending: true })

    if (error) {
      console.error('âŒ Error obteniendo pasos de fuente:', error)
      throw new Error(`Error al obtener pasos: ${error.message}`)
    }

    return (data || []) as unknown as PasoFuentePago[]
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en obtenerPasosFuentePago:', mensaje)
    throw error
  }
}

/**
 * Calcular progreso de validación de una fuente de pago
 */
export async function calcularProgresoFuentePago(fuenteId: string): Promise<ProgresoFuentePago> {
  try {
    const { data, error } = await supabase
      .rpc('calcular_progreso_fuente_pago', { p_fuente_id: fuenteId })
      .single()

    if (error) {
      console.error('âŒ Error calculando progreso:', error)
      throw new Error(`Error al calcular progreso: ${error.message}`)
    }

    return data as ProgresoFuentePago
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en calcularProgresoFuentePago:', mensaje)
    throw error
  }
}

/**
 * Validar si una fuente de pago puede desembolsar.
 * Incluye reconciliación automática: si hay requisitos nuevos sin paso correspondiente,
 * los inserta como pendientes antes de validar.
 */
export async function validarPreDesembolso(fuenteId: string): Promise<ValidacionPreDesembolso> {
  try {
    // Obtener pasos de la fuente
    let pasos = await obtenerPasosFuentePago(fuenteId)

    // Obtener tipo de fuente
    const { data: fuente, error: errorFuente } = await supabase
      .from('fuentes_pago')
      .select('tipo')
      .eq('id', fuenteId)
      .single()

    if (errorFuente || !fuente) {
      throw new Error('Fuente de pago no encontrada')
    }

    // âœ… Obtener requisitos desde base de datos (configuración dinámica)
    const { data: requisitos, error: errorRequisitos } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,orden,activo,version')
      .eq('tipo_fuente', fuente.tipo)
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (errorRequisitos) {
      throw new Error(`Error al obtener requisitos: ${errorRequisitos.message}`)
    }

    if (!requisitos || requisitos.length === 0) {
      // Si no hay requisitos, la fuente está siempre lista
      return {
        valido: true,
        errores: [],
        pasos_pendientes: [],
      }
    }

    // 🔄 RECONCILIACIÓN: insertar pasos para requisitos agregados después de crear la fuente
    const existingPasoIds = new Set(pasos.map(p => p.paso))
    const requisitosNuevos = requisitos.filter(r => !existingPasoIds.has(r.paso_identificador))

    if (requisitosNuevos.length > 0) {
      const pasosAInsertar = requisitosNuevos.map(req => ({
        fuente_pago_id: fuenteId,
        paso: req.paso_identificador,
        titulo: req.titulo,
        descripcion: req.descripcion || null,
        nivel_validacion: req.nivel_validacion,
        tipo_documento_requerido: req.tipo_documento_sugerido || null,
        categoria_documento_requerida: req.categoria_documento || null,
        orden: req.orden,
        completado: false,
        completado_automaticamente: false,
      }))

      const { error: errorInsert } = await supabase.from('pasos_fuente_pago').insert(pasosAInsertar)

      if (!errorInsert) {
        // Refrescar lista para incluir los pasos recién creados
        pasos = await obtenerPasosFuentePago(fuenteId)
      }
    }

    // Validar cada requisito
    const errores: string[] = []
    const pasos_pendientes: ValidacionPreDesembolso['pasos_pendientes'] = []

    for (const req of requisitos) {
      const pasoActual = pasos.find(p => p.paso === req.paso_identificador)

      // Verificar que el paso existe
      if (!pasoActual) {
        errores.push(`âŒ Paso no encontrado: ${req.titulo}`)
        pasos_pendientes.push({
          paso: req.paso_identificador,
          titulo: req.titulo,
          razon: 'Paso no inicializado en el sistema',
        })
        continue
      }

      // Verificar que está completado
      if (!pasoActual.completado) {
        errores.push(`âŒ Falta completar: ${req.titulo}`)
        pasos_pendientes.push({
          paso: req.paso_identificador,
          titulo: req.titulo,
          razon: 'Paso no completado',
        })
        continue
      }

      // Si es DOCUMENTO_OBLIGATORIO, verificar que exista el documento
      if (req.nivel_validacion === 'DOCUMENTO_OBLIGATORIO' && !pasoActual.documento_id) {
        errores.push(`âŒ ${req.titulo}: Documento obligatorio no subido`)
        pasos_pendientes.push({
          paso: req.paso_identificador,
          titulo: req.titulo,
          razon: 'Documento obligatorio faltante',
        })
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      pasos_pendientes,
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en validarPreDesembolso:', mensaje)
    throw error
  }
}

// ============================================
// MUTACIONES (WRITE)
// ============================================

/**
 * Crear pasos de validación para una fuente de pago
 */
export async function crearPasosFuentePago(datos: CrearPasosDTO): Promise<PasoFuentePago[]> {
  try {
    const { fuente_pago_id, tipo_fuente } = datos

    // âœ… Obtener requisitos desde base de datos (configuración dinámica)
    const { data: requisitos, error: errorRequisitos } = await supabase
      .from('requisitos_fuentes_pago_config')
      .select('id,tipo_fuente,paso_identificador,titulo,descripcion,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,orden,activo,version')
      .eq('tipo_fuente', tipo_fuente)
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (errorRequisitos) {
      console.error('âŒ Error obteniendo requisitos:', errorRequisitos)
      throw new Error(`Error al obtener requisitos: ${errorRequisitos.message}`)
    }

    if (!requisitos || requisitos.length === 0) {
      return []
    }

    // Mapear requisitos a inserts
    const pasosACrear = requisitos.map(req => ({
      fuente_pago_id,
      paso: req.paso_identificador,
      titulo: req.titulo,
      descripcion: req.descripcion || null,
      nivel_validacion: req.nivel_validacion,
      tipo_documento_requerido: req.tipo_documento_sugerido || null,
      categoria_documento_requerida: req.categoria_documento || null,
      orden: req.orden,
      completado: false,
      completado_automaticamente: false,
    }))

    // Insertar en BD
    const { data, error } = await supabase
      .from('pasos_fuente_pago')
      .insert(pasosACrear)
      .select()

    if (error) {
      console.error('âŒ Error creando pasos:', error)
      throw new Error(`Error al crear pasos: ${error.message}`)
    }


    return data as PasoFuentePago[]
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en crearPasosFuentePago:', mensaje)
    throw error
  }
}

/**
 * Marcar un paso como completado
 */
export async function marcarPasoCompletado(datos: MarcarPasoCompletadoDTO): Promise<PasoFuentePago> {
  try {
    const { pasoId, fecha_completado, documento_id, observaciones } = datos

    // Actualizar paso
    const { data, error } = await supabase
      .from('pasos_fuente_pago')
      .update({
        completado: true,
        fecha_completado: formatDateForDB(fecha_completado),
        documento_id: documento_id || null,
        observaciones: observaciones || null,
        completado_automaticamente: false,
        usuario_completo_id: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pasoId)
      .select()
      .single()

    if (error) {
      console.error('âŒ Error marcando paso como completado:', error)
      throw new Error(`Error al completar paso: ${error.message}`)
    }


    return data as PasoFuentePago
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en marcarPasoCompletado:', mensaje)
    throw error
  }
}

/**
 * Editar/reabrir un paso completado
 */
export async function editarPasoFuentePago(
  pasoId: string,
  datos: {
    completado?: boolean
    fecha_completado?: string | null
    documento_id?: string | null
    observaciones?: string
  }
): Promise<PasoFuentePago> {
  try {
    const updateData: any = {
      ...datos,
      updated_at: new Date().toISOString(),
    }

    // Si se está marcando como no completado, limpiar fecha
    if (datos.completado === false) {
      updateData.fecha_completado = null
      updateData.completado_automaticamente = false
    }

    // Formatear fecha si viene
    if (datos.fecha_completado) {
      updateData.fecha_completado = formatDateForDB(datos.fecha_completado)
    }

    const { data, error } = await supabase
      .from('pasos_fuente_pago')
      .update(updateData)
      .eq('id', pasoId)
      .select()
      .single()

    if (error) {
      console.error('âŒ Error editando paso:', error)
      throw new Error(`Error al editar paso: ${error.message}`)
    }


    return data as PasoFuentePago
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido'
    console.error('âŒ [PASOS] Error en editarPasoFuentePago:', mensaje)
    throw error
  }
}
