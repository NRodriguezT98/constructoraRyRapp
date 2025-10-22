/**
 * Servicio de Negociaciones - Vista Global
 *
 * Extiende negociacionesService de clientes para vistas globales
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

import { supabase } from '@/lib/supabase/client-browser'
import type {
    FiltrosNegociaciones,
    MetricasNegociaciones,
    NegociacionConRelaciones,
} from '../types'

// Re-exportar servicio de clientes
export { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
export { negociacionesService } from '@/modules/clientes/services/negociaciones.service'

class NegociacionesGlobalService {
  /**
   * Obtener TODAS las negociaciones con relaciones
   */
  async obtenerNegociaciones(
    filtros: FiltrosNegociaciones = {}
  ): Promise<NegociacionConRelaciones[]> {
    try {
      console.log('📊 Obteniendo negociaciones globales con filtros:', filtros)

      let query = supabase
        .from('negociaciones')
        .select(
          `
          id,
          cliente_id,
          vivienda_id,
          estado,
          valor_negociado,
          descuento_aplicado,
          valor_total,
          total_fuentes_pago,
          fecha_creacion,
          fecha_actualizacion,
          fecha_negociacion,
          fecha_completada,
          notas,
          cliente:clientes!negociaciones_cliente_id_fkey (
            id,
            nombre_completo,
            numero_documento,
            telefono,
            email
          ),
          vivienda:viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            valor_base,
            valor_total,
            estado,
            manzana:manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyecto:proyectos!manzanas_proyecto_id_fkey (
                nombre
              )
            )
          ),
          fuentes_pago!fuentes_pago_negociacion_id_fkey (
            id,
            tipo,
            monto_aprobado,
            monto_recibido,
            saldo_pendiente,
            porcentaje_completado
          )
        `
        )
        .order('fecha_creacion', { ascending: false })

      // Aplicar filtros
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado)
      }

      if (filtros.fecha_desde) {
        query = query.gte('fecha_creacion', filtros.fecha_desde)
      }

      if (filtros.fecha_hasta) {
        query = query.lte('fecha_creacion', filtros.fecha_hasta)
      }

      // Filtro de búsqueda por cliente o vivienda (se aplica en cliente)
      const { data, error } = await query

      if (error) {
        console.error('❌ Error al obtener negociaciones:', error)
        throw new Error(`Error al obtener negociaciones: ${error.message}`)
      }

      console.log(`✅ Negociaciones obtenidas: ${data?.length || 0}`)

      // Filtro de búsqueda en cliente (después de obtener datos)
      let resultado = data || []

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busqueda = filtros.busqueda.toLowerCase()
        resultado = resultado.filter((neg) => {
          const nombreCliente = neg.cliente?.nombre_completo?.toLowerCase() || ''
          const documentoCliente = neg.cliente?.numero_documento?.toLowerCase() || ''
          const numeroVivienda = (neg.vivienda as any)?.numero?.toLowerCase() || '' // ✅ 'numero' NO 'numero_vivienda'
          const proyecto = (neg.vivienda as any)?.manzana?.proyecto?.nombre?.toLowerCase() || ''

          return (
            nombreCliente.includes(busqueda) ||
            documentoCliente.includes(busqueda) ||
            numeroVivienda.includes(busqueda) ||
            proyecto.includes(busqueda)
          )
        })
      }

      if (filtros.proyecto_id) {
        resultado = resultado.filter((neg) => {
          // Nota: necesitaríamos el ID del proyecto en la query
          // Por ahora filtramos por nombre (mejora futura)
          return true
        })
      }

      return resultado as unknown as NegociacionConRelaciones[]
    } catch (error) {
      console.error('❌ Error en obtenerNegociaciones:', error)
      throw error
    }
  }

  /**
   * Obtener métricas del dashboard
   */
  async obtenerMetricas(): Promise<MetricasNegociaciones> {
    try {
      console.log('📊 Calculando métricas de negociaciones')

      const { data, error } = await supabase
        .from('negociaciones')
        .select('estado, valor_total')

      if (error) {
        console.error('❌ Error al obtener métricas:', error)
        throw new Error(`Error al obtener métricas: ${error.message}`)
      }

      const negociaciones = data || []

      const metricas: MetricasNegociaciones = {
        total: negociaciones.length,
        activas: negociaciones.filter((n) => n.estado === 'Activa').length,
        suspendidas: negociaciones.filter((n) => n.estado === 'Suspendida').length, // ⭐ NUEVO
        cerradas_renuncia: negociaciones.filter((n) => n.estado === 'Cerrada por Renuncia').length, // ⭐ NUEVO
        completadas: negociaciones.filter((n) => n.estado === 'Completada').length,
        valor_total_activas: negociaciones
          .filter((n) => n.estado === 'Activa')
          .reduce((sum, n) => sum + (n.valor_total || 0), 0),
        valor_total_completadas: negociaciones
          .filter((n) => n.estado === 'Completada')
          .reduce((sum, n) => sum + (n.valor_total || 0), 0),
      }

      console.log('✅ Métricas calculadas:', metricas)
      return metricas
    } catch (error) {
      console.error('❌ Error en obtenerMetricas:', error)
      throw error
    }
  }

  /**
   * Obtener detalle de negociación por ID
   */
  async obtenerNegociacionPorId(id: string): Promise<NegociacionConRelaciones | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(
          `
          id,
          cliente_id,
          vivienda_id,
          estado,
          valor_negociado,
          descuento_aplicado,
          valor_total,
          total_fuentes_pago,
          fecha_creacion,
          fecha_actualizacion,
          fecha_negociacion,
          fecha_completada,
          notas,
          cliente:clientes!negociaciones_cliente_id_fkey (
            id,
            nombre_completo,
            numero_documento,
            telefono,
            email
          ),
          vivienda:viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            valor_base,
            valor_total,
            estado,
            manzana:manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyecto:proyectos!manzanas_proyecto_id_fkey (
                nombre
              )
            )
          ),
          fuentes_pago!fuentes_pago_negociacion_id_fkey (
            id,
            tipo,
            monto_aprobado,
            monto_recibido,
            saldo_pendiente,
            porcentaje_completado
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error al obtener negociación:', error)
        return null
      }

      return data as unknown as NegociacionConRelaciones
    } catch (error) {
      console.error('❌ Error en obtenerNegociacionPorId:', error)
      return null
    }
  }
}

export const negociacionesGlobalService = new NegociacionesGlobalService()
