import { supabase } from '@/lib/supabase/client-browser'

export type TipoEventoSeguridad =
  | 'login_exitoso'
  | 'login_fallido'
  | 'logout'
  | 'password_reset_solicitado'
  | 'password_reset_completado'
  | 'session_expirada'
  | 'cuenta_bloqueada'
  | 'cuenta_desbloqueada'

interface LogSecurityEventParams {
  tipo: TipoEventoSeguridad
  usuarioEmail: string
  metadata?: Record<string, any>
}

/**
 * Servicio para registrar eventos de seguridad en la auditoría
 * Cumple con requisitos de trazabilidad y detección de anomalías
 */
class AuditLogService {
  /**
   * Registra un evento de seguridad
   *
   * @example
   * await auditLogService.logSecurityEvent({
   *   tipo: 'login_exitoso',
   *   usuarioEmail: 'user@example.com',
   *   metadata: { dispositivo: 'Chrome/Windows' }
   * })
   */
  async logSecurityEvent({
    tipo,
    usuarioEmail,
    metadata = {},
  }: LogSecurityEventParams): Promise<void> {
    try {
      // Obtener información adicional del navegador
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'

      // Obtener usuario actual si está autenticado
      const { data: { user } } = await supabase.auth.getUser()

      const logData = {
        tipo,
        usuario_email: usuarioEmail,
        usuario_id: user?.id || null,
        user_agent: userAgent,
        metadata: {
          ...metadata,
          timestamp_cliente: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : null,
        },
      }

      const { error } = await supabase
        .from('audit_log_seguridad')
        .insert(logData)

      if (error) {
        console.error('❌ Error registrando evento de auditoría:', error)
        // No lanzar error para no interrumpir el flujo principal
      } else {
        console.log(`📝 Evento registrado: ${tipo} - ${usuarioEmail}`)
      }
    } catch (error) {
      console.error('❌ Excepción en logSecurityEvent:', error)
      // Fallar silenciosamente para no afectar la experiencia del usuario
    }
  }

  /**
   * Registra un login exitoso
   */
  async logLoginExitoso(usuarioEmail: string, metadata?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'login_exitoso',
      usuarioEmail,
      metadata,
    })
  }

  /**
   * Registra un intento de login fallido
   */
  async logLoginFallido(usuarioEmail: string, intentosRestantes: number): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'login_fallido',
      usuarioEmail,
      metadata: {
        intentos_restantes: intentosRestantes,
      },
    })
  }

  /**
   * Registra un logout
   */
  async logLogout(usuarioEmail: string): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'logout',
      usuarioEmail,
    })
  }

  /**
   * Registra una solicitud de reset de contraseña
   */
  async logPasswordResetSolicitado(usuarioEmail: string): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'password_reset_solicitado',
      usuarioEmail,
    })
  }

  /**
   * Registra una sesión expirada
   */
  async logSessionExpirada(usuarioEmail: string, duracionMinutos: number): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'session_expirada',
      usuarioEmail,
      metadata: {
        duracion_minutos: duracionMinutos,
      },
    })
  }

  /**
   * Registra un bloqueo de cuenta por intentos fallidos
   */
  async logCuentaBloqueada(usuarioEmail: string, minutosBloqueo: number): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'cuenta_bloqueada',
      usuarioEmail,
      metadata: {
        minutos_bloqueo: minutosBloqueo,
      },
    })
  }

  /**
   * Obtiene el historial de eventos de un usuario
   */
  async obtenerHistorialUsuario(usuarioEmail: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_log_seguridad')
      .select('*')
      .eq('usuario_email', usuarioEmail)
      .order('fecha_evento', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error obteniendo historial:', error)
      return []
    }

    return data
  }

  /**
   * Obtiene resumen de seguridad de un usuario (últimos 30 días)
   */
  async obtenerResumenSeguridad(usuarioEmail: string) {
    const { data, error } = await supabase
      .rpc('obtener_resumen_seguridad', {
        p_usuario_email: usuarioEmail,
      })

    if (error) {
      console.error('Error obteniendo resumen de seguridad:', error)
      return null
    }

    return data?.[0] || null
  }
}

// Exportar instancia única (singleton)
export const auditLogService = new AuditLogService()
