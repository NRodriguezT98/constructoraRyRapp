/**
 * Servicio de Historial de Cliente
 * Consulta eventos de audit_log + negociaciones + abonos + renuncias
 * relacionados con un cliente específico
 */

import { supabase } from '@/lib/supabase/client'
import type { EventoHistorialCliente } from '../types/historial.types'

class HistorialClienteService {
  /**
   * Obtener historial completo de un cliente
   * Incluye: audit_log de cliente + negociaciones + abonos + renuncias
   *
   * @param clienteId - ID del cliente
   * @param limit - Número máximo de eventos a retornar
   * @returns Array de eventos ordenados por fecha descendente
   */
  async obtenerHistorial(
    clienteId: string,
    limit = 200
  ): Promise<EventoHistorialCliente[]> {
    try {
      // 1. Eventos directos del cliente (CREATE, UPDATE, DELETE)
      const { data: eventosCliente } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'clientes')
        .eq('registro_id', clienteId)
        .order('fecha_evento', { ascending: false })

      // 2. Eventos de negociaciones del cliente
      const { data: eventosNegociaciones } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'negociaciones')
        .contains('metadata', { cliente_id: clienteId })
        .order('fecha_evento', { ascending: false })

      // 3. Eventos de abonos relacionados con el cliente
      const { data: eventosAbonos } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'abonos_historial')
        .contains('metadata', { cliente_id: clienteId })
        .order('fecha_evento', { ascending: false })

      // 4. Eventos de renuncias del cliente
      const { data: eventosRenuncias } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'renuncias')
        .contains('metadata', { cliente_id: clienteId })
        .order('fecha_evento', { ascending: false })

      // 5. Eventos de intereses del cliente
      const { data: eventosIntereses } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'intereses')
        .contains('metadata', { cliente_id: clienteId })
        .order('fecha_evento', { ascending: false })

      // 6. Eventos de documentos del cliente
      const { data: eventosDocumentos } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', 'documentos_cliente')
        .contains('metadata', { cliente_id: clienteId })
        .order('fecha_evento', { ascending: false })

      // 7. Consolidar todos los eventos
      const todosEventos = [
        ...(eventosCliente || []),
        ...(eventosNegociaciones || []),
        ...(eventosAbonos || []),
        ...(eventosRenuncias || []),
        ...(eventosIntereses || []),
        ...(eventosDocumentos || []),
      ]

      // 8. Ordenar por fecha_evento descendente y limitar
      const eventosOrdenados = todosEventos
        .sort((a, b) => {
          const fechaA = new Date(a.fecha_evento).getTime()
          const fechaB = new Date(b.fecha_evento).getTime()
          return fechaB - fechaA
        })
        .slice(0, limit)

      // 9. Mapear a EventoHistorialCliente
      return eventosOrdenados.map((evento) => ({
        id: evento.id,
        tabla: evento.tabla,
        accion: evento.accion,
        registro_id: evento.registro_id,
        fecha_evento: evento.fecha_evento,
        usuario_email: evento.usuario_email,
        usuario_nombres: evento.usuario_nombres,
        usuario_rol: evento.usuario_rol,
        datos_anteriores: evento.datos_anteriores,
        datos_nuevos: evento.datos_nuevos,
        cambios_especificos: evento.cambios_especificos,
        metadata: evento.metadata,
        modulo: evento.modulo,
      }))
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo historial del cliente:', mensaje, error)
      return []
    }
  }

  /**
   * Obtener eventos por tipo de tabla
   * Útil para filtros en la UI
   *
   * @param clienteId - ID del cliente
   * @param tabla - Tipo de tabla ('clientes' | 'negociaciones' | 'abonos_historial' | etc)
   * @param limit - Número máximo de eventos
   */
  async obtenerEventosPorTipo(
    clienteId: string,
    tabla: string,
    limit = 50
  ): Promise<EventoHistorialCliente[]> {
    try {
      let query = (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', tabla)

      // Si es la tabla clientes, filtrar por registro_id
      // Para otras tablas, filtrar por metadata.cliente_id
      if (tabla === 'clientes') {
        query = query.eq('registro_id', clienteId)
      } else {
        query = query.contains('metadata', { cliente_id: clienteId })
      }

      const { data, error } = await query
        .order('fecha_evento', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((evento: any) => ({
        id: evento.id,
        tabla: evento.tabla,
        accion: evento.accion,
        registro_id: evento.registro_id,
        fecha_evento: evento.fecha_evento,
        usuario_email: evento.usuario_email,
        usuario_nombres: evento.usuario_nombres,
        usuario_rol: evento.usuario_rol,
        datos_anteriores: evento.datos_anteriores,
        datos_nuevos: evento.datos_nuevos,
        cambios_especificos: evento.cambios_especificos,
        metadata: evento.metadata,
        modulo: evento.modulo,
      }))
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo eventos por tipo:', mensaje, error)
      return []
    }
  }

  /**
   * Obtener estadísticas de actividad del cliente
   *
   * @param clienteId - ID del cliente
   * @returns Resumen de actividad
   */
  async obtenerEstadisticasActividad(clienteId: string) {
    try {
      const eventos = await this.obtenerHistorial(clienteId, 1000) // Sin límite para stats

      const stats = {
        total_eventos: eventos.length,
        eventos_por_tipo: {
          clientes: eventos.filter((e) => e.tabla === 'clientes').length,
          negociaciones: eventos.filter((e) => e.tabla === 'negociaciones')
            .length,
          abonos: eventos.filter((e) => e.tabla === 'abonos_historial').length,
          renuncias: eventos.filter((e) => e.tabla === 'renuncias').length,
          intereses: eventos.filter((e) => e.tabla === 'intereses').length,
          documentos: eventos.filter((e) => e.tabla === 'documentos_cliente')
            .length,
        },
        eventos_por_accion: {
          creaciones: eventos.filter((e) => e.accion === 'CREATE').length,
          actualizaciones: eventos.filter((e) => e.accion === 'UPDATE').length,
          eliminaciones: eventos.filter((e) => e.accion === 'DELETE').length,
        },
        primer_evento: eventos[eventos.length - 1]?.fecha_evento || null,
        ultimo_evento: eventos[0]?.fecha_evento || null,
      }

      return stats
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo estadísticas:', mensaje, error)
      return null
    }
  }

  /**
   * Buscar eventos por término
   *
   * @param clienteId - ID del cliente
   * @param termino - Término de búsqueda
   * @returns Eventos que coincidan con el término
   */
  async buscarEventos(
    clienteId: string,
    termino: string
  ): Promise<EventoHistorialCliente[]> {
    try {
      const eventos = await this.obtenerHistorial(clienteId, 500)

      const terminoLower = termino.toLowerCase()

      return eventos.filter((evento) => {
        // Buscar en usuario_email, usuario_nombres, metadata
        const textoEvento = JSON.stringify({
          usuario_email: evento.usuario_email,
          usuario_nombres: evento.usuario_nombres,
          metadata: evento.metadata,
          datos_nuevos: evento.datos_nuevos,
        }).toLowerCase()

        return textoEvento.includes(terminoLower)
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error buscando eventos:', mensaje, error)
      return []
    }
  }
}

export const historialClienteService = new HistorialClienteService()
