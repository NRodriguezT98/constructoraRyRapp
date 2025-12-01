/**
 * 🔄 Servicio de Gestión de Conflictos de Viviendas
 *
 * Responsabilidad:
 * - Detectar viviendas inactivas con número/matrícula duplicados
 * - Validar si vivienda inactiva puede ser reutilizada
 * - Gestionar sobrescritura de vivienda inactiva
 * - Validar unicidad de matrícula en el proyecto
 *
 * Caso de uso: Usuario intenta crear Vivienda #3 pero ya existe inactiva
 */

import { supabase } from '@/lib/supabase/client'
import type { Vivienda } from '@/lib/supabase/database.types'

// ============================================================
// TIPOS
// ============================================================

export interface ConflictoViviendaInactiva {
  existeInactiva: boolean
  puedeReutilizar: boolean
  vivienda?: {
    id: string
    numero: string
    matricula_inmobiliaria: string | null
    direccion: string | null
    estado: string
    fecha_inactivacion: string | null
    motivo_inactivacion: string | null
  }
  razon?: string
  detalles?: {
    tieneNegociaciones: boolean
    tieneAbonos: boolean
    tieneDocumentos: boolean
  }
}

export interface ValidacionMatricula {
  esUnica: boolean
  viviendaDuplicada?: {
    id: string
    numero: string
    manzana: string
    estado: string
  }
}

export interface NuevosDatosVivienda {
  numero: string
  matricula_inmobiliaria?: string
  direccion?: string
  area_lote?: number
  area_construida?: number
  valor_base?: number
  descripcion?: string
}

// ============================================================
// SERVICIO
// ============================================================

export class ViviendaConflictosService {
  /**
   * Verificar si existe vivienda inactiva con el mismo número/matrícula
   * y si puede ser reutilizada (editada con nuevos datos)
   *
   * @param proyectoId - ID del proyecto
   * @param manzanaId - ID de la manzana
   * @param numero - Número de vivienda a verificar
   * @returns Información del conflicto y si puede resolverse
   */
  static async verificarViviendaInactivaReutilizable(
    proyectoId: string,
    manzanaId: string,
    numero: string
  ): Promise<ConflictoViviendaInactiva> {
    try {
      // Buscar vivienda inactiva con ese número
      const { data: vivienda, error } = await supabase
        .from('viviendas')
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('manzana_id', manzanaId)
        .eq('numero', numero)
        .eq('estado', 'Inactiva')
        .maybeSingle()

      if (error) throw error

      // No existe vivienda inactiva con ese número
      if (!vivienda) {
        return {
          existeInactiva: false,
          puedeReutilizar: false,
        }
      }

      // Verificar si tiene relaciones que impidan reutilización
      const { count: negociacionesCount } = await supabase
        .from('negociaciones')
        .select('*', { count: 'exact', head: true })
        .eq('vivienda_id', vivienda.id)

      const { count: abonosCount } = await supabase
        .from('abonos')
        .select('*', { count: 'exact', head: true })
        .eq('vivienda_id', vivienda.id)

      const { count: documentosCount } = await supabase
        .from('documentos_vivienda')
        .select('*', { count: 'exact', head: true })
        .eq('vivienda_id', vivienda.id)
        .eq('estado', 'activo')

      const tieneNegociaciones = (negociacionesCount || 0) > 0
      const tieneAbonos = (abonosCount || 0) > 0
      const tieneDocumentos = (documentosCount || 0) > 0

      // Si tiene negociaciones o abonos, NO puede reutilizarse
      if (tieneNegociaciones || tieneAbonos) {
        return {
          existeInactiva: true,
          puedeReutilizar: false,
          vivienda: {
            id: vivienda.id,
            numero: vivienda.numero,
            matricula_inmobiliaria: vivienda.matricula_inmobiliaria,
            direccion: vivienda.direccion,
            estado: vivienda.estado,
            fecha_inactivacion: vivienda.fecha_inactivacion,
            motivo_inactivacion: vivienda.motivo_inactivacion,
          },
          razon: `La vivienda #${numero} inactiva tiene ${
            negociacionesCount || 0
          } negociación(es) y ${abonosCount || 0} abono(s). No se puede reutilizar. Usa otro número o reactiva manualmente.`,
          detalles: {
            tieneNegociaciones,
            tieneAbonos,
            tieneDocumentos,
          },
        }
      }

      // Vivienda inactiva limpia, puede reutilizarse
      return {
        existeInactiva: true,
        puedeReutilizar: true,
        vivienda: {
          id: vivienda.id,
          numero: vivienda.numero,
          matricula_inmobiliaria: vivienda.matricula_inmobiliaria,
          direccion: vivienda.direccion,
          estado: vivienda.estado,
          fecha_inactivacion: vivienda.fecha_inactivacion,
          motivo_inactivacion: vivienda.motivo_inactivacion,
        },
        detalles: {
          tieneNegociaciones: false,
          tieneAbonos: false,
          tieneDocumentos,
        },
      }
    } catch (error) {
      console.error('❌ Error al verificar vivienda inactiva reutilizable:', error)
      throw error
    }
  }

