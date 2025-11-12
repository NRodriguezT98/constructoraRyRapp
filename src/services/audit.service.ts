/**
 * Servicio de Auditoría Completa - RyR Constructora
 *
 * Este servicio registra TODAS las operaciones CRUD en los módulos de negocio.
 * Permite trazabilidad completa: quién hizo qué, cuándo, y qué datos cambiaron.
 *
 * IMPORTANTE: Este servicio es DIFERENTE de audit-log.service.ts
 * - audit-log.service.ts → Eventos de autenticación/seguridad (login, logout, etc.)
 * - audit.service.ts → Eventos de negocio (CRUD en viviendas, clientes, etc.)
 *
 * @author RyR Constructora
 * @date 2025-11-04
 */

import { supabase } from '@/lib/supabase/client'

// =====================================================
// TIPOS
// =====================================================

/**
 * Tablas que pueden ser auditadas
 */
export type TablaAuditable =
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos_historial'
  | 'fuentes_pago'
  | 'renuncias'
  | 'procesos_negociacion'
  | 'proyectos'
  | 'manzanas'
  | 'usuarios'
  | 'documentos_proyecto'
  | 'documentos_cliente'
  | 'categorias_documento'

/**
 * Acciones que se pueden auditar
 */
export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * Módulos de la aplicación
 */
export type ModuloAplicacion =
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos'
  | 'procesos'
  | 'proyectos'
  | 'renuncias'
  | 'usuarios'
  | 'documentos'
  | 'admin'

/**
 * Parámetros para registrar una acción en audit_log
 */
export interface AuditLogParams<T = any> {
  tabla: TablaAuditable
  accion: AccionAuditoria
  registroId: string
  datosAnteriores?: T | null
  datosNuevos?: T | null
  metadata?: Record<string, any>
  modulo?: ModuloAplicacion
}

/**
 * Registro de auditoría (estructura de la tabla)
 */
export interface AuditLogRecord {
  id: string
  tabla: TablaAuditable
  accion: AccionAuditoria
  registro_id: string
  usuario_id: string | null
  usuario_email: string
  usuario_nombres: string | null
  usuario_rol: string | null
  fecha_evento: string
  ip_address: string | null
  user_agent: string | null
  datos_anteriores: any | null
  datos_nuevos: any | null
  cambios_especificos: Record<string, { antes: any; despues: any }> | null
  metadata: Record<string, any>
  modulo: ModuloAplicacion | null
}

/**
 * Resumen de actividad de un usuario
 */
export interface ActividadUsuario {
  id: string
  tabla: TablaAuditable
  accion: AccionAuditoria
  fecha_evento: string
  registro_id: string
  modulo: ModuloAplicacion | null
  metadata: Record<string, any>
}

/**
 * Resumen de auditoría por módulo
 */
export interface ResumenPorModulo {
  modulo: ModuloAplicacion
  total_eventos: number
  usuarios_activos: number
  total_creaciones: number
  total_actualizaciones: number
  total_eliminaciones: number
  ultimo_evento: string
  primer_evento: string
}

// =====================================================
// CLASE DEL SERVICIO
// =====================================================

class AuditService {
  /**
   * Registra una acción en el audit log
   *
   * @example
   * ```ts
   * await auditService.registrarAccion({
   *   tabla: 'viviendas',
   *   accion: 'UPDATE',
   *   registroId: vivienda.id,
   *   datosAnteriores: viviendaAnterior,
   *   datosNuevos: viviendaActualizada,
   *   metadata: { proyecto_nombre: 'Los Pinos' },
   *   modulo: 'viviendas'
   * })
   * ```
   */
  async registrarAccion<T = any>({
    tabla,
    accion,
    registroId,
    datosAnteriores = null,
    datosNuevos = null,
    metadata = {},
    modulo
  }: AuditLogParams<T>): Promise<void> {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.warn('⚠️ No se pudo obtener usuario para auditoría')
        // No bloqueamos la operación si no hay usuario
        return
      }

      // Obtener perfil del usuario para el rol y nombres
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol, nombres')
        .eq('id', user.id)
        .single()

      // Calcular cambios específicos (solo en UPDATE)
      let cambiosEspecificos = null
      if (accion === 'UPDATE' && datosAnteriores && datosNuevos) {
        cambiosEspecificos = this.calcularCambios(datosAnteriores, datosNuevos)
      }

