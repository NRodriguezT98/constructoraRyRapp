/**
 * 💤 Servicio de Inactivación de Viviendas (Soft Delete)
 *
 * Responsabilidad:
 * - Validar si una vivienda puede ser inactivada (soft delete)
 * - Marcar vivienda como inactiva con auditoría
 * - Reactivar viviendas inactivas con validaciones
 * - Registrar historial de cambios de estado
 *
 * Criterio: Solo Admin puede inactivar/reactivar viviendas
 */

import { supabase } from '@/lib/supabase/client'

// ============================================================
// TIPOS
// ============================================================

export interface ValidacionEliminacion {
  puedeEliminar: boolean
  razon?: string
  detalles?: {
    negociaciones: number
    abonos: number
    montoTotal: number
    documentos: number
  }
}

export interface ValidacionReactivacion {
  puedeReactivar: boolean
  razon?: string
  conflictos?: {
    viviendaDuplicada?: {
      id: string
      numero: string
      estado: string
    }
    proyectoInactivo?: boolean
  }
}

export interface MotivoInactivacion {
  motivo: string
  userId: string
}

export interface MotivoReactivacion {
  motivo: string
  userId: string
}

// ============================================================
// SERVICIO
// ============================================================

export class ViviendaInactivacionService {
  /**
   * Validar si una vivienda puede ser inactivada
   *
   * Criterios:
   * - NO debe tener negociaciones activas
   * - NO debe tener abonos registrados
   * - Opcionalmente: NO debe tener documentos importantes
   */
  static async validarEliminacion(viviendaId: string): Promise<ValidacionEliminacion> {
    try {
      // Contar negociaciones
      const { count: negociacionesCount, error: negError } = await supabase
        .from('negociaciones')
        .select('*', { count: 'exact', head: true })
        .eq('vivienda_id', viviendaId)

      if (negError) throw negError

      if (negociacionesCount && negociacionesCount > 0) {
        return {
          puedeEliminar: false,
          razon: `La vivienda tiene ${negociacionesCount} negociación(es). No se puede inactivar.`,
          detalles: {
            negociaciones: negociacionesCount,
            abonos: 0,
            montoTotal: 0,
            documentos: 0,
          },
        }
      }

      // Contar abonos
      const { data: abonos, error: abonosError } = await supabase
        .from('abonos')
        .select('monto_abono')
        .eq('vivienda_id', viviendaId)

      if (abonosError) throw abonosError

      const abonosCount = abonos?.length || 0
      const montoTotal = abonos?.reduce((sum, abono) => sum + (abono.monto_abono || 0), 0) || 0

      if (abonosCount > 0) {
        return {
          puedeEliminar: false,
          razon: `La vivienda tiene ${abonosCount} abono(s) por un total de $${montoTotal.toLocaleString()}. No se puede inactivar.`,
          detalles: {
            negociaciones: 0,
            abonos: abonosCount,
            montoTotal,
            documentos: 0,
          },
        }
      }

      // Contar documentos importantes (opcional)
      const { count: documentosCount, error: docsError } = await supabase
        .from('documentos_vivienda')
        .select('*', { count: 'exact', head: true })
        .eq('vivienda_id', viviendaId)
        .eq('es_importante', true)
        .eq('estado', 'activo')

      if (docsError) throw docsError

      // Vivienda limpia, puede inactivarse
      return {
        puedeEliminar: true,
        detalles: {
          negociaciones: 0,
          abonos: 0,
          montoTotal: 0,
          documentos: documentosCount || 0,
        },
      }
    } catch (error) {
      console.error('❌ Error al validar eliminación:', error)
      throw error
    }
  }

  /**
   * Marcar vivienda como inactiva (soft delete)
   *
   * Proceso:
   * 1. Validar que puede inactivarse
   * 2. UPDATE estado = 'Inactiva'
   * 3. Registrar auditoría (fecha, motivo, usuario)
   * 4. INSERT en viviendas_historial_estados
   */
  static async marcarComoInactiva(
    viviendaId: string,
    datos: MotivoInactivacion
  ): Promise<void> {
    try {
      // Validar que puede inactivarse
      const validacion = await this.validarEliminacion(viviendaId)

      if (!validacion.puedeEliminar) {
        throw new Error(validacion.razon)
      }

      // Validar motivo mínimo
      if (!datos.motivo || datos.motivo.trim().length < 50) {
        throw new Error('El motivo debe tener al menos 50 caracteres')
      }

      // Obtener estado actual
      const { data: vivienda, error: viviendaError } = await supabase
        .from('viviendas')
        .select('estado, contador_desactivaciones')
        .eq('id', viviendaId)
        .single()

      if (viviendaError) throw viviendaError

      const estadoAnterior = vivienda.estado
      const contadorActual = vivienda.contador_desactivaciones || 0

      // Actualizar vivienda
      const { error: updateError } = await supabase
        .from('viviendas')
        .update({
          estado: 'Inactiva',
          fecha_inactivacion: new Date().toISOString(),
          motivo_inactivacion: datos.motivo.trim(),
          inactivada_por: datos.userId,
          contador_desactivaciones: contadorActual + 1,
        })
        .eq('id', viviendaId)

      if (updateError) throw updateError

      // Registrar en historial
      const { error: historialError } = await supabase
        .from('viviendas_historial_estados')
        .insert({
          vivienda_id: viviendaId,
          estado_anterior: estadoAnterior,
          estado_nuevo: 'Inactiva',
          motivo: datos.motivo.trim(),
          usuario_id: datos.userId,
          metadata: {
            tipo_operacion: 'inactivacion',
            detalles_validacion: validacion.detalles,
          },
        })

      if (historialError) throw historialError

      console.log(`✅ Vivienda ${viviendaId} marcada como inactiva`)
    } catch (error) {
      console.error('❌ Error al marcar como inactiva:', error)
      throw error
    }
  }

