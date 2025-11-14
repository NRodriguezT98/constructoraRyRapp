/**
 * ============================================
 * SERVICIO DE GESTIÓN DE USUARIOS
 * ============================================
 *
 * Funciones para CRUD de usuarios, creación con Admin API,
 * gestión de roles y permisos.
 */

import { supabase } from '@/lib/supabase/client'

import type {
    ActualizarUsuarioData,
    CrearUsuarioData,
    CrearUsuarioRespuesta,
    EstadisticasUsuarios,
    FiltrosUsuarios,
    Rol,
    Usuario,
    UsuarioCompleto,
} from '../types'

/**
 * Generar contraseña segura aleatoria
 */
function generarPasswordTemporal(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  // Asegurar al menos: 1 mayúscula, 1 minúscula, 1 número, 1 especial
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]

  // Rellenar resto
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }

  // Mezclar caracteres
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

class UsuariosService {
  /**
   * Obtener todos los usuarios con filtros
   */
  async obtenerUsuarios(filtros?: FiltrosUsuarios): Promise<UsuarioCompleto[]> {
    try {
      let query = supabase.from('vista_usuarios_completos').select('*')

      // Aplicar filtros
      if (filtros?.busqueda) {
        const busqueda = `%${filtros.busqueda}%`
        query = query.or(`nombres.ilike.${busqueda},apellidos.ilike.${busqueda},email.ilike.${busqueda}`)
      }

      if (filtros?.rol) {
        query = query.eq('rol', filtros.rol)
      }

      if (filtros?.estado) {
        query = query.eq('estado', filtros.estado)
      }

      // Note: vista_usuarios_completos no tiene campo creado_por
      // if (filtros?.creado_por) {
      //   query = query.eq('creado_por', filtros.creado_por)
      // }

      // Ordenar por fecha de creación descendente
      query = query.order('fecha_creacion', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error obteniendo usuarios:', error)
        throw new Error(`Error al obtener usuarios: ${error.message}`)
      }

      return (data || []) as unknown as UsuarioCompleto[]
    } catch (error) {
      console.error('Excepción en obtenerUsuarios:', error)
      throw error
    }
  }

  /**
   * Obtener usuario por ID
   */
  async obtenerUsuarioPorId(id: string): Promise<UsuarioCompleto | null> {
    try {
      const { data, error } = await supabase
        .from('vista_usuarios_completos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        console.error('Error obteniendo usuario:', error)
        throw new Error(`Error al obtener usuario: ${error.message}`)
      }

      return data as unknown as UsuarioCompleto
    } catch (error) {
      console.error('Excepción en obtenerUsuarioPorId:', error)
      throw error
    }
  }

  /**
   * Crear nuevo usuario (Admin API)
   *
   * IMPORTANTE: Requiere rol de Administrador
   */
  async crearUsuario(datos: CrearUsuarioData): Promise<CrearUsuarioRespuesta> {
    try {
      // Generar contraseña si no se proporcionó
      const passwordTemporal = datos.password || generarPasswordTemporal()
      const passwordProporcionado = !!datos.password

      // Obtener usuario actual (admin)
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      if (!adminUser) {
        throw new Error('No autenticado')
      }

      // Verificar que el usuario actual es admin
      const { data: adminPerfil, error: adminError } = await supabase
        .from('usuarios')
        .select('rol, estado')
        .eq('id', adminUser.id)
        .single()

      if (adminError || adminPerfil?.rol !== 'Administrador' || adminPerfil?.estado !== 'Activo') {
        throw new Error('No tienes permisos para crear usuarios')
      }

      // Crear usuario en auth.users usando Admin API
      // NOTA: Esto debe hacerse desde una función de Edge Function o API Route
      // Por ahora, usaremos signUp y luego actualizaremos el perfil

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: datos.email,
        password: passwordTemporal,
        options: {
          data: {
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            rol: datos.rol,
          },
          emailRedirectTo: undefined, // No enviar email de confirmación por defecto
        },
      })

