import { supabase } from '@/lib/supabase/client'
import type {
    ActividadUsuario,
    AuditoriaRegistro,
    ConsultaAuditoriaParams,
    EliminacionMasiva,
    EstadisticasAuditoria,
    ResultadoPaginado,
    ResumenModulo,
} from '../types'

/**
 * Servicio para consultar auditorías desde la base de datos
 * Solo lectura (INSERT se hace desde auditService)
 */
class AuditoriasService {
  /**
   * Obtener registros de auditoría con filtros y paginación
   */
  async obtenerAuditorias(
    params: ConsultaAuditoriaParams = {}
  ): Promise<ResultadoPaginado<AuditoriaRegistro>> {
    let query = (supabase as any)
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('fecha_evento', { ascending: false })

    // Aplicar filtros
    if (params.tabla) {
      query = query.eq('tabla', params.tabla)
    }
    if (params.registroId) {
      query = query.eq('registro_id', params.registroId)
    }
    if (params.usuarioId) {
      query = query.eq('usuario_id', params.usuarioId)
    }
    if (params.modulo) {
      query = query.eq('modulo', params.modulo)
    }
    if (params.accion) {
      query = query.eq('accion', params.accion)
    }
    if (params.fechaDesde) {
      query = query.gte('fecha_evento', params.fechaDesde)
    }
    if (params.fechaHasta) {
      query = query.lte('fecha_evento', params.fechaHasta)
    }

    // Paginación
    const limite = params.limite || 50
    const offset = params.offset || 0
    query = query.range(offset, offset + limite - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error al obtener auditorías:', error)
      throw new Error(`Error al obtener auditorías: ${error.message}`)
    }

    const total = count || 0
    const totalPaginas = Math.ceil(total / limite)
    const paginaActual = Math.floor(offset / limite) + 1

    return {
      datos: (data || []).map(this.transformarAuditoriaDeDB),
      total,
      pagina: paginaActual,
      totalPaginas,
    }
  }

