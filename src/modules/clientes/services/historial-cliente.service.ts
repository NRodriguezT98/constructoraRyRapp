/**
 * Servicio de Historial de Cliente
 * Consulta eventos de audit_log + negociaciones + abonos + renuncias
 * relacionados con un cliente específico
 */

import { supabase } from '@/lib/supabase/client'
import type { EventoHistorialCliente } from '../types/historial.types'

class HistorialClienteService {
  /**
   * ✅ REFACTORIZADO: Obtener historial completo de un cliente
   *
   * MEJORAS ARQUITECTÓNICAS:
   * 1. ✅ Queries paralelas con Promise.all (rápido y seguro)
   * 2. ✅ JOIN con usuarios para obtener datos reales
   * 3. ✅ Consolidación en memoria
   * 4. ✅ TypeScript estricto
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
      // ✅ PASO 1: Obtener eventos SIN JOIN (más confiable)
      const [
        eventosCliente,
        eventosNegociaciones,
        eventosAbonos,
        eventosRenuncias,
        eventosIntereses,
        eventosDocumentos,
      ] = await Promise.all([
        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'clientes')
          .eq('registro_id', clienteId)
          .order('fecha_evento', { ascending: false }),

        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'negociaciones')
          .contains('metadata', { cliente_id: clienteId })
          .order('fecha_evento', { ascending: false }),

        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'abonos_historial')
          .contains('metadata', { cliente_id: clienteId })
          .order('fecha_evento', { ascending: false }),

        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'renuncias')
          .contains('metadata', { cliente_id: clienteId })
          .order('fecha_evento', { ascending: false }),

        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'intereses')
          .contains('metadata', { cliente_id: clienteId })
          .order('fecha_evento', { ascending: false }),

        supabase
          .from('audit_log')
          .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
          .eq('tabla', 'documentos_cliente')
          .contains('metadata', { cliente_id: clienteId })
          .order('fecha_evento', { ascending: false }),
      ])

      // Consolidar eventos
      const todosEventos = [
        ...(eventosCliente.data || []),
        ...(eventosNegociaciones.data || []),
        ...(eventosAbonos.data || []),
        ...(eventosRenuncias.data || []),
        ...(eventosIntereses.data || []),
        ...(eventosDocumentos.data || []),
      ]

      // Ordenar y limitar
      const eventosOrdenados = todosEventos
        .sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
        .slice(0, limit)

      // ✅ PASO 2: Obtener IDs únicos de usuarios
      const usuarioIds = [...new Set(eventosOrdenados.map(e => e.usuario_id).filter((id): id is string => Boolean(id)))]

      // ✅ PASO 3: Obtener datos de usuarios en UN SOLO QUERY
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id,email,nombres,apellidos,rol')
        .in('id', usuarioIds)

      // Crear map para lookup rápido
      const usuariosMap = new Map(
        (usuarios || []).map(u => [u.id, u])
      )

      // ✅ PASO 4: Mapear eventos con datos de usuarios
      return eventosOrdenados.map((evento) => {
        const usuario = usuariosMap.get(evento.usuario_id ?? '')

        // Construir nombre completo (nombres + apellidos)
        const nombreCompleto = usuario
          ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ') || null
          : null

        return {
          id: evento.id,
          tabla: evento.tabla,
          accion: evento.accion,
          registro_id: evento.registro_id,
          fecha_evento: evento.fecha_evento,
          // ✅ Datos reales del usuario desde query separado
          usuario_email: usuario?.email || 'Sistema',
          usuario_nombres: nombreCompleto,
          usuario_rol: usuario?.rol || null,
          datos_anteriores: evento.datos_anteriores,
          datos_nuevos: evento.datos_nuevos,
          cambios_especificos: evento.cambios_especificos,
          metadata: evento.metadata,
          modulo: evento.modulo,
        }
      }) as unknown as EventoHistorialCliente[]
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ [CLIENTES] Error obteniendo historial del cliente:', mensaje, error)
      return []
    }
  }

  /**
   * ✅ REFACTORIZADO: Obtener eventos por tipo de tabla
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
      let query = supabase
        .from('audit_log')
        .select('id,tabla,accion,registro_id,fecha_evento,usuario_id,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo')
        .eq('tabla', tabla)

      if (tabla === 'clientes') {
        query = query.eq('registro_id', clienteId)
      } else {
        query = query.contains('metadata', { cliente_id: clienteId })
      }

      const { data: eventos, error } = await query
        .order('fecha_evento', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Obtener usuarios
      const usuarioIds = [...new Set((eventos || []).map(e => e.usuario_id).filter((id): id is string => Boolean(id)))]
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id,email,nombres,rol')
        .in('id', usuarioIds)

      const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]))

      return (eventos || []).map((evento) => {
        const usuario = usuariosMap.get(evento.usuario_id ?? '')
        return {
          id: evento.id,
          tabla: evento.tabla,
          accion: evento.accion,
          registro_id: evento.registro_id,
          fecha_evento: evento.fecha_evento,
          usuario_email: usuario?.email || 'Sistema',
          usuario_nombres: usuario?.nombres || null,
          usuario_rol: usuario?.rol || null,
          datos_anteriores: evento.datos_anteriores,
          datos_nuevos: evento.datos_nuevos,
          cambios_especificos: evento.cambios_especificos,
          metadata: evento.metadata,
          modulo: evento.modulo,
        }
      }) as unknown as EventoHistorialCliente[]
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