      if (authError) {
        console.error('Error creando usuario en auth:', authError)
        throw new Error(`Error al crear usuario: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      // El trigger handle_new_user creará automáticamente el perfil en la tabla usuarios
      // Esperar un momento para que el trigger se ejecute
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Actualizar información adicional del perfil
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          telefono: datos.telefono || null,
          creado_por: adminUser.id,
          debe_cambiar_password: !passwordProporcionado, // Si es generada, debe cambiarla
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Error actualizando perfil de usuario:', updateError)
        // No lanzar error aquí, el usuario se creó correctamente
      }

      // Obtener el usuario completo
      const usuarioCreado = await this.obtenerUsuarioPorId(authData.user.id)

      if (!usuarioCreado) {
        throw new Error('Usuario creado pero no se pudo obtener el perfil')
      }

      return {
        usuario: usuarioCreado,
        password_temporal: passwordProporcionado ? undefined : passwordTemporal,
        invitacion_enviada: datos.enviar_invitacion || false,
      }
    } catch (error) {
      console.error('Excepción en crearUsuario:', error)
      throw error
    }
  }

  /**
   * Actualizar usuario existente
   */
  async actualizarUsuario(id: string, datos: ActualizarUsuarioData): Promise<Usuario> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando usuario:', error)
        throw new Error(`Error al actualizar usuario: ${error.message}`)
      }

      return data as unknown as Usuario
    } catch (error) {
      console.error('Excepción en actualizarUsuario:', error)
      throw error
    }
  }

  /**
   * Cambiar estado de usuario
   */
  async cambiarEstado(id: string, nuevoEstado: 'Activo' | 'Inactivo' | 'Bloqueado'): Promise<void> {
    try {
      await this.actualizarUsuario(id, { estado: nuevoEstado })
    } catch (error) {
      console.error('Excepción en cambiarEstado:', error)
      throw error
    }
  }

  /**
   * Cambiar rol de usuario
   */
  async cambiarRol(id: string, nuevoRol: Rol): Promise<void> {
    try {
      await this.actualizarUsuario(id, { rol: nuevoRol })
    } catch (error) {
      console.error('Excepción en cambiarRol:', error)
      throw error
    }
  }

  /**
   * Resetear intentos fallidos de login
   */
  async resetearIntentosFallidos(id: string): Promise<void> {
    try {
      await this.actualizarUsuario(id, {
        estado: 'Activo',
      })
    } catch (error) {
      console.error('Excepción en resetearIntentosFallidos:', error)
      throw error
    }
  }

  /**
   * Eliminar usuario (soft delete desactivando)
   */
  async eliminarUsuario(id: string): Promise<void> {
    try {
      // En lugar de eliminar, marcar como Inactivo
      await this.cambiarEstado(id, 'Inactivo')
    } catch (error) {
      console.error('Excepción en eliminarUsuario:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async obtenerEstadisticas(): Promise<EstadisticasUsuarios> {
    try {
      const usuarios = await this.obtenerUsuarios()

      const stats: EstadisticasUsuarios = {
        total: usuarios.length,
        por_rol: {
          Administrador: 0,
          Contador: 0,
          Supervisor: 0,
          Gerente: 0,
        },
        por_estado: {
          Activo: 0,
          Inactivo: 0,
          Bloqueado: 0,
        },
        activos_hoy: 0,
        bloqueados: 0,
      }

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      usuarios.forEach((u) => {
        // Contar por rol
        stats.por_rol[u.rol]++

        // Contar por estado
        stats.por_estado[u.estado]++

        // Contar activos hoy
        if (u.ultimo_acceso && new Date(u.ultimo_acceso) >= hoy) {
          stats.activos_hoy++
        }

        // Contar bloqueados
        if (u.estado === 'Bloqueado') {
          stats.bloqueados++
        }
      })

      return stats
    } catch (error) {
      console.error('Excepción en obtenerEstadisticas:', error)
      throw error
    }
  }

  /**
   * Actualizar último acceso del usuario actual
   */
  async actualizarUltimoAcceso(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', user.id)
    } catch (error) {
      console.error('Excepción en actualizarUltimoAcceso:', error)
      // No lanzar error, es solo tracking
    }
  }
}

// Exportar instancia única (singleton)
export const usuariosService = new UsuariosService()