  /**
   * Validar si una vivienda puede ser reactivada
   *
   * Criterios:
   * - Proyecto debe estar activo
   * - NO debe existir otra vivienda activa con el mismo número en la manzana
   */
  static async validarReactivacion(viviendaId: string): Promise<ValidacionReactivacion> {
    try {
      // Obtener datos de la vivienda
      const { data: vivienda, error: viviendaError } = await supabase
        .from('viviendas')
        .select(
          `
          numero,
          manzana_id,
          proyecto_id,
          proyectos (
            estado,
            archivado
          )
        `
        )
        .eq('id', viviendaId)
        .single()

      if (viviendaError) throw viviendaError

      // Validar proyecto activo
      if (vivienda.proyectos?.archivado || vivienda.proyectos?.estado !== 'en_proceso') {
        return {
          puedeReactivar: false,
          razon: 'El proyecto asociado está inactivo o no está en proceso',
          conflictos: {
            proyectoInactivo: true,
          },
        }
      }

      // Validar número duplicado
      const { data: duplicada, error: duplicadaError } = await supabase
        .from('viviendas')
        .select('id, numero, estado')
        .eq('manzana_id', vivienda.manzana_id)
        .eq('numero', vivienda.numero)
        .neq('id', viviendaId)
        .neq('estado', 'Inactiva')
        .maybeSingle()

      if (duplicadaError) throw duplicadaError

      if (duplicada) {
        return {
          puedeReactivar: false,
          razon: `Ya existe una vivienda activa con el número ${vivienda.numero} en esta manzana`,
          conflictos: {
            viviendaDuplicada: {
              id: duplicada.id,
              numero: duplicada.numero,
              estado: duplicada.estado,
            },
          },
        }
      }

      // Todo OK, puede reactivarse
      return {
        puedeReactivar: true,
      }
    } catch (error) {
      console.error('❌ Error al validar reactivación:', error)
      throw error
    }
  }

  /**
   * Reactivar vivienda (cambiar estado a Disponible)
   *
   * Proceso:
   * 1. Validar que puede reactivarse
   * 2. UPDATE estado = 'Disponible'
   * 3. Registrar auditoría (fecha, motivo, usuario)
   * 4. INSERT en viviendas_historial_estados
   */
  static async reactivarVivienda(
    viviendaId: string,
    datos: MotivoReactivacion
  ): Promise<void> {
    try {
      // Validar que puede reactivarse
      const validacion = await this.validarReactivacion(viviendaId)

      if (!validacion.puedeReactivar) {
        throw new Error(validacion.razon)
      }

      // Validar motivo mínimo
      if (!datos.motivo || datos.motivo.trim().length < 30) {
        throw new Error('El motivo debe tener al menos 30 caracteres')
      }

      // Actualizar vivienda
      const { error: updateError } = await supabase
        .from('viviendas')
        .update({
          estado: 'Disponible',
          fecha_reactivacion: new Date().toISOString(),
          motivo_reactivacion: datos.motivo.trim(),
          reactivada_por: datos.userId,
        })
        .eq('id', viviendaId)

      if (updateError) throw updateError

      // Registrar en historial
      const { error: historialError } = await supabase
        .from('viviendas_historial_estados')
        .insert({
          vivienda_id: viviendaId,
          estado_anterior: 'Inactiva',
          estado_nuevo: 'Disponible',
          motivo: datos.motivo.trim(),
          usuario_id: datos.userId,
          metadata: {
            tipo_operacion: 'reactivacion',
          },
        })

      if (historialError) throw historialError

      console.log(`✅ Vivienda ${viviendaId} reactivada`)
    } catch (error) {
      console.error('❌ Error al reactivar vivienda:', error)
      throw error
    }
  }
}