  /**
   * Obtener historial de un registro específico usando RPC
   */
  async obtenerHistorialRegistro(
    tabla: string,
    registroId: string,
    limite: number = 100
  ): Promise<AuditoriaRegistro[]> {
    const { data, error } = await (supabase as any).rpc('obtener_historial_registro', {
      p_tabla: tabla,
      p_registro_id: registroId,
      p_limit: limite,
    })

    if (error) {
      console.error('Error al obtener historial:', error)
      throw new Error(`Error al obtener historial: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      tabla,
      accion: item.accion,
      registroId,
      usuarioId: null,
      usuarioEmail: item.usuario_email,
      usuarioRol: item.usuario_rol,
      fechaEvento: item.fecha_evento,
      ipAddress: null,
      userAgent: null,
      datosAnteriores: null,
      datosNuevos: null,
      cambiosEspecificos: item.cambios_especificos,
      metadata: item.metadata || {},
      modulo: null,
    }))
  }

  /**
   * Obtener actividad de un usuario usando RPC
   */
  async obtenerActividadUsuario(
    usuarioId: string,
    dias: number = 30,
    limite: number = 100
  ): Promise<ActividadUsuario[]> {
    const { data, error } = await supabase.rpc('obtener_actividad_usuario', {
      p_usuario_id: usuarioId,
      p_dias: dias,
      p_limit: limite,
    })

    if (error) {
      console.error('Error al obtener actividad de usuario:', error)
      throw new Error(
        `Error al obtener actividad de usuario: ${error.message}`
      )
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      tabla: item.tabla,
      accion: item.accion,
      fechaEvento: item.fecha_evento,
      registroId: item.registro_id,
      modulo: item.modulo,
      metadata: item.metadata || {},
    }))
  }

  /**
   * Detectar eliminaciones masivas usando RPC
   */
  async detectarEliminacionesMasivas(
    dias: number = 7,
    umbral: number = 5
  ): Promise<EliminacionMasiva[]> {
    const { data, error } = await supabase.rpc(
      'detectar_eliminaciones_masivas',
      {
        p_dias: dias,
        p_umbral: umbral,
      }
    )

    if (error) {
      console.error('Error al detectar eliminaciones masivas:', error)
      throw new Error(
        `Error al detectar eliminaciones masivas: ${error.message}`
      )
    }

    return (data || []).map((item: any) => ({
      fecha: item.fecha,
      usuarioEmail: item.usuario_email,
      tabla: item.tabla,
      totalEliminaciones: item.total_eliminaciones,
    }))
  }

  /**
   * Obtener resumen por módulo usando vista
   */
  async obtenerResumenModulos(): Promise<ResumenModulo[]> {
    const { data, error } = await supabase
      .from('v_auditoria_por_modulo')
      .select('*')
      .order('total_eventos', { ascending: false })

    if (error) {
      console.error('Error al obtener resumen por módulos:', error)
      throw new Error(`Error al obtener resumen por módulos: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
      modulo: item.modulo,
      totalEventos: item.total_eventos,
      usuariosActivos: item.usuarios_activos,
      totalCreaciones: item.total_creaciones,
      totalActualizaciones: item.total_actualizaciones,
      totalEliminaciones: item.total_eliminaciones,
      ultimoEvento: item.ultimo_evento,
      primerEvento: item.primer_evento,
    }))
  }

  /**
   * Obtener estadísticas generales
   */
  async obtenerEstadisticas(): Promise<EstadisticasAuditoria> {
    // Total de eventos
    const { count: totalEventos } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })

    // Eventos hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const { count: eventosHoy } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_evento', hoy.toISOString())

    // Eventos esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)
    const { count: eventosSemana } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_evento', inicioSemana.toISOString())

    // Eventos este mes
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const { count: eventosMes } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_evento', inicioMes.toISOString())

    // Usuarios activos (distintos)
    const { data: usuariosData } = await supabase
      .from('audit_log')
      .select('usuario_id')
      .not('usuario_id', 'is', null)

    const usuariosUnicos = new Set(
      usuariosData?.map((u: any) => u.usuario_id) || []
    )

    // Módulo más activo
    const resumenModulos = await this.obtenerResumenModulos()
    const moduloMasActivo =
      resumenModulos.length > 0 ? resumenModulos[0].modulo : 'N/A'

    // Acción más común
    const { data: acciones } = await supabase
      .from('audit_log')
      .select('accion')

    const conteoaccion = acciones?.reduce(
      (acc: any, item: any) => {
        acc[item.accion] = (acc[item.accion] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const accionMasComun =
      (Object.entries(conteoaccion || {}).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )[0]?.[0] as any) || 'CREATE'

    // Total eliminaciones
    const { count: eliminacionesTotales } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('accion', 'DELETE')

    return {
      totalEventos: totalEventos || 0,
      eventosHoy: eventosHoy || 0,
      eventosSemana: eventosSemana || 0,
      eventosMes: eventosMes || 0,
      usuariosActivos: usuariosUnicos.size,
      moduloMasActivo,
      accionMasComun,
      eliminacionesTotales: eliminacionesTotales || 0,
    }
  }

  /**
   * Buscar auditorías por texto (email, tabla, etc.)
   */
  async buscarAuditorias(
    texto: string,
    limite: number = 50
  ): Promise<AuditoriaRegistro[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .or(
        `usuario_email.ilike.%${texto}%,tabla.ilike.%${texto}%,registro_id.ilike.%${texto}%`
      )
      .order('fecha_evento', { ascending: false })
      .limit(limite)

    if (error) {
      console.error('Error al buscar auditorías:', error)
      throw new Error(`Error al buscar auditorías: ${error.message}`)
    }

    return (data || []).map(this.transformarAuditoriaDeDB)
  }

  /**
   * Transformar datos de DB a formato de aplicación
   */
  private transformarAuditoriaDeDB(data: any): AuditoriaRegistro {
    return {
      id: data.id,
      tabla: data.tabla,
      accion: data.accion,
      registroId: data.registro_id,
      usuarioId: data.usuario_id,
      usuarioEmail: data.usuario_email,
      usuarioRol: data.usuario_rol,
      fechaEvento: data.fecha_evento,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      datosAnteriores: data.datos_anteriores,
      datosNuevos: data.datos_nuevos,
      cambiosEspecificos: data.cambios_especificos,
      metadata: data.metadata || {},
      modulo: data.modulo,
    }
  }
}

export const auditoriasService = new AuditoriasService()
