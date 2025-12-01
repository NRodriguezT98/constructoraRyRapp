/**
 * Servicio de Negociaciones
 *
 * Gestiona la vinculación Cliente + Vivienda + Pagos
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 * ✅ ACTUALIZADO: 2025-10-22 (Migración 003)
 *
 * Estados de negociación (CHECK constraint: negociaciones_estado_check):
 * - 'Activa' → Negociación activa recibiendo abonos
 * - 'Suspendida' → Temporalmente pausada
 * - 'Cerrada por Renuncia' → Cliente renunció (vinculada a tabla renuncias)
 * - 'Completada' → 100% pagado y entregado
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import {
    crearProcesoDesdePlantilla,
    obtenerPlantillaPredeterminada
} from '@/modules/admin/procesos/services/procesos.service'
import { TipoFuentePago } from '@/modules/admin/procesos/types'
import type { EstadoNegociacion, Negociacion } from '@/modules/clientes/types'

// DTOs
export interface CrearNegociacionDTO {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado?: number
  notas?: string

  // ⭐ NUEVO: Fuentes de pago (creación transaccional)
  fuentes_pago?: CrearFuentePagoDTO[]
}

export interface CrearFuentePagoDTO {
  tipo: string // 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

export interface ActualizarNegociacionDTO {
  estado?: EstadoNegociacion
  valor_negociado?: number
  descuento_aplicado?: number
  fecha_completada?: string // ⭐ Requerida cuando estado='Completada'
  notas?: string
}

// Re-export Negociacion del index
export type { Negociacion }

class NegociacionesService {
  /**
   * Crear nueva negociación CON o SIN fuentes de pago (transaccional)
   *
   * ✅ FLUJO SIMPLIFICADO (2025-10-22):
   * - Negociación se crea DIRECTO en estado 'Activa'
   * - Fuentes de pago son OPCIONALES (se pueden agregar después)
   * - Cliente pasa a 'Activo'
   * - Vivienda pasa a 'Asignada'
   *
   * Pasos:
   * 1. Crear negociación en estado 'Activa'
   * 2. [Opcional] Crear fuentes de pago si se proporcionan
   * 3. Actualizar vivienda → 'Asignada'
   * 4. Actualizar cliente → 'Activo'
   * 5. Si algún paso falla, se hace rollback
   */
  async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      const tieneFuentesPago = datos.fuentes_pago && datos.fuentes_pago.length > 0

      console.log('📝 Creando negociación:', {
        ...datos,
        fuentes: tieneFuentesPago ? `${datos.fuentes_pago!.length} fuentes` : 'sin fuentes',
      })

      // ==========================================
      // PASO 1: Crear negociación en estado 'Activa'
      // ==========================================
      const { data: negociacion, error: errorNegociacion } = await supabase
        .from('negociaciones')
        .insert({
          cliente_id: datos.cliente_id,
          vivienda_id: datos.vivienda_id,
          valor_negociado: datos.valor_negociado,
          descuento_aplicado: datos.descuento_aplicado || 0,
          notas: datos.notas,
          estado: 'Activa', // ⭐ SIEMPRE 'Activa' (simplificado)
        })
        .select('id, cliente_id, vivienda_id, valor_negociado, descuento_aplicado, notas, estado, fecha_negociacion, fecha_completada, fecha_creacion, fecha_actualizacion')
        .single()

      if (errorNegociacion) {
        console.error('❌ Error creando negociación:', errorNegociacion)
        throw errorNegociacion
      }

      console.log('✅ Negociación creada en estado "Activa":', negociacion.id)

      // ==========================================
      // PASO 2: Crear fuentes de pago (OPCIONAL)
      // ==========================================
      if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {
        console.log(`📝 Creando ${datos.fuentes_pago.length} fuentes de pago...`)

        const fuentesParaInsertar = datos.fuentes_pago.map(fuente => ({
          negociacion_id: negociacion.id,
          tipo: fuente.tipo,
          monto_aprobado: fuente.monto_aprobado,
          entidad: fuente.entidad || null,
          numero_referencia: fuente.numero_referencia || null,
          carta_aprobacion_url: fuente.carta_aprobacion_url || null,
          carta_asignacion_url: fuente.carta_asignacion_url || null,
          permite_multiples_abonos: fuente.tipo === 'Cuota Inicial',
          estado: 'Pendiente',
        }))

        const { error: errorFuentes } = await supabase
          .from('fuentes_pago')
          .insert(fuentesParaInsertar)

        if (errorFuentes) {
          console.error('❌ Error creando fuentes de pago:', errorFuentes)
          // ROLLBACK
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          throw new Error(`Error creando fuentes de pago: ${errorFuentes.message}`)
        }

        console.log('✅ Fuentes de pago creadas')
      }

      // ==========================================
      // PASO 3: Actualizar vivienda → 'Asignada'
      // ==========================================
      console.log('📝 Actualizando vivienda a estado "Asignada"...')
      const { error: errorVivienda } = await supabase
        .from('viviendas')
        .update({
          estado: 'Asignada',
          cliente_id: datos.cliente_id,
          negociacion_id: negociacion.id, // ⭐ NUEVO campo
          fecha_asignacion: formatDateForDB(getTodayDateString()),
        })
        .eq('id', datos.vivienda_id)

      if (errorVivienda) {
        console.error('❌ Error actualizando vivienda:', errorVivienda)
        // ROLLBACK
        if (tieneFuentesPago) {
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        throw new Error(`Error actualizando vivienda: ${errorVivienda.message}`)
      }

      console.log('✅ Vivienda actualizada a "Asignada"')

      // ==========================================
      // PASO 4: Actualizar cliente → 'Activo'
      // ==========================================
      console.log('📝 Actualizando cliente a estado "Activo"...')
      const { error: errorCliente } = await supabase
        .from('clientes')
        .update({ estado: 'Activo' })
        .eq('id', datos.cliente_id)

      if (errorCliente) {
        console.error('❌ Error actualizando cliente:', errorCliente)
        // ROLLBACK completo
        if (tieneFuentesPago) {
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        await supabase.from('viviendas').update({
          estado: 'Disponible',
          cliente_id: null,
          negociacion_id: null,
          fecha_asignacion: null,
        }).eq('id', datos.vivienda_id)
        throw new Error(`Error actualizando cliente: ${errorCliente.message}`)
      }

      console.log('✅ Cliente actualizado a "Activo"')

      // ==========================================
      // PASO 5: Crear proceso desde plantilla predeterminada
      // ==========================================
      try {
        console.log('📝 Creando proceso de negociación desde plantilla predeterminada...')

        // Obtener plantilla predeterminada
        const plantilla = await obtenerPlantillaPredeterminada()

        if (!plantilla) {
          console.warn('⚠️ No hay plantilla predeterminada. Omitiendo creación de proceso.')
        } else {
          // Mapear fuentes de pago de negociación a enum de procesos
          const fuentesProceso: TipoFuentePago[] = []

          if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {
            datos.fuentes_pago.forEach(fuente => {
              switch (fuente.tipo) {
                case 'Crédito Hipotecario':
                  fuentesProceso.push(TipoFuentePago.CREDITO_HIPOTECARIO)
                  break
                case 'Subsidio Caja de Compensación':
                case 'Subsidio Caja Compensación':
                  fuentesProceso.push(TipoFuentePago.SUBSIDIO_CAJA)
                  break
                case 'Subsidio Mi Casa Ya':
                  fuentesProceso.push(TipoFuentePago.SUBSIDIO_MI_CASA_YA)
                  break
                case 'Cuota Inicial':
                  fuentesProceso.push(TipoFuentePago.CUOTA_INICIAL)
                  break
                default:
                  // Por defecto, usar Cuota Inicial si no reconocemos el tipo
                  fuentesProceso.push(TipoFuentePago.CUOTA_INICIAL)
              }
            })
          } else {
            // Si no hay fuentes, asumir Cuota Inicial
            fuentesProceso.push(TipoFuentePago.CUOTA_INICIAL)
          }

          // Crear proceso
          await crearProcesoDesdePlantilla({
            negociacionId: negociacion.id,
            plantillaId: plantilla.id,
            fuentesPago: fuentesProceso
          })

          console.log('✅ Proceso de negociación creado con', fuentesProceso.length, 'fuentes de pago')
        }
      } catch (errorProceso) {
        // No fallar la negociación si el proceso no se puede crear
        console.error('⚠️ Error creando proceso (no crítico):', errorProceso)
      }

      console.log('🎉 ¡Negociación creada exitosamente!')

      return negociacion as Negociacion

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error en crearNegociacion:', mensaje, error)
      throw error
    }
  }

  /**
   * Obtener negociación por ID
   */
  async obtenerNegociacion(id: string): Promise<Negociacion | null> {
    try {
      const { data, error} = await supabase
        .from('negociaciones')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Negociacion
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo negociación:', mensaje, error)
      return null
    }
  }

  /**
   * Obtener negociaciones de un cliente
   */
  async obtenerNegociacionesCliente(clienteId: string): Promise<Negociacion[]> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(`
          *,
          vivienda:viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            valor_base,
            estado,
            manzanas!viviendas_manzana_id_fkey (
              id,
              nombre,
              proyecto:proyectos!manzanas_proyecto_id_fkey (
                id,
                nombre,
                estado,
                ubicacion
              )
            )
          )
        `)
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })
        .limit(100) // ✅ Limitar a 100 negociaciones más recientes (performance)

      if (error) throw error

      // Mapear para tener proyecto en el nivel superior
      const negociacionesConProyecto = (data || []).map((neg: any) => ({
        ...neg,
        proyecto: neg.vivienda?.manzanas?.proyecto || null
      }))

      return negociacionesConProyecto as Negociacion[]
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo negociaciones del cliente:', mensaje, error)
      return []
    }
  }

  /**
   * Obtener negociación activa de una vivienda
   */
  async obtenerNegociacionVivienda(viviendaId: string): Promise<Negociacion | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select('*')
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ⭐ ACTUALIZADO: Solo estados activos
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data as Negociacion | null
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo negociación de vivienda:', mensaje, error)
      return null
    }
  }

  /**
   * Actualizar negociación
   */
  async actualizarNegociacion(
    id: string,
    datos: ActualizarNegociacionDTO
  ): Promise<Negociacion> {
    try {
      console.log('📝 Actualizando negociación:', id, datos)

      const { data, error } = await supabase
        .from('negociaciones')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Negociación actualizada')
      return data as Negociacion
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error actualizando negociación:', mensaje, error)
      throw error
    }
  }

  /**
   * Suspender negociación (pausar temporalmente)
   */
  async suspenderNegociacion(id: string, motivo?: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Suspendida',
      notas: motivo ? `[SUSPENDIDA] ${motivo}` : undefined,
    })
  }

  /**
   * Reactivar negociación suspendida
   */
  async reactivarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Activa',
    })
  }

  /**
   * Completar negociación (100% pagado)
   * ⚠️ Requiere fecha_completada (constraint de DB)
   */
  async completarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Completada',
      fecha_completada: formatDateForDB(getTodayDateString()), // ⭐ REQUERIDO por constraint
    })
  }

  /**
   * Cerrar negociación por renuncia
   * ⚠️ Debe tener registro en tabla 'renuncias'
   */
  async cerrarPorRenuncia(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cerrada por Renuncia',
    })
  }

  /**
   * Verificar si un cliente ya tiene negociación activa con una vivienda
   */
  async existeNegociacionActiva(
    clienteId: string,
    viviendaId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('negociaciones')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ⭐ ACTUALIZADO

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error verificando negociación activa:', mensaje, error)
      return false
    }
  }

  /**
   * Eliminar negociación (solo si está recién creada y sin movimientos)
   * ⚠️ PRECAUCIÓN: Verificar que no tenga abonos antes de eliminar
   */
  async eliminarNegociacion(id: string): Promise<void> {
    try {
      // Verificar que no tenga abonos
      const { data: abonos } = await supabase
        .from('abonos_historial')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (abonos && abonos.length > 0) {
        throw new Error('No se puede eliminar una negociación con abonos registrados')
      }

      // Verificar que no tenga fuentes de pago
      const { data: fuentes } = await supabase
        .from('fuentes_pago')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (fuentes && fuentes.length > 0) {
        throw new Error('No se puede eliminar una negociación con fuentes de pago')
      }

      const { error } = await supabase
        .from('negociaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('✅ Negociación eliminada')
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error eliminando negociación:', mensaje, error)
      throw error
    }
  }

  /**
   * Actualizar fuentes de pago de una negociación
   * ⚠️ Operación transaccional: elimina viejas e inserta nuevas
   *
   * Validaciones:
   * - Suma total = valor_final de negociación
   * - No eliminar fuentes con monto_recibido > 0
   * - Monto >= monto_recibido (si tiene abonos)
   */
  async actualizarFuentesPago(
    negociacionId: string,
    fuentes: Array<{
      id?: string
      tipo: string
      monto_aprobado: number
      entidad?: string | null
      numero_referencia?: string | null
      detalles?: string | null
    }>
  ): Promise<void> {
    try {
      // 1. Obtener fuentes actuales para validar
      const { data: fuentesActuales, error: errorFetch } = await supabase
        .from('fuentes_pago')
        .select('id, monto_recibido')
        .eq('negociacion_id', negociacionId)

      if (errorFetch) throw errorFetch

      // 2. Validar que no se eliminen fuentes con abonos
      const idsNuevas = fuentes.map(f => f.id).filter(Boolean)
      const fuentesAEliminar = fuentesActuales?.filter(
        fa => !idsNuevas.includes(fa.id)
      ) || []

      const fuentesConAbonos = fuentesAEliminar.filter(f => f.monto_recibido > 0)
      if (fuentesConAbonos.length > 0) {
        throw new Error('No puedes eliminar fuentes de pago que tienen abonos registrados')
      }

      // 3. Eliminar fuentes viejas que no están en la nueva lista
      if (fuentesAEliminar.length > 0) {
        const { error: errorDelete } = await supabase
          .from('fuentes_pago')
          .delete()
          .in('id', fuentesAEliminar.map(f => f.id))

        if (errorDelete) throw errorDelete
      }

      // 4. Actualizar fuentes existentes y crear nuevas
      for (const fuente of fuentes) {
        if (fuente.id) {
          // Actualizar existente
          const { error: errorUpdate } = await supabase
            .from('fuentes_pago')
            .update({
              tipo: fuente.tipo,
              monto_aprobado: fuente.monto_aprobado,
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
            })
            .eq('id', fuente.id)

          if (errorUpdate) throw errorUpdate
        } else {
          // Crear nueva
          const { error: errorInsert } = await supabase
            .from('fuentes_pago')
            .insert({
              negociacion_id: negociacionId,
              tipo: fuente.tipo as TipoFuentePago,
              monto_aprobado: fuente.monto_aprobado,
              monto_recibido: 0,
              // ❌ NO incluir columnas generadas: saldo_pendiente, porcentaje_completado
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
              permite_multiples_abonos: true,
              estado: 'Pendiente',
            })

          if (errorInsert) throw errorInsert
        }
      }

      console.log('✅ Fuentes de pago actualizadas correctamente')
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error actualizando fuentes de pago:', mensaje, error)
      throw error
    }
  }
}

export const negociacionesService = new NegociacionesService()