      // Preparar datos de auditoría
      const auditData = {
        tabla,
        accion,
        registro_id: registroId,
        usuario_id: user.id,
        usuario_email: user.email!,
        usuario_nombres: perfil?.nombres || null,
        usuario_rol: perfil?.rol || null,
        datos_anteriores: datosAnteriores,
        datos_nuevos: datosNuevos,
        cambios_especificos: cambiosEspecificos,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        metadata: {
          ...metadata,
          timestamp_cliente: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : null
        },
        modulo: modulo || this.inferirModulo(tabla)
      }

      // Insertar en la base de datos
      const { error } = await (supabase as any)
        .from('audit_log')
        .insert(auditData)

      if (error) {
        console.error('Error registrando auditoría:', error)
        // No lanzamos error para no interrumpir el flujo principal
      }
    } catch (error) {
      console.error('Excepción en auditoría:', error)
      // Fallar silenciosamente para no interrumpir el flujo de la aplicación
    }
  }

  /**
   * Shorthand: Auditar creación de un registro
   *
   * @example
   * ```ts
   * const nuevaVivienda = await crearVivienda(datos)
   * await auditService.auditarCreacion('viviendas', nuevaVivienda.id, nuevaVivienda, {
   *   proyecto_id: datos.proyecto_id,
   *   manzana_nombre: 'A'
   * })
   * ```
   */
  async auditarCreacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datos: T,
    metadata?: Record<string, any>,
    modulo?: ModuloAplicacion
  ): Promise<void> {
    return this.registrarAccion({
      tabla,
      accion: 'CREATE',
      registroId,
      datosNuevos: datos,
      metadata,
      modulo
    })
  }

  /**
   * 🆕 Auditar creación de PROYECTO con metadata completa
   * Incluye detalles de manzanas, viviendas, y toda la estructura creada
   *
   * @example
   * ```ts
   * await auditService.auditarCreacionProyecto(proyecto, manzanas)
   * ```
   */
  async auditarCreacionProyecto(
    proyecto: any,
    manzanas: any[] = []
  ): Promise<void> {
    const totalViviendas = manzanas.reduce((sum, m) => sum + (m.totalViviendas || m.numero_viviendas || 0), 0)

    // 🔍 Solo incluir campos que realmente tienen valores significativos
    const metadataDetallada: Record<string, any> = {
      // Información BÁSICA del proyecto (siempre se captura)
      proyecto_nombre: proyecto.nombre,
      proyecto_ubicacion: proyecto.ubicacion,
      proyecto_descripcion: proyecto.descripcion,

      // Resumen de manzanas
      total_manzanas: manzanas.length,
      total_viviendas_planificadas: totalViviendas,

      // Detalle de cada manzana (solo campos reales)
      manzanas_detalle: manzanas.map(m => ({
        nombre: m.nombre,
        numero_viviendas: m.totalViviendas || m.numero_viviendas,
      })),

      // Nombres de manzanas (para visualización rápida)
      nombres_manzanas: manzanas.map(m => m.nombre).join(', '),

      // Timestamp
      timestamp_creacion: new Date().toISOString()
    }

    // 📊 Campos OPCIONALES: Solo agregar si tienen valor real (no por defecto)
    if (proyecto.estado && proyecto.estado !== 'en_planificacion') {
      metadataDetallada.proyecto_estado = proyecto.estado
    }

    if (proyecto.presupuesto && proyecto.presupuesto > 0) {
      metadataDetallada.proyecto_presupuesto = proyecto.presupuesto
      metadataDetallada.proyecto_presupuesto_formateado = `$${proyecto.presupuesto.toLocaleString('es-CO')}`
    }

    if (proyecto.responsable && proyecto.responsable !== 'RyR Constructora') {
      metadataDetallada.proyecto_responsable = proyecto.responsable
    }

    if (proyecto.telefono && proyecto.telefono !== '+57 300 000 0000') {
      metadataDetallada.proyecto_telefono = proyecto.telefono
    }

    if (proyecto.email && proyecto.email !== 'info@ryrconstrucora.com') {
      metadataDetallada.proyecto_email = proyecto.email
    }

    if (proyecto.fechaInicio || proyecto.fecha_inicio) {
      metadataDetallada.proyecto_fecha_inicio = proyecto.fechaInicio || proyecto.fecha_inicio
    }

    if (proyecto.fechaFinEstimada || proyecto.fecha_fin_estimada) {
      metadataDetallada.proyecto_fecha_fin_estimada = proyecto.fechaFinEstimada || proyecto.fecha_fin_estimada
    }

    return this.registrarAccion({
      tabla: 'proyectos',
      accion: 'CREATE',
      registroId: proyecto.id,
      datosNuevos: proyecto,
      metadata: metadataDetallada,
      modulo: 'proyectos'
    })
  }

  /**
   * 🆕 Auditar creación de VIVIENDA con metadata completa
   * Incluye información del proyecto y manzana asociados
   *
   * @example
   * ```ts
   * await auditService.auditarCreacionVivienda(vivienda, proyecto, manzana)
   * ```
   */
  async auditarCreacionVivienda(
    vivienda: any,
    proyecto?: any,
    manzana?: any
  ): Promise<void> {
    const metadataDetallada = {
      // Información de la vivienda
      vivienda_nombre: vivienda.nombre,
      vivienda_numero: vivienda.numero || vivienda.vivienda_numero,
      vivienda_valor_base: vivienda.valorBase || vivienda.valor_base,
      vivienda_valor_formateado: `$${(vivienda.valorBase || vivienda.valor_base)?.toLocaleString('es-CO')}`,
      vivienda_area: vivienda.area,
      vivienda_habitaciones: vivienda.habitaciones,
      vivienda_banos: vivienda.banos,
      vivienda_estado: vivienda.estado,
      vivienda_tipo: vivienda.tipo,

      // Información del proyecto (si está disponible)
      proyecto_id: proyecto?.id || vivienda.proyecto_id,
      proyecto_nombre: proyecto?.nombre,

      // Información de la manzana (si está disponible)
      manzana_id: manzana?.id || vivienda.manzana_id,
      manzana_nombre: manzana?.nombre,

      // Timestamp
      timestamp_creacion: new Date().toISOString()
    }

    return this.registrarAccion({
      tabla: 'viviendas',
      accion: 'CREATE',
      registroId: vivienda.id,
      datosNuevos: vivienda,
      metadata: metadataDetallada,
      modulo: 'viviendas'
    })
  }

  /**
   * 🆕 Auditar creación de CLIENTE con metadata completa
   *
   * @example
   * ```ts
   * await auditService.auditarCreacionCliente(cliente)
   * ```
   */
  async auditarCreacionCliente(cliente: any): Promise<void> {
    const metadataDetallada = {
      // Información del cliente
      cliente_nombre_completo: `${cliente.nombres} ${cliente.apellidos}`,
      cliente_tipo_documento: cliente.tipo_documento || cliente.tipoDocumento,
      cliente_numero_documento: cliente.numero_documento || cliente.numeroDocumento,
      cliente_telefono: cliente.telefono,
      cliente_email: cliente.email,
      cliente_ciudad: cliente.ciudad,
      cliente_departamento: cliente.departamento,
      cliente_estado: cliente.estado,
      cliente_origen: cliente.origen,
      cliente_referido_por: cliente.referido_por || cliente.referidoPor,

      // Timestamp
      timestamp_creacion: new Date().toISOString()
    }

    return this.registrarAccion({
      tabla: 'clientes',
      accion: 'CREATE',
      registroId: cliente.id,
      datosNuevos: cliente,
      metadata: metadataDetallada,
      modulo: 'clientes'
    })
  }

  /**
   * 🆕 Auditar creación de NEGOCIACIÓN con metadata completa
   *
   * @example
   * ```ts
   * await auditService.auditarCreacionNegociacion(negociacion, cliente, vivienda, proyecto)
   * ```
   */
  async auditarCreacionNegociacion(
    negociacion: any,
    cliente?: any,
    vivienda?: any,
    proyecto?: any
  ): Promise<void> {
    const metadataDetallada = {
      // Información de la negociación
      negociacion_estado: negociacion.estado,
      negociacion_valor_total: negociacion.valor_total || negociacion.valorTotal,
      negociacion_valor_formateado: `$${(negociacion.valor_total || negociacion.valorTotal)?.toLocaleString('es-CO')}`,
      negociacion_cuota_inicial: negociacion.cuota_inicial || negociacion.cuotaInicial,
      negociacion_saldo_pendiente: negociacion.saldo_pendiente || negociacion.saldoPendiente,
      negociacion_tipo_pago: negociacion.tipo_pago || negociacion.tipoPago,

      // Información del cliente
      cliente_id: cliente?.id || negociacion.cliente_id,
      cliente_nombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : null,
      cliente_documento: cliente?.numero_documento,

      // Información de la vivienda
      vivienda_id: vivienda?.id || negociacion.vivienda_id,
      vivienda_nombre: vivienda?.nombre,
      vivienda_numero: vivienda?.numero || vivienda?.vivienda_numero,

      // Información del proyecto
      proyecto_id: proyecto?.id || vivienda?.proyecto_id,
      proyecto_nombre: proyecto?.nombre,

      // Timestamp
      timestamp_creacion: new Date().toISOString()
    }

    return this.registrarAccion({
      tabla: 'negociaciones',
      accion: 'CREATE',
      registroId: negociacion.id,
      datosNuevos: negociacion,
      metadata: metadataDetallada,
      modulo: 'negociaciones'
    })
  }

  /**
   * Shorthand: Auditar actualización de un registro
   *
   * @example
   * ```ts
   * const viviendaAnterior = await obtenerVivienda(id)
   * const viviendaActualizada = await actualizarVivienda(id, cambios)
   * await auditService.auditarActualizacion(
   *   'viviendas',
   *   id,
   *   viviendaAnterior,
   *   viviendaActualizada,
   *   { campos_modificados: Object.keys(cambios) }
   * )
   * ```
   */
  async auditarActualizacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datosAnteriores: T,
    datosNuevos: T,
    metadata?: Record<string, any>,
    modulo?: ModuloAplicacion
  ): Promise<void> {
    return this.registrarAccion({
      tabla,
      accion: 'UPDATE',
      registroId,
      datosAnteriores,
      datosNuevos,
      metadata,
      modulo
    })
  }

  /**
   * Shorthand: Auditar eliminación de un registro
   *
   * @example
   * ```ts
   * const viviendaAEliminar = await obtenerVivienda(id)
   * await eliminarVivienda(id)
   * await auditService.auditarEliminacion('viviendas', id, viviendaAEliminar, {
   *   motivo: 'Solicitud de administrador'
   * })
   * ```
   */
  async auditarEliminacion<T>(
    tabla: TablaAuditable,
    registroId: string,
    datos: T,
    metadata?: Record<string, any>,
    modulo?: ModuloAplicacion
  ): Promise<void> {
    return this.registrarAccion({
      tabla,
      accion: 'DELETE',
      registroId,
      datosAnteriores: datos,
      metadata,
      modulo
    })
  }

  /**
   * Obtener historial completo de cambios de un registro específico
   *
   * @example
   * ```ts
   * const historial = await auditService.obtenerHistorial('viviendas', viviendaId)
   * ```
   */
  async obtenerHistorial(
    tabla: TablaAuditable,
    registroId: string,
    limit = 100
  ): Promise<AuditLogRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .eq('tabla', tabla)
        .eq('registro_id', registroId)
        .order('fecha_evento', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Error obteniendo historial:', error)
        return []
      }

      return data as AuditLogRecord[]
    } catch (error) {
      console.error('❌ Excepción obteniendo historial:', error)
      return []
    }
  }

  /**
   * Obtener actividad reciente de un usuario específico
   *
   * @example
   * ```ts
   * const actividad = await auditService.obtenerActividadUsuario(usuarioId, 7, 50)
   * ```
   */
  async obtenerActividadUsuario(
    usuarioId: string,
    dias = 30,
    limit = 100
  ): Promise<ActividadUsuario[]> {
    try {
      const { data, error } = await (supabase as any).rpc('obtener_actividad_usuario', {
        p_usuario_id: usuarioId,
        p_dias: dias,
        p_limit: limit
      })

      if (error) {
        console.error('❌ Error obteniendo actividad:', error)
        return []
      }

      return data as ActividadUsuario[]
    } catch (error) {
      console.error('❌ Excepción obteniendo actividad:', error)
      return []
    }
  }

  /**
   * Obtener cambios recientes (últimos N eventos)
   * Para dashboard de administrador
   *
   * @example
   * ```ts
   * const cambiosRecientes = await auditService.obtenerCambiosRecientes(100)
   * ```
   */
  async obtenerCambiosRecientes(limit = 100): Promise<AuditLogRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('audit_log')
        .select('*')
        .order('fecha_evento', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Error obteniendo cambios recientes:', error)
        return []
      }

      return data as AuditLogRecord[]
    } catch (error) {
      console.error('❌ Excepción obteniendo cambios recientes:', error)
      return []
    }
  }

  /**
   * Obtener resumen de auditoría por módulo
   *
   * @example
   * ```ts
   * const resumen = await auditService.obtenerResumenPorModulo()
   * ```
   */
  async obtenerResumenPorModulo(): Promise<ResumenPorModulo[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('v_auditoria_por_modulo')
        .select('*')
        .order('total_eventos', { ascending: false })

      if (error) {
        console.error('❌ Error obteniendo resumen:', error)
        return []
      }

      return data as ResumenPorModulo[]
    } catch (error) {
      console.error('❌ Excepción obteniendo resumen:', error)
      return []
    }
  }

  /**
   * Detectar eliminaciones masivas sospechosas
   *
   * @example
   * ```ts
   * const eliminacionesMasivas = await auditService.detectarEliminacionesMasivas(7, 5)
   * ```
   */
  async detectarEliminacionesMasivas(dias = 7, umbral = 5) {
    try {
      const { data, error } = await (supabase as any).rpc('detectar_eliminaciones_masivas', {
        p_dias: dias,
        p_umbral: umbral
      })

      if (error) {
        console.error('❌ Error detectando eliminaciones masivas:', error)
        return []
      }

      return data
    } catch (error) {
      console.error('❌ Excepción detectando eliminaciones masivas:', error)
      return []
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS / UTILIDADES
  // =====================================================

  /**
   * Calcula las diferencias entre dos objetos
   * Solo retorna los campos que cambiaron
   *
   * @private
   */
  private calcularCambios(antes: any, despues: any): Record<string, { antes: any; despues: any }> {
    const cambios: Record<string, { antes: any; despues: any }> = {}

    // Obtener todas las claves del objeto nuevo
    const claves = Object.keys(despues)

    for (const clave of claves) {
      // Comparar valores usando JSON.stringify para objetos complejos
      const valorAntes = antes[clave]
      const valorDespues = despues[clave]

      if (JSON.stringify(valorAntes) !== JSON.stringify(valorDespues)) {
        cambios[clave] = {
          antes: valorAntes,
          despues: valorDespues
        }
      }
    }

    return cambios
  }

  /**
   * Infiere el módulo a partir del nombre de la tabla
   *
   * @private
   */
  private inferirModulo(tabla: TablaAuditable): ModuloAplicacion {
    const mapa: Record<TablaAuditable, ModuloAplicacion> = {
      viviendas: 'viviendas',
      clientes: 'clientes',
      negociaciones: 'negociaciones',
      abonos_historial: 'abonos',
      fuentes_pago: 'abonos',
      renuncias: 'renuncias',
      procesos_negociacion: 'procesos',
      proyectos: 'proyectos',
      manzanas: 'proyectos',
      usuarios: 'usuarios',
      documentos_proyecto: 'documentos',
      documentos_cliente: 'documentos',
      categorias_documento: 'documentos'
    }

    return mapa[tabla] || 'admin'
  }
}

// =====================================================
// EXPORTAR INSTANCIA ÚNICA (Singleton)
// =====================================================

/**
 * Instancia única del servicio de auditoría
 *
 * @example
 * ```ts
 * import { auditService } from '@/services/audit.service'
 *
 * // Auditar creación
 * await auditService.auditarCreacion('viviendas', id, datos)
 *
 * // Auditar actualización
 * await auditService.auditarActualizacion('clientes', id, antes, despues)
 *
 * // Obtener historial
 * const historial = await auditService.obtenerHistorial('viviendas', id)
 * ```
 */
export const auditService = new AuditService()

/**
 * Exportar también la clase para testing
 */
export { AuditService }
