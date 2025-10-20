/**
 * Servicio de Negociaciones
 *
 * Gestiona la vinculación Cliente + Vivienda + Cierre Financiero
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Estados de negociación:
 * - 'En Proceso' → Negociando
 * - 'Cierre Financiero' → Configurando fuentes de pago
 * - 'Activa' → Recibiendo abonos
 * - 'Completada' → 100% pagado
 * - 'Cancelada' → No se concretó
 * - 'Renuncia' → Cliente renunció
 */

import { supabase } from '@/lib/supabase/client-browser'
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
  fecha_cierre_financiero?: string
  fecha_activacion?: string
  fecha_completada?: string
  fecha_cancelacion?: string
  motivo_cancelacion?: string
  notas?: string
}

// Re-export Negociacion del index
export type { Negociacion }

class NegociacionesService {
  /**
   * Crear nueva negociación CON o SIN fuentes de pago (transaccional)
   *
   * 🔄 RETROCOMPATIBILIDAD:
   * - Si `fuentes_pago` se proporciona → Estado "Cierre Financiero" (nuevo flujo)
   * - Si NO se proporciona → Estado "En Proceso" (flujo antiguo)
   *
   * Flujo completo (nuevo):
   * 1. Crear negociación
   * 2. Crear todas las fuentes de pago
   * 3. Actualizar vivienda → 'reservada'
   * 4. Actualizar cliente → 'Activo'
   * 5. Si algún paso falla, se hace rollback
   *
   * Flujo simple (antiguo):
   * 1. Crear negociación en estado "En Proceso"
   */
  async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      const tieneFuentesPago = datos.fuentes_pago && datos.fuentes_pago.length > 0

      console.log('📝 Creando negociación:', {
        ...datos,
        modo: tieneFuentesPago ? 'CON fuentes de pago (nuevo)' : 'SIN fuentes (antiguo)',
      })

      // ==========================================
      // PASO 1: Crear negociación
      // ==========================================
      const { data: negociacion, error: errorNegociacion } = await supabase
        .from('negociaciones')
        .insert({
          cliente_id: datos.cliente_id,
          vivienda_id: datos.vivienda_id,
          valor_negociado: datos.valor_negociado,
          descuento_aplicado: datos.descuento_aplicado || 0,
          notas: datos.notas,
          // ⭐ Estado depende del flujo:
          estado: tieneFuentesPago ? 'Cierre Financiero' : 'En Proceso',
        })
        .select()
        .single()

      if (errorNegociacion) {
        console.error('❌ Error creando negociación:', errorNegociacion)
        throw errorNegociacion
      }

      console.log('✅ Negociación creada:', negociacion.id)

      // ==========================================
      // PASO 2: Crear fuentes de pago (si existen)
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
          permite_multiples_abonos: fuente.tipo === 'Cuota Inicial', // Auto-configurado
          estado: 'Pendiente',
        }))

        const { error: errorFuentes } = await supabase
          .from('fuentes_pago')
          .insert(fuentesParaInsertar)

        if (errorFuentes) {
          console.error('❌ Error creando fuentes de pago:', errorFuentes)

          // ROLLBACK: Eliminar negociación
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          console.warn('⚠️ Rollback: Negociación eliminada')

          throw new Error(`Error creando fuentes de pago: ${errorFuentes.message}`)
        }

        console.log('✅ Fuentes de pago creadas')

        // ==========================================
        // PASO 3: Actualizar vivienda → 'reservada' (SOLO NUEVO FLUJO)
        // ==========================================
        console.log('📝 Actualizando vivienda a estado "reservada"...')
        const { error: errorVivienda } = await supabase
          .from('viviendas')
          .update({ estado: 'reservada' })
          .eq('id', datos.vivienda_id)

        if (errorVivienda) {
          console.error('❌ Error actualizando vivienda:', errorVivienda)

          // ROLLBACK: Eliminar fuentes + negociación
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          console.warn('⚠️ Rollback: Negociación y fuentes eliminadas')

          throw new Error(`Error actualizando vivienda: ${errorVivienda.message}`)
        }

        console.log('✅ Vivienda actualizada a "reservada"')

        // ==========================================
        // PASO 4: Actualizar cliente → 'Activo' (SOLO NUEVO FLUJO)
        // ==========================================
        console.log('📝 Actualizando cliente a estado "Activo"...')
        const { error: errorCliente } = await supabase
          .from('clientes')
          .update({ estado: 'Activo' })
          .eq('id', datos.cliente_id)

        if (errorCliente) {
          console.error('❌ Error actualizando cliente:', errorCliente)

          // ROLLBACK: Eliminar fuentes + negociación + revertir vivienda
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          await supabase.from('viviendas').update({ estado: 'disponible' }).eq('id', datos.vivienda_id)
          console.warn('⚠️ Rollback: Todo revertido')

          throw new Error(`Error actualizando cliente: ${errorCliente.message}`)
        }

        console.log('✅ Cliente actualizado a "Activo"')
        console.log('✅ ¡Negociación creada exitosamente con cierre financiero completo!')
      } else {
        // Flujo antiguo: solo se crea la negociación
        console.log('✅ Negociación creada en estado "En Proceso" (flujo antiguo)')
      }
      return negociacion as Negociacion

    } catch (error) {
      console.error('❌ Error en crearNegociacion:', error)
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
      console.error('❌ Error obteniendo negociación:', error)
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
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      return (data as Negociacion[]) || []
    } catch (error) {
      console.error('❌ Error obteniendo negociaciones del cliente:', error)
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
        .in('estado', ['En Proceso', 'Cierre Financiero', 'Activa'])
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data as Negociacion | null
    } catch (error) {
      console.error('❌ Error obteniendo negociación de vivienda:', error)
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
      console.error('❌ Error actualizando negociación:', error)
      throw error
    }
  }

  /**
   * Pasar negociación a Cierre Financiero
   */
  async pasarACierreFinanciero(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cierre Financiero',
      fecha_cierre_financiero: new Date().toISOString(),
    })
  }

  /**
   * Activar negociación (cuando cierre financiero está completo)
   */
  async activarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Activa',
      fecha_activacion: new Date().toISOString(),
    })
  }

  /**
   * Completar negociación (100% pagado)
   */
  async completarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Completada',
      fecha_completada: new Date().toISOString(),
    })
  }

  /**
   * Cancelar negociación
   */
  async cancelarNegociacion(id: string, motivo: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cancelada',
      fecha_cancelacion: new Date().toISOString(),
      motivo_cancelacion: motivo,
    })
  }

  /**
   * Registrar renuncia
   */
  async registrarRenuncia(id: string, motivo: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Renuncia',
      fecha_cancelacion: new Date().toISOString(),
      motivo_cancelacion: motivo,
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
        .in('estado', ['En Proceso', 'Cierre Financiero', 'Activa'])

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      console.error('❌ Error verificando negociación activa:', error)
      return false
    }
  }

  /**
   * Eliminar negociación (solo si está en 'En Proceso')
   */
  async eliminarNegociacion(id: string): Promise<void> {
    try {
      // Verificar estado primero
      const negociacion = await this.obtenerNegociacion(id)
      if (!negociacion) throw new Error('Negociación no encontrada')

      if (negociacion.estado !== 'En Proceso') {
        throw new Error('Solo se pueden eliminar negociaciones en proceso')
      }

      const { error } = await supabase
        .from('negociaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('✅ Negociación eliminada')
    } catch (error) {
      console.error('❌ Error eliminando negociación:', error)
      throw error
    }
  }
}

export const negociacionesService = new NegociacionesService()