  /**
   * Sobrescribir datos de vivienda inactiva con nuevos datos
   * (en lugar de crear una nueva)
   *
   * Proceso:
   * 1. Validar que vivienda esté inactiva y pueda reutilizarse
   * 2. UPDATE con nuevos datos
   * 3. Cambiar estado a Disponible
   * 4. Registrar en historial (opcional)
   *
   * @param viviendaId - ID de la vivienda inactiva
   * @param nuevosDatos - Nuevos datos a sobrescribir
   * @param userId - Usuario que realiza la acción
   */
  static async sobrescribirViviendaInactiva(
    viviendaId: string,
    nuevosDatos: NuevosDatosVivienda,
    userId: string
  ): Promise<Vivienda> {
    try {
      // Validar que vivienda esté inactiva
      const { data: vivienda, error: viviendaError } = await supabase
        .from('viviendas')
        .select('*')
        .eq('id', viviendaId)
        .eq('estado', 'Inactiva')
        .single()

      if (viviendaError) throw viviendaError

      if (!vivienda) {
        throw new Error('La vivienda no existe o no está inactiva')
      }

      // Actualizar con nuevos datos
      const { data: viviendaActualizada, error: updateError } = await supabase
        .from('viviendas')
        .update({
          numero: nuevosDatos.numero,
          matricula_inmobiliaria: nuevosDatos.matricula_inmobiliaria || vivienda.matricula_inmobiliaria,
          direccion: nuevosDatos.direccion || vivienda.direccion,
          area_lote: nuevosDatos.area_lote || vivienda.area_lote,
          area_construida: nuevosDatos.area_construida || vivienda.area_construida,
          valor_base: nuevosDatos.valor_base || vivienda.valor_base,
          descripcion: nuevosDatos.descripcion || vivienda.descripcion,
          estado: 'Disponible', // ← Reactivar automáticamente
          fecha_reactivacion: new Date().toISOString(),
          motivo_reactivacion: 'Reactivada automáticamente al sobrescribir datos desde conflicto de creación',
          reactivada_por: userId,
        })
        .eq('id', viviendaId)
        .select()
        .single()

      if (updateError) throw updateError

      // Registrar en historial (opcional)
      await supabase.from('viviendas_historial_estados').insert({
        vivienda_id: viviendaId,
        estado_anterior: 'Inactiva',
        estado_nuevo: 'Disponible',
        motivo: 'Sobrescritura desde conflicto de número duplicado',
        usuario_id: userId,
        metadata: {
          tipo_operacion: 'sobrescritura',
          datos_anteriores: {
            numero: vivienda.numero,
            matricula: vivienda.matricula_inmobiliaria,
            direccion: vivienda.direccion,
          },
          datos_nuevos: nuevosDatos,
        },
      })

      console.log(`✅ Vivienda ${viviendaId} sobrescrita y reactivada`)

      return viviendaActualizada as Vivienda
    } catch (error) {
      console.error('❌ Error al sobrescribir vivienda inactiva:', error)
      throw error
    }
  }

  /**
   * Validar que la matrícula inmobiliaria sea única en el proyecto
   * (excluyendo viviendas inactivas)
   *
   * @param matricula - Matrícula a validar
   * @param viviendaId - ID de vivienda a excluir (al editar)
   * @returns Validación de unicidad
   */
  static async validarMatriculaUnica(
    matricula: string,
    viviendaId?: string
  ): Promise<ValidacionMatricula> {
    try {
      if (!matricula || matricula.trim() === '') {
        return { esUnica: true } // Matrícula vacía es válida
      }

      let query = supabase
        .from('viviendas')
        .select(
          `
          id,
          numero,
          estado,
          manzanas (
            nombre
          )
        `
        )
        .eq('matricula_inmobiliaria', matricula.trim())
        .neq('estado', 'Inactiva') // Ignorar inactivas

      // Excluir vivienda actual (al editar)
      if (viviendaId) {
        query = query.neq('id', viviendaId)
      }

      const { data: duplicadas, error } = await query

      if (error) throw error

      if (!duplicadas || duplicadas.length === 0) {
        return { esUnica: true }
      }

      // Existe duplicada
      const duplicada = duplicadas[0]
      return {
        esUnica: false,
        viviendaDuplicada: {
          id: duplicada.id,
          numero: duplicada.numero,
          manzana: duplicada.manzanas?.nombre || 'Manzana desconocida',
          estado: duplicada.estado,
        },
      }
    } catch (error) {
      console.error('❌ Error al validar matrícula única:', error)
      throw error
    }
  }

  /**
   * Verificar conflictos al crear vivienda
   * (número duplicado en manzana)
   *
   * @param proyectoId - ID del proyecto
   * @param manzanaId - ID de la manzana
   * @param numero - Número de vivienda
   * @returns Si hay conflicto y vivienda inactiva reutilizable
   */
  static async verificarConflictoCreacion(
    proyectoId: string,
    manzanaId: string,
    numero: string
  ): Promise<ConflictoViviendaInactiva> {
    return this.verificarViviendaInactivaReutilizable(proyectoId, manzanaId, numero)
  }
}
